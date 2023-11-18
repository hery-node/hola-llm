const { SUCCESS } = require('hola-server').code;
const { random_code } = require('hola-server').random;
const { init_router, get_session_userid } = require('hola-server');
const { run_simple_local_cmd } = require('hola-server/core/bash');
const { get_docker_path, write_file, delete_file, update_host_sync_status } = require('../core/file');

const write_docker = async (obj) => {
    const uid = get_session_userid();
    const path = await get_docker_path(uid, obj._id);

    const docker_instance_name = obj.name.toLowerCase().replaceAll(" ", "_");
    const docker_file_name = `d${random_code()}`;
    const contents = [];
    contents.push("#!/bin/bash");
    obj.env && contents.push(obj.env);
    contents.push(`img_name=${docker_instance_name}_img`);
    contents.push(`images=$(docker images|grep $img_name|wc -l)`);
    contents.push(`if [ "$images" == "1" ]; then`);
    contents.push(`echo "$img_name already exist"`);
    contents.push(`else`);
    contents.push(`cd ~ && tee ${docker_file_name}<<EOF`);
    contents.push(obj.file);
    contents.push("EOF");
    contents.push(`cd $DOCKER_BUILD_DIR`);
    contents.push(`docker build -t $img_name -f ~/${docker_file_name} .`);
    contents.push(`unlink ~/${docker_file_name}`);
    contents.push("fi");
    contents.push(`instances=$(docker ps -a |grep ${docker_instance_name}|wc -l)`);
    contents.push(`if [ "$instances" == "1" ]; then`);
    contents.push(`docker start ${docker_instance_name}`);
    contents.push(`else`);
    contents.push(`docker run -it -d --name=${docker_instance_name} -v $BHOME:/bhome -v $DHOME:/dhome ${obj.run} $img_name`);
    contents.push(`docker exec ${docker_instance_name} /bin/bash -c "cp /bhome/docker_env.sh ~/.bash_aliases"`);
    contents.push("fi");

    await write_file(path, contents.join("\n"));
    await run_simple_local_cmd(`chmod u+x ${path}`);
    await update_host_sync_status(uid);
    return { code: SUCCESS };
}

// DOCKER_BUILD_DIR to specify the build dir.
module.exports = init_router({
    collection: "docker",
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
        { name: "env", type: "lstr", search: false },
        { name: "file", type: "lstr", required: true, search: false },
        { name: "run", type: "lstr", search: false }
    ],
    after_create: async (entity, obj) => {
        const instance = await entity.find_one({ "owner": obj.owner, "name": obj.name });
        return write_docker(instance);
    },

    after_update: async (_id, entity, obj) => {
        const instance = await entity.find_by_oid(_id);
        return write_docker(instance);
    },

    after_clone: async (_id, entity, obj) => {
        const instance = await entity.find_one({ "owner": obj.owner, "name": obj.name });
        return write_docker(instance);
    },

    after_delete: async (entity, id_array) => {
        const uid = get_session_userid();
        for (let i = 0; i < id_array.length; i++) {
            const id = id_array[i];
            const path = await get_docker_path(uid, id);
            await delete_file(path);
        }
        return { code: SUCCESS };
    }
});