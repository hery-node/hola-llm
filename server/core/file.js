const fs = require('fs');
const { run_simple_local_cmd, run_simple_cmd } = require('hola-server/core/bash');
const { Entity, get_entity_meta, oid_query, is_log_info, log_info } = require('hola-server');

const get_home_dir = (home, user_id) => {
    const home_dir = home ? home : "~";
    return `${home_dir}/.charmer/u${user_id}`
}

const get_base_dir = async (user_id) => {
    const home = await run_simple_local_cmd("echo ~");
    return get_home_dir(home, user_id);
}

const get_user_key_path = async (user_id, key_id) => {
    const base = await get_base_dir(user_id);
    const path = `${base}/ssh`;
    await run_simple_local_cmd(`mkdir -p ${path}`);
    return `${path}/k${key_id}`;
}

const get_docker_path = async (user_id, docker_id) => {
    const base = await get_base_dir(user_id);
    const path = `${base}/docker`;
    await run_simple_local_cmd(`mkdir -p ${path}`);
    return `${path}/d${docker_id}`;
}

const get_remote_docker_path = async (user_id, docker_id, home_dir) => {
    const base = get_home_dir(home_dir, user_id);
    const path = `${base}/docker`;
    return `${path}/d${docker_id}`;
}

const get_bash_dir = async (user_id) => {
    const base = await get_base_dir(user_id);
    const path = `${base}/bash`;
    await run_simple_local_cmd(`mkdir -p ${path}`);
    return path;
}

const get_bash_path = async (user_id, bash_id) => {
    const dir = await get_bash_dir(user_id);
    return `${dir}/b${bash_id}`;
}

const get_remote_bash_dir = async (user_id, home_dir) => {
    const base = get_home_dir(home_dir, user_id);
    return `${base}/bash`;
}

const get_remote_bash_path = async (user_id, bash_id, home_dir) => {
    const dir = await get_remote_bash_dir(user_id, home_dir);
    return `${dir}/b${bash_id}`;
}

const get_docker_bash_path = async (bash_id) => {
    return `/bhome/b${bash_id}`;
}

const write_file = async (path, content) => {
    await fs.promises.writeFile(path, content);
}

const delete_file = async (path) => {
    await fs.promises.unlink(path);
}

const update_host_sync_status = async (uid) => {
    const host_entity = new Entity(get_entity_meta("host"));
    await host_entity.update({ "owner": uid }, { "synced": false });
    if (is_log_info()) {
        log_info("sync", `Update all the host synced status to false.`, { "user": uid });
    }
}

const sync_files = async (uid, host) => {
    if (host.synced) {
        if (is_log_info()) {
            log_info("sync", `Host ${host.name} has been synced. So ignore sync files.`, { "user": uid });
        }
        return false;
    }

    const base = await get_base_dir(uid);
    const folders = [`docker`, `bash`];
    const dest_folder = get_home_dir(host.home, uid);

    let synced = true;
    for (const folder of folders) {
        await run_simple_cmd(host, `mkdir -p ${dest_folder}/${folder}`);
        const cmd = `rsync -avz --delete -e "ssh -p ${host.port} ${host.auth} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" ${base}/${folder}/ ${host.user}@${host.ip}:${dest_folder}/${folder}`;
        const result = await run_simple_local_cmd(cmd);
        //sync error
        if (result == null) {
            synced = false;
        }
    }

    if (synced) {
        //after sync, mark synced to true
        const host_entity = new Entity(get_entity_meta("host"));
        await host_entity.update(oid_query(host._id), { "synced": true });
        if (is_log_info()) {
            log_info("sync", `Host ${host.name} sync file successfully.`, { "user": uid });
        }
        return true;
    } else {
        return false;
    }
}

module.exports = {
    get_home_dir, get_base_dir, get_user_key_path, get_docker_path, get_bash_path,
    write_file, delete_file, sync_files, update_host_sync_status,
    get_remote_docker_path, get_docker_bash_path, get_remote_bash_path, get_remote_bash_dir, get_bash_dir
}