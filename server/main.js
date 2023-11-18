const { init_express_server, init_settings, gen_i18n, Entity, get_entity_meta, get_type } = require('hola-server');
const { register_types } = require('./core/type');
const { init_web_socket_server } = require('./core/socket');
const { settings, dev_mode } = require('./setting');

init_settings(settings);
register_types();

init_express_server(__dirname, "service_port", async () => {
    dev_mode && gen_i18n(__dirname + "/../web/src/locales/en.json", true);

    const user_entity = new Entity(get_entity_meta("user"));
    const pwd_type = get_type("password");
    const pwd = pwd_type.convert("pwd4llm")["value"];
    const users = [
        { name: "admin", password: pwd, role: "admin", status: 1 },
        { name: "demo", password: pwd, role: "user", status: 1 },
    ];
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        await user_entity.update({ name: user.name }, user);
    }

    init_web_socket_server();
    console.log("main server is successfully started");
});
