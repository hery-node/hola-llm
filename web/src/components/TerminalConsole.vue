<template>
  <h-window ref="win" :title="$t('host.terminal_title', { host: this.hostname })" @resize="resize_window" width="60%">
    <div ref="terminal" style="width: 100%; height: 100%; display: block"></div>
  </h-window>
</template>
<script>
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { AttachAddon } from "xterm-addon-attach";

export default {
  props: {
    server: { type: String, required: true },
  },

  data() {
    return {
      dialog: false,
      term: null,
      hostname: "",
      hostid: "",
      command: "#host#:",
      fit_addon: null,
    };
  },

  beforeDestroy() {
    this.socket && this.socket.close();
    this.term && this.term.dispose();
  },

  methods: {
    resize_window() {
      setTimeout(() => {
        this.fit_addon && this.fit_addon.fit();
        this.term && this.term.focus();
      }, 1000);
    },

    show(host, command) {
      this.$refs.win.show();
      this.hostname = host.name;
      this.hostid = host._id;
      if (command) {
        this.command = `#${command}#:`;
      } else {
        this.command = "#host#:";
      }
      this.socket && this.socket.close();
      this.term && this.term.dispose();
      this.init_socket();
    },

    init_term() {
      const fontFamily = "monospace";
      const term = new Terminal({
        fontSize: 16,
        fontFamily: fontFamily,
        rendererType: "canvas",
        cols: 200,
        rows: 30,
        convertEol: true,
        disableStdin: false,
        theme: {
          background: "#181d28",
        },
        cursorBlink: true,
        cursorStyle: "underline",
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      this.fit_addon = fitAddon;

      window.addEventListener("resize", () => {
        fitAddon.fit();
      });

      term.onResize((evt) => {
        this.socket.send("#resize#:" + evt.cols + "," + evt.rows);
      });

      const attachAddon = new AttachAddon(this.socket);
      term.loadAddon(attachAddon);

      const web_ele = this.$refs["terminal"];
      term.open(web_ele);

      setTimeout(() => {
        fitAddon.fit();
      }, 1000);

      setTimeout(() => {
        fitAddon.fit();
        term.focus();
      }, 2000);

      this.term = term;
    },

    init_socket() {
      this.init_success = false;
      this.socket = new WebSocket(this.server);

      this.socket.onopen = () => {
        this.init_term();
        this.socket.send(this.command + this.hostid);
      };
    },
  },
};
</script>
