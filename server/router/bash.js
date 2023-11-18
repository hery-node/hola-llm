const { SUCCESS } = require('hola-server').code;
const { init_router, get_session_userid } = require('hola-server');
const { run_simple_local_cmd } = require('hola-server/core/bash');
const { get_bash_path, write_file, delete_file, update_host_sync_status } = require('../core/file');

const write_bash = async (obj) => {
    const uid = get_session_userid();
    const path = await get_bash_path(uid, obj._id);
    const contents = [];
    contents.push("#!/bin/bash");
    obj.verbose && contents.push("set -o xtrace");
    obj.strict && contents.push("set -euo pipefail");
    contents.push(obj.run.replace("#!/bin/bash", ""));
    await write_file(path, contents.join("\n"));
    await run_simple_local_cmd(`chmod u+x ${path}`);
    await update_host_sync_status(uid);
    return { code: SUCCESS };
}

module.exports = init_router({
    collection: "bash",
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
        { name: "alias", type: "string" },
        { name: "verbose", type: "boolean" },
        { name: "strict", type: "boolean" },
        { name: "subprocess", type: "boolean" },
        { name: "run", type: "lstr", required: true, search: false }
    ],

    after_create: async (entity, obj) => {
        const instance = await entity.find_one({ "owner": obj.owner, "name": obj.name });
        return write_bash(instance);
    },

    after_update: async (_id, entity, obj) => {
        const instance = await entity.find_by_oid(_id);
        return write_bash(instance);
    },

    after_clone: async (_id, entity, obj) => {
        const instance = await entity.find_one({ "owner": obj.owner, "name": obj.name });
        return write_bash(instance);
    },

    after_delete: async (entity, id_array) => {
        const uid = get_session_userid();
        for (let i = 0; i < id_array.length; i++) {
            const id = id_array[i];
            const path = await get_bash_path(uid, id);
            await delete_file(path);
        }
        return { code: SUCCESS };
    }
});