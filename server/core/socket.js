const os = require('os');
const WebSocket = require('ws');
const pty = require('node-pty');
const { snooze } = require('hola-server').thread;
const { is_log_error, log_error, Entity, get_entity_meta } = require('hola-server');

const { settings } = require('../setting');
const { Execution, get_host_ssh_info, init_host_env_command } = require('./execution');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const init_web_socket_server = () => {
    const wss = new WebSocket.Server({ port: settings.server.web_socket_port });

    wss.on('connection', (ws) => {
        const pty_process = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 200,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });

        pty_process.onData(data => {
            try {
                ws.send(data);
            } catch (err) {
                console.log(`error occurs web socket sends data and error is:${err.message}`);
            }
        });

        ws.on('message', async (res) => {
            let login_user = "";
            try {
                const str = res ? res.toString() : "";
                if (str && str.startsWith("#host#:")) {
                    const id = str.replace("#host#:", "").trim();
                    const host = await get_host_ssh_info(id);
                    login_user = host.owner;

                    const ssh_cmd = `ssh ${host.auth} -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ${host.user}@${host.ip} -p ${host.port}\n`;
                    pty_process.write(Buffer.from(ssh_cmd, 'utf8'));
                    await snooze(3000);
                    pty_process.write(Buffer.from("\n#waiting..", 'utf8'));

                    const init_cmd = await init_host_env_command(id);
                    pty_process.write(Buffer.from(`\n${init_cmd} && clear\n`, 'utf8'));

                } else if (str && str.startsWith("#resize#:")) {
                    const screen = str.replace("#resize#:", "").trim().split(",");
                    pty_process.resize(parseInt(screen[0]), parseInt(screen[1]));

                } else if (str && str.startsWith("#exec#:")) {
                    const exec_id = str.replace("#exec#:", "").trim();
                    const execution = new Execution(new Entity(get_entity_meta("exec")), exec_id);
                    await execution.init();
                    const host = execution.host;
                    login_user = host.owner;

                    const ssh_cmd = `ssh ${host.auth} -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ${host.user}@${host.ip} -p ${host.port}\n`;
                    pty_process.write(Buffer.from(ssh_cmd, 'utf8'));
                    await snooze(3000);
                    pty_process.write(Buffer.from("\n#waiting..", 'utf8'));

                    const command = await execution.get_web_socket_command();
                    pty_process.write(Buffer.from(`\n${command}\n`, 'utf8'));
                } else {
                    pty_process.write(Buffer.from(res, 'utf8'));
                }
            } catch (err) {
                if (is_log_error()) {
                    log_error("web_socket", `error occurs for web socket on message and error is:${err.message}`, { "user": login_user });
                }
            }
        });
    });
}

module.exports = { init_web_socket_server }