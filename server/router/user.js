const { wrap_http } = require('hola-server').err;
const { required_post_params } = require('hola-server').params;
const { NO_PARAMS, NOT_FOUND, SUCCESS } = require('hola-server').code;
const { init_router, get_type, Entity, is_root_role } = require('hola-server');

module.exports = init_router({
    collection: "user",
    creatable: true,
    cloneable: true,
    readable: true,
    updatable: true,
    deleteable: true,
    primary_keys: ["name"],
    ref_label: "name",
    roles: ["admin:*"],
    fields: [
        { name: "name", required: true },
        { name: "password", type: "password", required: true, secure: true, list: false, search: false, view: "1" },
        { name: "role", type: "role", required: true },
        { name: "phone", type: "string" },
        { name: "email", type: "string" },
        { name: "status", type: "user_status" },
    ],

    route: (router, meta) => {
        const entity = new Entity(meta);

        router.post('/login', wrap_http(async function (req, res) {
            let params = required_post_params(req, ["name", "password"]);
            if (params === null) {
                res.json({ code: NO_PARAMS, err: '[name,password] checking params are failed!' });
                return;
            }

            const { name, password } = params;
            const encryed_password = get_type("password").convert(password)["value"];
            const user = await entity.find_one({ name: name, password: encryed_password }, { name: 1, role: 1, status: 1 });
            if (user && user.status == 1) {
                user.id = user._id + "";
                user.role = user.role;
                req.session.user = user;
                res.json({ code: SUCCESS, role: user.role, root: is_root_role(user.role) });
            } else {
                res.json({ code: NOT_FOUND, root: false, err: "name and password aren't matched" });
            }
        }));

        router.get('/role', wrap_http(async function (req, res) {
            res.json({ code: SUCCESS, role: req.session.user ? req.session.user.role : "" });
        }));

        router.get('/logout', wrap_http(async function (req, res) {
            req.session.user = null;
            req.session.root = null;
            res.json({ code: SUCCESS });
        }));
    }
});