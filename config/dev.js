var runtimeConfig = {
  baseUrl:'/',
  title:'Almost Static Site'
};

var buildtimeConfig = {
  dirs: {
    src: './app',
    api: './dist/api',
    dist: './dist'
  },
  index: {
    stylesheets: [
      runtimeConfig.baseUrl + 'main.css'
    ],
    scripts: [
      runtimeConfig.baseUrl + 'main.js'
    ],
    bootstraps: {
      runtimeConfig: runtimeConfig
    }
  },
  server: {
    baseUrl:runtimeConfig.baseUrl,
    enableLiveReload: true,
    liveReloadPort: 35729,
    port: 5000,
  },
  browserify: {
    insertGlobals: true,
    debug: true
  },
  tasks: {
    default: ['build', 'server', 'watch']
  }
};

module.exports = buildtimeConfig;