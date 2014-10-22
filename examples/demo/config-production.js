var runtimeConfig = {
  baseUrl: '/',
  title:'Almost Static Site',
  enablePushState: true
};

var buildtimeConfig = {
  client: {
    debug: false,
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
  paths: {
    // ASS Sources
    mainModule: './main',
    mainHTML: './main/index.html',
    features: './features',
    // Demo App Sources
    mainJS: './examples/demo/index.js',
    assets: './examples/demo/assets',
    pages: './examples/demo',
    styles: './examples/demo/styles',
    // Output
    dist: './dist'
  },
  server: {
    baseUrl:runtimeConfig.baseUrl,
    enableLiveReload: false,
    liveReloadPort: 35729,
    port: 8080,
    enablePushState: runtimeConfig.enablePushState
  },
  styles: {
    enableMinify: true
  },
  browserify: {
    detectGlobals: true,
    debug: false,
    enableUglify: true
  },
  tasks: {
    default: ['clean', 'build', 'server']
  }
};

module.exports = buildtimeConfig;