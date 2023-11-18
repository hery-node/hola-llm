import Vue from 'vue';

import NavBar from './NavBar.vue';
import BreadCrumbs from './BreadCrumbs.vue';
import DetailView from './DetailView.vue';
import TerminalConsole from "./TerminalConsole.vue";
import PerfDashboard from "./PerfDashboard.vue";

function setup_my_components() {
    Vue.component('h-bread', BreadCrumbs);
    Vue.component('h-detail', DetailView);
    Vue.component('h-navbar-custom', NavBar);
    Vue.component('h-terminal', TerminalConsole);
    Vue.component('h-perf-dashboard', PerfDashboard);
}

export { setup_my_components };