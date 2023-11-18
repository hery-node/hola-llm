import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";
import { setup_vuetify } from "./vuetify";
import { setup_echarts } from "./echarts";
import { setup_i18n } from "./i18n";
import { setup_components } from "hola-web";
import { setup_my_components } from "../components";

function init_app(App, routes, locales, locale = "en") {
    Vue.use(Vuex);
    Vue.use(VueRouter);

    const router = new VueRouter({ mode: "history", base: process.env.BASE_URL, routes });
    const store = new Vuex.Store({ state: {}, mutations: {}, actions: {}, modules: {} });
    const vuetify = setup_vuetify();
    const i18n = setup_i18n(locales, locale);

    setup_echarts();
    setup_components();
    setup_my_components();

    return new Vue({
        router,
        store,
        vuetify,
        i18n,
        render: (h) => h(App),
    }).$mount("#app");
}

export { init_app };
