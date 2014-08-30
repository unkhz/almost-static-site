var runtimeConfig = {
  baseUrl: '/',
  title:'Almost Static Site'
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
    api: './dist/api',
    dist: './dist'
  },
  server: {
    baseUrl:runtimeConfig.baseUrl,
    enableLiveReload: false,
    liveReloadPort: 35729,
    port: 8080,
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