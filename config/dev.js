var runtimeConfig = {
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
      '/main.css'
    ],
    scripts: [
      '/main.js'
    ],
    bootstraps: {
      runtimeConfig: runtimeConfig
    }
  },
  server: {
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