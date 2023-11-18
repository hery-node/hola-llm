const path = require("path");
const { to_fixed2 } = require('hola-server').number;
const { file_prefix } = require('hola-server').file;
const { format_date_time } = require('hola-server').date;
const { oid_query, is_log_info, log_info, Entity, get_entity_meta } = require('hola-server');
const { run_simple_cmd, run_simple_local_cmd, run_script, scpr } = require('hola-server').bash;

const { parse_json } = require('./json');
const { get_user_key_path, sync_files, get_remote_docker_path, get_remote_bash_dir, get_remote_bash_path, get_docker_bash_path, write_file, get_bash_dir } = require("./file");

const LOG_EXEC = "exec";
const STATUS_RUNNING = 1;
const STATUS_STOPPED = 0;

const get_docker_instance_name = async (docker_id) => {
    const docker_entity = new Entity(get_entity_meta("docker"));
    const docker = await docker_entity.find_by_oid(docker_id, { "name": 1 });
    return docker.name.toLowerCase().replaceAll(" ", "_");
}

const get_host_ssh_info = async (id) => {
    const host_entity = new Entity(get_entity_meta("host"));
    const host = await host_entity.find_by_oid(id);
    const key_path = await get_user_key_path(host.owner, host.key);
    host.auth = `-i ${key_path} ${host.ssh ? host.ssh : ""}`;

    if (!host.port) {
        host.port = 22;
    }

    host.home = host.home ? host.home : "~";
    return host;
}

const get_bash_aliases = async (host, in_docker) => {
    const commands = [];
    const bash_entity = new Entity(get_entity_meta("bash"));
    const bashes = await bash_entity.find({ "owner": host.owner }, { "alias": 1, "subprocess": 1 });
    for (let i = 0; i < bashes.length; i++) {
        const bash = bashes[i];
        const bash_path = in_docker ? await get_docker_bash_path(bash._id) : await get_remote_bash_path(host.owner, bash._id, host.home);
        if (bash && bash.alias && bash.alias.trim().length > 0) {
            const exec = bash.subprocess ? "bash" : "source";
            commands.push(`alias ${bash.alias.trim()}="${exec} ${bash_path}"`);
        }
    }
    return commands;
}

const get_default_env_commands = async (host_id) => {
    const host = await get_host_ssh_info(host_id);
    const bash_home = await get_remote_bash_dir(host.owner, host.home);

    const commands = [];
    commands.push(`export HHOME="${host.home}"`);
    commands.push(`export HIP="${host.ip}"`);
    commands.push(`export HUSER="${host.user}"`);
    commands.push(`export BHOME="${bash_home}"`);
    commands.push(`export DHOME="${host.home}"`);
    commands.push(`alias cenv="source ${bash_home}/env.sh"`);
    commands.push(`alias cdhome="cd $HHOME"`);
    commands.push(`alias cdb="cd ${bash_home}"`);
    commands.push(`alias dops="docker ps"`);
    commands.push(`alias dopa="docker ps --all"`);
    commands.push(`alias hsmi="sudo watch -n 1 hl-smi"`);
    commands.push(`alias nsmi="sudo watch -n 1 nvidia-smi"`);
    commands.push(...await get_bash_aliases(host));

    return commands;
}

/**
 * get exec record name by user's definition
 * @param {*} host 
 * @param {*} exec 
 * @param {*} time 
 * @returns 
 */
const get_record_name = async (host, exec, time) => {
    const docker_instance_name = await get_docker_instance_name(exec.docker);
    const name_cmd = `source /bhome/docker_env.sh && export TIME="${time}" && echo "${exec.record}"`;
    const docker_name_cmd = `docker exec ${docker_instance_name} /bin/bash -c '${name_cmd}'`;
    const { err, stdout } = await run_script(host, docker_name_cmd);
    return err ? time : (stdout ? stdout.trim() : time);
}

/**
 * This is for web ssh console for the host list to init ssh console.
 * @param {*} host_id 
 * @returns 
 */
const init_host_env_command = async (host_id) => {
    const host = await get_host_ssh_info(host_id);
    const log_extra = { "user": host.owner };
    const bash_home = await get_bash_dir(host.owner);
    const env_path = `${bash_home}/env.sh`;
    const commands = await get_default_env_commands(host_id);

    await write_file(env_path, commands.join("\n"));
    await run_simple_local_cmd(`chmod u+x ${env_path}`);
    const sync = await sync_files(host.owner, host);
    const remote_bash_home = await get_remote_bash_dir(host.owner, host.home);
    if (!sync) {
        //sync env individually
        await scpr(host, env_path, `${remote_bash_home}/env.sh`, log_extra);
    }
    return `source ${remote_bash_home}/env.sh`;
}

const Execution = class {
    constructor(entity, id) {
        this.entity = entity;
        this.id = id;
        this.log_entity = new Entity(get_entity_meta("log"));
        this.model_entity = new Entity(get_entity_meta("model"));
        this.bash_entity = new Entity(get_entity_meta("bash"));
        this.record_entity = new Entity(get_entity_meta("record"));
    }

    async init() {
        this.instance = await this.entity.find_by_oid(this.id);
        this.host = await get_host_ssh_info(this.instance.host);
        this.model = this.instance.model ? await this.model_entity.find_by_oid(this.instance.model) : null;
        const bash = await this.bash_entity.find_by_oid(this.instance.script, { "subprocess": 1 });
        this.bash_exec = bash.subprocess ? "bash" : "source";
    }

    /**
     * Just need init once
     * @param {env provided for user to override system env } env 
     */
    async _init_exec_env(env) {
        const exec = this.instance;
        const host = this.host;

        const commands = await get_default_env_commands(exec.host);
        const bash_home = await get_bash_dir(host.owner);

        const docker_instance_name = await get_docker_instance_name(exec.docker);
        const docker_file_path = await get_remote_docker_path(exec.owner, exec.docker, host.home);
        commands.push(`alias doc="source ${docker_file_path}"`);
        commands.push(`alias dos="docker start ${docker_instance_name}"`);
        commands.push(`alias dost="docker stop ${docker_instance_name}"`);
        commands.push(`alias doe="docker exec -it ${docker_instance_name} /bin/bash"`);
        commands.push(`alias dor="docker rm ${docker_instance_name}"`);
        commands.push(`alias dorm="docker rmi ${docker_instance_name}_img"`);

        const docker_commands = [];
        docker_commands.push(`export BHOME="/bhome"`);
        docker_commands.push(`export DHOME="/dhome"`);
        docker_commands.push(`export CHECKPOINT="/checkpoint"`);
        if (this.model) {
            const model_dir = this.model.path.startsWith("/") ? `/dhome${this.model.path}` : `/dhome/${this.model.path}`;
            docker_commands.push(`export MODEL_NAME="${this.model.name}"`);
            docker_commands.push(`export MODEL_TYPE="${this.model.type}"`);
            docker_commands.push(`export MODEL_PATH="${model_dir}"`);
            docker_commands.push(`alias cdm="cd $MODEL_PATH"`);
        }
        //put env here just for user to override system env setting, so just docker need this
        env && docker_commands.push(env);
        docker_commands.push(`alias cenv="source /bhome/docker_env.sh"`);
        docker_commands.push(`alias cdb="cd $BHOME"`);
        docker_commands.push(`alias cdhome="cd $DHOME"`);
        docker_commands.push(`alias cdc="cd $CHECKPOINT"`);
        docker_commands.push(...await get_bash_aliases(host, true));

        const bash_path = await get_docker_bash_path(exec.script);
        docker_commands.push(`alias run="${this.bash_exec} ${bash_path}"`);

        const docker_env_path = `${bash_home}/docker_env.sh`;
        await write_file(docker_env_path, docker_commands.join("\n"));
        await run_simple_local_cmd(`chmod u+x ${docker_env_path}`);

        const env_path = `${bash_home}/env.sh`;
        await write_file(env_path, commands.join("\n"));
        await run_simple_local_cmd(`chmod u+x ${env_path}`);
        const sync = await sync_files(exec.owner, host);
        if (!sync) {
            const remote_bash_home = await get_remote_bash_dir(host.owner, host.home);
            //sync env individually
            await scpr(host, `${bash_home}/docker_env.sh`, `${remote_bash_home}/docker_env.sh`, { "user": host.owner });
            await scpr(host, `${bash_home}/env.sh`, `${remote_bash_home}/env.sh`, { "user": host.owner });
        }
    }

    async set_progress_clear_log() {
        await this._update_status(STATUS_RUNNING);
        await this._update_progress(1);
        //auto clear log first
        await this.log_entity.delete({ "user": this.instance.owner, "obj_id": this.id });
    }

    async run() {
        //to start docker first
        const hello_cmd = await this._get_exec_cmd("echo hello");
        await run_script(this.host, hello_cmd);

        const envs = await this._get_loop_envs();
        for (let i = 0; i < envs.length; i++) {
            await this._init_exec_env(envs[i].env);
            await this._run_in_env(envs[i].env, envs[i].obj);
            await this._update_progress(100 * (i + 1) / envs.length);
        }
        await this._update_status(STATUS_STOPPED);
        await this._update_progress(100);
    }

    async _run_in_env(exec_env, env_obj) {
        const exec = this.instance;
        const time = format_date_time(new Date());
        const record_name = exec.record ? await get_record_name(this.host, exec, time) : time;
        const query = { "name": record_name, "owner": exec.owner, "exec": this.id };
        const total = await this.record_entity.count(query);
        if (total > 0) {
            if (is_log_info()) {
                log_info(LOG_EXEC, `Execution ${record_name} has already run, so ignore it, if you want to run it again, please delete ${record_name} first.`, this._get_log_extra());
            }
            return;
        }

        const cmd = await this._get_exec_cmd();
        const { err, stdout } = await run_script(this.host, cmd);
        const log = err ? `Error Message:\n${err}\nCommand Output:\n${stdout}` : stdout;
        const record = { name: record_name, time: time, log: log, exec: this.id, env: exec_env, cmd: cmd };
        const docker_instance_name = await get_docker_instance_name(exec.docker);

        const log_names = [];
        const jsons = await run_simple_cmd(this.host, `docker exec ${docker_instance_name} /bin/bash -c "ls /log/*.json"`);
        if (jsons) {
            const files = jsons.split("\n");
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const content = await run_simple_cmd(this.host, `docker exec ${docker_instance_name} /bin/bash -c "cat ${file}"`);
                const base_name = path.basename(file);
                const log_name = file_prefix(base_name);
                log_names.push(log_name);
                content && (record[log_name] = parse_json(base_name, content, record.name, this._get_log_extra()));
            }
        }
        record.log_names = log_names;

        const perf = record["performance"];
        const result = {};
        if (perf) {
            //for training
            perf["samples_per_second"] && (result["samples_per_second"] = to_fixed2(perf["samples_per_second"]));
            perf["steps_per_second"] && (result["steps_per_second"] = to_fixed2(perf["steps_per_second"]));
            perf["loss"] && (result["loss"] = to_fixed2(perf["loss"]));
            perf["perplexity"] && (result["perplexity"] = to_fixed2(perf["perplexity"]));
            perf["max_memory"] && (result["max_memory"] = to_fixed2(perf["max_memory"]));
            //for inference
            perf["throughput"] && (result["throughput"] = to_fixed2(perf["throughput"]));
            perf["latency"] && (result["latency"] = to_fixed2(perf["latency"]));
            perf["first_token"] && (result["first_token"] = to_fixed2(perf["first_token"]));

            record.result = { ...env_obj, ...perf, ...result };
        }

        await this.record_entity.update(query, { ...record, ...result });
        if (is_log_info()) {
            log_info(LOG_EXEC, `Execution for: \n${exec_env} \n is completed successfully.`, this._get_log_extra());
        }
    }

    async stop() {
        const exec = this.instance;
        if (exec.docker && exec.docker.length > 0) {
            const docker_name = await get_docker_instance_name(exec.docker);
            await run_simple_cmd(this.host, `docker stop ${docker_name}`);
        }
        await this._update_status(STATUS_STOPPED);
        await this._update_progress(100);
    }

    async get_web_socket_command() {
        const envs = await this._get_loop_envs();
        await this._init_exec_env(envs[0].env);
        return this._get_exec_cmd();
    }

    _get_export_command(param) {
        const keys = Object.keys(param);
        if (keys.length == 0) {
            return "";
        }
        const commands = [];
        for (const key of keys) {
            const value = param[key];
            commands.push(typeof value === "string" ? `${key}="${value}";` : `${key}=${value};`);
        }
        return commands.join("\n");
    }

    async _get_loop_envs() {
        const exec = this.instance;
        const loop_envs = exec.loop_envs;
        if (!loop_envs || loop_envs.length == 0) {
            return [{ env: exec.env }];
        }

        const envs_list = [];
        for (let i = 0; i < loop_envs.length; i++) {
            const env = loop_envs[i];
            envs_list.push({ obj: env, env: `${this._get_export_command(env)}\n${exec.env}` });
        }
        return envs_list;
    }

    async _get_exec_cmd(exec_cmd) {
        const exec = this.instance;
        const host = this.host;
        const remote_bash_home = await get_remote_bash_dir(host.owner, host.home);

        const commands = [];
        commands.push(`source ${remote_bash_home}/env.sh`);

        const docker_file_path = await get_remote_docker_path(exec.owner, exec.docker, host.home);
        commands.push(`source ${docker_file_path}`);

        const docker_instance_name = await get_docker_instance_name(exec.docker);
        if (exec_cmd) {
            commands.push(`docker exec ${docker_instance_name} /bin/bash -c "source /bhome/docker_env.sh && ${exec_cmd}"`);
        } else {
            const bash_path = await get_docker_bash_path(exec.script);
            commands.push(`docker exec ${docker_instance_name} /bin/bash -c "source /bhome/docker_env.sh && ${this.bash_exec} ${bash_path}"`);
        }

        return commands.join("\n");
    }

    _get_log_extra() {
        return { obj_id: this.id };
    }

    async _update_status(status) {
        await this.entity.update(oid_query(this.id), { status: status });
    }

    async _update_progress(progress) {
        await this.entity.update(oid_query(this.id), { progress: parseInt(progress) });
    }
}

module.exports = { Execution, init_host_env_command, get_docker_instance_name, get_host_ssh_info };