import Vue from "vue";
import App from "./App.vue";
import { routes } from "./router";
import { init_app } from "./plugins";
import { register_types } from "./core/type";
import { init_axios } from "hola-web";

register_types();
Vue.config.productionTip = false;
init_axios({ baseURL: process.env.VUE_APP_SERVER_URL });

const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
init_app(App, routes, locales);
