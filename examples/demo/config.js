var
  _ = require('lodash'),
  prod = require('./config-production');

var runtimeConfig = prod.client.bootstraps.runtimeConfig;

var buildtimeConfig = {
  client: _.extend(prod.client, {
    debug: true
  }),
  paths: prod.paths,
  server: _.extend(prod.server, {
    baseUrl:runtimeConfig.baseUrl,
    enableLiveReload: true,
    liveReloadPort: 35729,
    port: 5000,
    enablePushState: runtimeConfig.enablePushState
  }),
  styles: {
    enableMinify: false
  },
  markdown: prod.markdown,
  browserify: _.extend(prod.browserify, {
    insertGlobals: true,
    debug: true,
    enableUglify: false
  }),
  tasks: {
    default: ['build', 'server']
  }
};

module.exports = buildtimeConfig;