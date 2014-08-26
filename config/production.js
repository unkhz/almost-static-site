var target = {
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

module.exports = target;