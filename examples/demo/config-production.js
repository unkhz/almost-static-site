var runtimeConfig = {
  baseUrl: '/',
  title:'Almost Static Site',
  enablePushState: true
};

var buildtimeConfig = {
  client: {
    debug: false,
    appModule: 'demoApp',
    stylesheets: [
      runtimeConfig.baseUrl + 'main.css',
      runtimeConfig.baseUrl + 'icons.css'
    ],
    scripts: [
      runtimeConfig.baseUrl + 'main.js'
    ],
    inlineScripts: [
      "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga'); ga('create', 'UA-56332837-2', 'auto'); ga('send', 'pageview');"
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
  markdown: {
    gfm: true,
    tables: true
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