import Vue from "vue";
import Vuetify from 'vuetify';
import colors from 'vuetify/lib/util/colors';

function make_dialog_movable() {
    // make vuetify dialogs movable
    const d = {};
    document.addEventListener("mousedown", (e) => {
        const closestDialog = e.target.closest(".v-dialog.v-dialog--active");
        if (e.button === 0 && closestDialog != null && e.target.classList.contains("v-toolbar__content")) {
            // element which can be used to move element
            d.el = closestDialog; // element which should be moved
            d.mouseStartX = e.clientX;
            d.mouseStartY = e.clientY;
            d.elStartX = d.el.getBoundingClientRect().left;
            d.elStartY = d.el.getBoundingClientRect().top;
            d.el.style.position = "fixed";
            d.el.style.margin = 0;
            d.oldTransition = d.el.style.transition;
            d.el.style.transition = "none";
        }
    });
    document.addEventListener("mousemove", (e) => {
        if (d.el === undefined) return;
        d.el.style.left = Math.min(Math.max(d.elStartX + e.clientX - d.mouseStartX, 0), window.innerWidth - d.el.getBoundingClientRect().width) + "px";
        d.el.style.top = Math.min(Math.max(d.elStartY + e.clientY - d.mouseStartY, 0), window.innerHeight - d.el.getBoundingClientRect().height) + "px";
    });
    document.addEventListener("mouseup", () => {
        if (d.el === undefined) return;
        d.el.style.transition = d.oldTransition;
        d.el = undefined;
    });
    setInterval(() => {
        // prevent out of bounds
        const dialog = document.querySelector(".v-dialog.v-dialog--active");
        if (dialog === null) return;
        dialog.style.left = Math.min(parseInt(dialog.style.left), window.innerWidth - dialog.getBoundingClientRect().width) + "px";
        dialog.style.top = Math.min(parseInt(dialog.style.top), window.innerHeight - dialog.getBoundingClientRect().height) + "px";
    }, 100);
}

const default_theme = {
    themes: {
        light: {
            primary: colors.cyan.darken2,
            progress: colors.red.darken2,
            tag: colors.red.darken1,
            secondary: colors.cyan.darken1,
            tertiary: '#495057',
            accent: '#82B1FF',
            error: colors.red.darken1,
            info: '#00d3ee',
            success: colors.cyan.darken1,
            create: colors.cyan.darken1,
            edit: colors.cyan.darken1,
            clone: colors.cyan.darken1,
            delete: colors.red.darken1,
            refresh: colors.green.darken1,
            warning: '#ffa21a',
            chart: colors.cyan.darken1,
            chart_title: colors.red.darken4,
            app_bar: colors.cyan.darken2,
            system_bar: '#FFFFFF',
            table_header: colors.cyan.lighten4,
            toolbar_icon: '#FFFFFF',
            chip: colors.cyan.darken1,
            bgcolor: colors.grey.lighten4,
            card: colors.cyan.darken1,
            back: colors.red.darken4,
            title_button: '#FFFFFF'
        }
    },
};

function setup_vuetify(config = {}) {
    make_dialog_movable();
    Vue.use(Vuetify);
    return new Vuetify({ theme: { ...default_theme, ...config } });
}

export { setup_vuetify };