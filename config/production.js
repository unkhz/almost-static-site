var runtimeConfig = {
  title:'Almost Static Site'
};

var buildtimeConfig = {
  index: {
    stylesheets: [
      '/main.min.css'
    ],
    scripts: [
      '/main.min.js'
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