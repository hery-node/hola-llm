const { SUCCESS } = require('hola-server').code;
const { run_simple_cmd } = require('hola-server').bash;
const { has_value } = require('hola-server').validate;
const { init_router, is_log_error, log_error } = require('hola-server');
const { get_host_ssh_info } = require('../core/execution');

const set_attr = async (obj, attr, file_name) => {
    const host = await get_host_ssh_info(obj.host);
    const base_dir = obj.path.startsWith("/") ? `${host.home}${obj.path}` : `${host.home}/${obj.path}`;
    const stdout = await run_simple_cmd(host, `cat ${base_dir}/${file_name}`);
    try {
        obj[attr] = has_value(stdout) ? JSON.parse(stdout) : {};
    } catch (e) {
        if (is_log_error()) {
            log_error("model", `error occurs during parse to JSON obj and error is ${e}`);
        }
        obj[attr] = {};
    }
    obj[attr].tag = obj.name;
}

const set_model_info = async (obj) => {
    await set_attr(obj, "config", "config.json");
    await set_attr(obj, "tokenizer_config", "tokenizer_config.json");
    await set_attr(obj, "special_tokens_map", "special_tokens_map.json");
    return { code: SUCCESS };
}

module.exports = init_router({
    collection: "model",
    creatable: true,
    readable: true,
    updatable: true,
    cloneable: true,
    deleteable: true,
    primary_keys: ["owner", "name"],
    ref_label: "name",
    user_field: "owner",
    fields: [
        { name: "owner", required: true, ref: "user", delete: "cascade" },
        { name: "name", type: "string", required: true },
        { name: "type", type: "string", required: true },
        { name: "host", type: "string", ref: "host", required: true, search: false },
        // This path should put under the home dir of host
        { name: "path", type: "string", required: true },
        { name: "config", type: "obj", create: false, list: false, search: false },
        { name: "tokenizer_config", type: "obj", create: false, list: false, search: false },
        { name: "special_tokens_map", type: "obj", create: false, list: false, search: false }
    ],

    before_create: async (entity, obj) => {
        return set_model_info(obj);
    },

    before_update: async (_id, entity, obj) => {
        return set_model_info(obj);
    },

    before_clone: async (_id, entity, obj) => {
        return set_model_info(obj);
    },
});