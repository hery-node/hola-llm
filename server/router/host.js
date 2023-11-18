const { SUCCESS } = require('hola-server').code;
const { init_router } = require('hola-server');

const set_host_info = (host) => {
    host.synced = false;
    if (!host.port) {
        host.port = 22;
    }

    return { code: SUCCESS };
}

module.exports = init_router({
    collection: "host",
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
        { name: "ip", type: "string", required: true },
        { name: "port", type: "int" },
        { name: "user", type: "string", required: true },
        { name: "key", type: "string", ref: "key", required: true, search: false, list: false },
        { name: "ssh", type: "string", search: false, list: false },
        { name: "home", type: "string", search: false },
        { name: "synced", type: "boolean", sys: true }
    ],

    before_create: async (entity, obj) => {
        return set_host_info(obj);
    },

    before_update: async (_id, entity, obj) => {
        return set_host_info(obj);
    },

    before_clone: async (_id, entity, obj) => {
        return set_host_info(obj);
    },
});