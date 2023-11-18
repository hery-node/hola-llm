const { wrap_http } = require('hola-server').err;
const { to_fixed2 } = require('hola-server').number;
const { has_value } = require('hola-server').validate;
const { required_get_params } = require('hola-server').params;
const { SUCCESS, NO_PARAMS, ERROR } = require('hola-server').code;
const { init_router, Entity, get_entity_meta } = require('hola-server');

const { parse_envs } = require('../core/env');
const { Execution } = require('../core/execution');

const set_env_info = (exec) => {
    if (has_value(exec.loop)) {
        const { errors, envs } = parse_envs(exec.loop);
        if (errors) {
            return { code: ERROR, err: errors.join("\n") };
        } else {
            exec.loop_envs = envs;
        }

    }
    return { code: SUCCESS };
}

module.exports = init_router({
    collection: "exec",
    creatable: true,
    readable: true,
    updatable: true,
    cloneable: true,
    deleteable: true,
    primary_keys: ["owner", "name", "type"],
    ref_label: "name",
    user_field: "owner",
    fields: [
        { name: "owner", required: true, ref: "user", delete: "cascade" },
        { name: "name", type: "string", required: true },
        { name: "type", type: "int", required: true, list: false },
        { name: "loop", type: "lstr", search: false, list: false },
        { name: "loop_envs", type: "array", search: false, list: false },
        { name: "env", type: "lstr", search: false, list: false },
        { name: "host", type: "string", ref: "host", required: true },
        { name: "docker", type: "string", ref: "docker", required: true },
        { name: "model", type: "string", ref: "model" },
        { name: "script", type: "string", ref: "bash", required: true },
        { name: "record", type: "string", list: false, search: false },
        { name: "measure", type: "array", ref: "measure", search: false, list: false },
        // below are property used for system
        { name: "progress", type: "progress", create: false, search: false },
        //user can stop the task when needed
        { name: "status", type: "job_status", create: false, search: false },
    ],

    before_create: async (entity, obj) => {
        return set_env_info(obj);
    },

    before_update: async (_id, entity, obj) => {
        return set_env_info(obj);
    },

    before_clone: async (_id, entity, obj) => {
        return set_env_info(obj);
    },

    route: (router, meta) => {
        const entity = new Entity(meta);

        router.get('/stop', wrap_http(async function (req, res) {
            const params = required_get_params(req, ["id"]);
            if (params === null) {
                res.json({ code: NO_PARAMS, err: '[id] checking params are failed!' });
                return;
            }

            const { id } = params;
            const execution = new Execution(entity, id);
            await execution.init();
            await execution.stop();

            res.json({ code: SUCCESS });
        }));

        router.get('/run', wrap_http(async function (req, res) {
            const params = required_get_params(req, ["id"]);
            if (params === null) {
                res.json({ code: NO_PARAMS, err: '[id] checking params are failed!' });
                return;
            }

            const { id } = params;
            const execution = new Execution(entity, id);
            await execution.init();
            await execution.set_progress_clear_log();
            //give response quick and dirty
            res.json({ code: SUCCESS });
            await execution.run();
        }));

        router.get('/combine_results', wrap_http(async function (req, res) {
            const params = required_get_params(req, ["id"]);
            if (params === null) {
                res.json({ code: NO_PARAMS, err: '[id] checking params are failed!' });
                return;
            }
            const { id } = params;

            const record_entity = new Entity(get_entity_meta("record"));
            const records = await record_entity.find({ exec: id }, { "result": 1 });
            res.json({ code: SUCCESS, data: records.map(r => r["result"]) });
        }));

        router.get('/compare_results', wrap_http(async function (req, res) {
            const params = required_get_params(req, ["ids", "attr"]);
            if (params === null) {
                res.json({ code: NO_PARAMS, err: '[ids] checking params are failed!' });
                return;
            }

            const { ids, attr } = params;
            const id_array = ids.split(",");
            if (id_array.length < 2) {
                res.json({ code: ERROR, err: 'ids length is less than 2!' });
            }

            const id_key = "_id";
            const name_key = "Name";
            const boost_key = "Boost";

            const record_entity = new Entity(get_entity_meta("record"));
            const results = [];
            const names = [];
            for (let i = 0; i < id_array.length; i++) {
                const exec = await entity.find_by_oid(id_array[i], { name: 1, type: 1 });
                names.push(exec.name);

                const attr_obj = { "name": 1 };
                attr_obj[attr] = 1;
                const records = await record_entity.find({ exec: id_array[i] }, attr_obj);
                if (i == 0) {
                    for (let j = 0; j < records.length; j++) {
                        const record = records[j];
                        const result = {};
                        result[id_key] = record._id + "";
                        result[name_key] = record.name;
                        result[exec.name] = to_fixed2(record[attr]);
                        results.push(result);
                    }
                } else {
                    for (let j = 0; j < records.length; j++) {
                        const record = records[j];
                        const objs = results.filter(o => o[name_key] == record.name);
                        if (objs.length == 0) {
                            const result = {};
                            result[id_key] = record._id + "";
                            result[name_key] = record.name;
                            result[exec.name] = to_fixed2(record[attr]);
                            results.push(result);
                        } else {
                            const result = objs[0];
                            result[id_key] = result[id_key] + "," + record._id;
                            result[exec.name] = to_fixed2(record[attr]);
                        }
                    }
                }
            }

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const values = [];
                for (let j = 0; j < names.length; j++) {
                    values.push(result[names[j]]);
                }

                if (names.length > 2) {
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    if (min) {
                        result[boost_key] = to_fixed2((max / min - 1) * 100) + "%";
                    }
                } else if (names.length == 2) {
                    const first = result[names[0]]
                    const second = result[names[1]];
                    if (first) {
                        result[boost_key] = to_fixed2((second / first - 1) * 100) + "%";
                    }
                }
            }
            res.json({ code: SUCCESS, data: results });
        }));
    }
});