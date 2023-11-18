const { SUCCESS } = require('hola-server').code;
const { init_router, get_session_userid } = require('hola-server');
const { run_simple_local_cmd } = require('hola-server/core/bash');
const { get_user_key_path, write_file, delete_file } = require('../core/file');

const write_key = async (id, private_key) => {
    const uid = get_session_userid();
    const path = await get_user_key_path(uid, id);
    await write_file(path, private_key);
    await run_simple_local_cmd(`chmod 600 ${path}`);
    return { code: SUCCESS };
}

module.exports = init_router({
    collection: "key",
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
        { name: "name", required: true },
        { name: "private_key", required: true, type: "lstr", list: false, search: false }
    ],

    after_create: async (entity, obj) => {
        const instance = await entity.find_one({ "owner": obj.owner, "name": obj.name }, { "private_key": 1 });
        return await write_key(instance._id, instance.private_key);
    },

    after_update: async (_id, entity, obj) => {
        const instance = await entity.find_by_oid(_id, { "private_key": 1 });
        return await write_key(_id, instance.private_key);
    },

    after_clone: async (_id, entity, obj) => {
        const instance = await entity.find_one({ "owner": obj.owner, "name": obj.name }, { "private_key": 1 });
        return await write_key(_id, instance.private_key);
    },

    after_delete: async (entity, id_array) => {
        const uid = get_session_userid();
        for (let i = 0; i < id_array.length; i++) {
            const id = id_array[i];
            const path = await get_user_key_path(uid, id);
            await delete_file(path);
        }
        return { code: SUCCESS };
    }
});