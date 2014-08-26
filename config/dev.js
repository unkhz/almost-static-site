var target = {
  dirs: {
    src: './app',
    api: './dist/api',
    dist: './dist'
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

module.exports = target;