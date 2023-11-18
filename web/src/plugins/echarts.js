import Vue from 'vue';
import VueECharts from 'vue-echarts';
import theme from "./theme.json";

function setup_echarts() {
    window.echarts && window.echarts.registerTheme("custom", theme);
    Vue.component('v-chart', VueECharts);
}

export { setup_echarts };