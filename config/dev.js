var runtimeConfig = {
  baseUrl: '/',
  title:'Almost Static Site',
  enablePushState: true
};

var buildtimeConfig = {
  dirs: {
    src: './app',
    data: './app/api',
    dist: './dist'
  },
  index: {
    stylesheets: [
      'main.css'
    ],
    scripts: [
      'main.js'
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
    enablePushState: runtimeConfig.enablePushState
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