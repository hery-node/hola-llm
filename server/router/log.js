const { wrap_http } = require('hola-server').err;
const { SUCCESS } = require('hola-server').code;
const { post_params } = require('hola-server').params;
const { init_router, get_session_userid, Entity } = require('hola-server');

module.exports = init_router({
    collection: "log",
    readable: true,
    deleteable: true,
    primary_keys: ["user", "time"],
    user_field: "user",
    fields: [
        { name: "user", type: "string", ref: "user", delete: "cascade" },
        { name: "time", type: "string" },
        { name: "category", type: "string" },
        { name: "level", type: "log_level" },
        { name: "path", type: "string", search: false },
        { name: "msg", type: "string" },
        //this can be monitor id or tune id to view log by workload or tune
        { name: "obj_id", type: "string" }
    ],

    route: (router, meta) => {
        const entity = new Entity(meta);

        router.post('/clear', wrap_http(async function (req, res) {
            const query = {};
            const user_id = get_session_userid();
            if (user_id == null) {
                throw new Error("no user is found in session");
            }

            query[meta.user_field] = user_id;
            const { obj_id } = post_params(req, ["obj_id"]);
            obj_id && (query["obj_id"] = obj_id);
            await entity.delete(query);

            res.json({ code: SUCCESS });
        }));
    }
});