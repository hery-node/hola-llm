const { defineConfig } = require('@vue/cli-service');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const local_deploy = false;

const cdn = local_deploy ? {
  css: ['https://cdn.jsdelivr.net/npm/chartist@1.3.0/dist/index.min.css'],
  js: []
} : {
  css: [
    'https://cdn.jsdelivr.net/npm/chartist@1.3.0/dist/index.min.css',
    'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css',
    'https://cdn.jsdelivr.net/npm/vue-echarts@6.5.5/dist/csp/style.min.css',
    'https://cdn.jsdelivr.net/npm/hola-web@1.0.0/dist/hola-web.css'
  ],
  js: [
    'https://cdn.jsdelivr.net/npm/axios@1.4.0/dist/axios.min.js',
    'https://cdn.jsdelivr.net/npm/vue@2.7.8/dist/vue.min.js',
    'https://cdn.jsdelivr.net/npm/vue-router@3.2.0/dist/vue-router.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/vue-i18n/8.28.2/vue-i18n.min.js',
    'https://cdn.jsdelivr.net/npm/vuex@3.4.0/dist/vuex.min.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/vuetify@2.6.0/dist/vuetify.js',
    'https://cdn.jsdelivr.net/npm/echarts@5.4.2/dist/echarts.min.js',
    'https://cdn.jsdelivr.net/npm/vue-echarts@6.5.5/dist/index.umd.min.js',
    'https://cdn.jsdelivr.net/npm/chartist@1.3.0/dist/index.umd.min.js',
    'https://cdn.jsdelivr.net/npm/hola-web@1.0.0/dist/hola-web.umd.min.js'
  ]
};

const externals = local_deploy ? {} : {
  'axios': 'axios',
  'vue': 'Vue',
  'vue-router': 'VueRouter',
  'vuex': 'Vuex',
  'vue-i18n': 'VueI18n',
  'xlsx': 'XLSX',
  'vuetify': 'Vuetify',
  'echarts': 'echarts',
  'vue-echarts': 'VueECharts',
  'chartist': 'Chartist',
  'hola-web': 'HolaWeb'
};

module.exports = defineConfig({
  configureWebpack: {
    // plugins: [new BundleAnalyzerPlugin()],
    externals: externals
  },

  chainWebpack(config) {
    config.plugin('html').tap(args => {
      args[0].cdn = cdn;
      return args;
    })
  },

  transpileDependencies: [
    'vuetify'
  ]
});