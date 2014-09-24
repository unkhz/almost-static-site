var runtimeConfig = {
  baseUrl: '/',
  title:'Almost Static Site',
  enablePushState: true
};

var buildtimeConfig = {
  index: {
    stylesheets: [
      runtimeConfig.baseUrl + 'main.min.css'
    ],
    scripts: [
      runtimeConfig.baseUrl + 'main.min.js'
    ],
    bootstraps: {
      runtimeConfig: runtimeConfig
    }
  },
  dirs: {
    src: './app',
    assets: './app/api/assets',
    pages: './app/api',
    styles: './app/api/styles',
    dist: './dist'
  },
  server: {
    baseUrl:runtimeConfig.baseUrl,
    enableLiveReload: false,
    liveReloadPort: 35729,
    port: 8080,
    enablePushState: runtimeConfig.enablePushState
  },
  browserify: {
    detectGlobals: true,
    debug: false
  },
  tasks: {
    default: ['clean', 'build', 'server']
  }
};

module.exports = buildtimeConfig;