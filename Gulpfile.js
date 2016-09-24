'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var rimraf = require('rimraf');
var argv = require('yargs').argv;
var notifier = require('node-notifier');
var template = require('gulp-template');
var fs = require('fs');
var path = require('path');
var filter = require('gulp-filter');
var addsrc = require('gulp-add-src');
var liveReload = require('gulp-livereload');
var liveReloadServer = require('tiny-lr')();
var connectLiveReload = require('connect-livereload');
var express = require('express');
var through = require('through2');
var reduceStream = require('through2-reduce');
var File = require('vinyl');

if ( !argv.site ) {
  gutil.log('Please define the site to be rendered with the --site option');
  gutil.log('E.e gulp --site examples/demo');
  process.exit(1);
}

var db = {};
var siteConfig;

function logErrorAndNotify(e) {
  notifier.notify({
    title:'Error on ' + e.plugin,
    message: e.message
  });
  gutil.log('Error running task', e.plugin);
  gutil.log(e.message);
  gutil.log(e.stack);
}

// Build Configuration
function initConfig(sitePathOrConfig) {
  [
    // Check under the working directory
    path.join(process.cwd(), sitePathOrConfig + '.js'),
    path.join(process.cwd(), sitePathOrConfig, 'config.js'),
    path.join(process.cwd(), sitePathOrConfig),

    // Check under the directory where gulp was started
    path.join(process.env.INIT_CWD, sitePathOrConfig + '.js'),
    path.join(process.env.INIT_CWD, sitePathOrConfig, 'config.js'),
    path.join(process.env.INIT_CWD, sitePathOrConfig)
  ]
  .some(function(configFile) {
    var stat;
    try {
      stat = fs.lstatSync(configFile);
    } catch(err) {}
    if ( stat && stat.isFile() ) {
      gutil.log('Using configuration in ', configFile);
      siteConfig = require(path.resolve(configFile));
      siteConfig.configFile = configFile;
      siteConfig.rootPath = path.dirname(siteConfig.configFile);
      return true;
    }
  });
  if ( !siteConfig || !siteConfig.paths ) {
    gutil.log('Invalid site configuration in ', sitePathOrConfig);
    process.exit(1);
  }
}
initConfig(argv.site.replace(/\/$/, ''));

// Config
gulp.task('config', initConfig);
gulp.watch([
  'Gulpfile.js',
  siteConfig.configFile
], ['lint', 'config']);

// Clean
gulp.task('clean', function() {
  rimraf.sync(siteConfig.paths.dist);
});

// JSHint
var jshint = require('gulp-jshint');
gulp.task('lint', function() {
  return gulp.src([
    'Gulpfile.js',
    siteConfig.configFile,
    siteConfig.paths.mainModule + '/**/*.js',
    siteConfig.paths.features + '/**/*.js',
  ])
  .pipe(jshint())
  .on('error', logErrorAndNotify)
  .pipe(jshint.reporter('default'));
});

// Browserify
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
gulp.task('browserify', ['lint'], function() {
  var stream = gulp.src([
    siteConfig.paths.mainJS
  ])
  .pipe(browserify())
  .on('error', logErrorAndNotify)
  .pipe(concat('main.js'))
  .on('error', logErrorAndNotify);

  if ( siteConfig.browserify.enableUglify ) {
    stream.pipe(uglify())
    .on('error', logErrorAndNotify);
  }

  stream.pipe(gulp.dest(siteConfig.paths.dist))
  .on('error', logErrorAndNotify);
  if ( siteConfig.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([
  siteConfig.paths.mainModule + '/**/*.js',
  siteConfig.paths.features + '/**/*.js',
  siteConfig.rootPath + '/**/*.js',
],[
  'lint',
  'browserify'
]);

// View partials
gulp.task('templates', function() {
  siteConfig.client.bootstraps.templates = {};
  return gulp.src([
    siteConfig.paths.mainModule + '/**/*.html',
    siteConfig.paths.features + '/**/*.html',
    siteConfig.rootPath + '/**/*.html'
  ])
  .pipe(through.obj(function (file, enc, next) {
    var fn = path.relative('./', file.path);
    siteConfig.client.bootstraps.templates[fn] = file.contents.toString();
    next();
  }));
});
gulp.watch([
  siteConfig.paths.mainModule + '/**/*.html',
  siteConfig.paths.features + '/**/*.html',
  siteConfig.rootPath + '/**/*.html'
], ['index']);

// Index template and partials
gulp.task('index', ['templates', 'menu'], function() {
  var stream;
  siteConfig.client.url = function(suffix) {
    return  siteConfig.server.baseUrl + suffix.replace(/^\//,'');
  };

  // Get bootstrapped content from DB
  siteConfig.client.footer = db.footer;
  siteConfig.client.header = db.header;

  // Process
  stream = gulp.src([siteConfig.paths.mainHTML])
  .pipe(template(siteConfig))
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(siteConfig.paths.dist));
  if ( siteConfig.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([siteConfig.paths.mainHTML], ['index']);

// Assets
gulp.task('assets', function() {
  var stream = gulp.src([
    siteConfig.paths.assets + '/**/*.*',
    'node_modules/font-awesome/fonts/*.*'
  ])
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(siteConfig.paths.dist + '/assets'));
  if ( siteConfig.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([siteConfig.paths.assets + '/**/*.*'], ['assets']);


// SASS
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
// Styles task
gulp.task('styles', function() {
  var stream = gulp.src([
    siteConfig.paths.mainModule + '/css/main.scss',
    siteConfig.paths.features + '/**/*.scss',
    siteConfig.paths.styles + '/**/*.scss',
    siteConfig.rootPath + '/**/*.scss',
  ])
  // Concat before compile, so that includes are available in dynamic styles
  .pipe(concat('main.css'))
  // Add separate files at this point E.g build icons separately to circumvent IE's rule limit
  .pipe(addsrc([
    siteConfig.paths.mainModule + '/css/ass-icons.scss'
  ]))
  .pipe(sass({
    includePaths: [
      siteConfig.paths.mainModule + '/css',
      process.cwd() + '/node_modules',
      siteConfig.rootPath,
    ]
  }))
  .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
  .on('error', logErrorAndNotify);

  if ( siteConfig.styles.enableMinify ) {
    stream.pipe(cssmin())
    .on('error', logErrorAndNotify);
  }

  stream.pipe(gulp.dest(siteConfig.paths.dist));
  if ( siteConfig.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([
  siteConfig.paths.mainModule + '/**/*.scss',
  siteConfig.paths.features + '/**/*.scss',
  siteConfig.paths.styles + '/**/*.scss',
], [
  'styles'
]);


// Server
var server = express();
server.use(siteConfig.server.baseUrl, express.static(siteConfig.paths.dist));

if ( siteConfig.server.enableLiveReload ) {
  server.use(connectLiveReload({port: siteConfig.liveReloadPort}));
}

if ( siteConfig.server.enablePushState ) {
  server.all(siteConfig.server.baseUrl + '[^.]+', function(req, res) {
    res.sendFile('index.html', {
      root: siteConfig.paths.dist
    });
  });
}

gulp.task('server', ['build'], function() {
  server.listen(siteConfig.server.port);
  if ( siteConfig.server.enableLiveReload ) {
    liveReloadServer.listen(siteConfig.server.liveReloadPort);
  }
});


// MENU
var yaml = require('gulp-yaml');
var markdown = require('gulp-markdown');
var marked = require('marked');
var frontMatter = require('gulp-front-matter');
var entityConvert = require('gulp-entity-convert');
marked.setOptions(siteConfig.markdown);

gulp.task('menu', function(){
  var mdFilter = filter('**/*.md', {restore: true});
  var yamlFilter = filter('**/*.yaml', {restore: true});
  var stream = gulp.src(['**/*.yaml', '**/*.md'], {cwd:siteConfig.paths.pages})

  // YAML -> JSON
  .pipe(yamlFilter)
  .pipe(yaml())
  .on('error', logErrorAndNotify)
  .pipe(yamlFilter.restore)

  // Markdown -> HTML
  .pipe(mdFilter)
  .pipe(frontMatter({
    property: 'frontMatterData',
    remove: true
  }))
  .pipe(entityConvert())
  .pipe(markdown(siteConfig.markdown))

  // Frontmatter + HTML -> JSON
  .pipe(through.obj(function (file, enc, next) {
    if ( file.isBuffer() ) {
      file.frontMatterData.content = file.contents.toString();
      file.contents = new Buffer(JSON.stringify(file.frontMatterData));
      file.path = file.path.replace(/\.html$/, '.json');
    }
    this.push(file);
    return next();
  }))
  .on('error', logErrorAndNotify)
  .pipe(mdFilter.restore)

  // JSON -> api/pages/*.json
  .pipe(gulp.dest(siteConfig.paths.dist + '/api/'))

  // menu.json
  .pipe(through.obj(function (file, enc, next) {
    this.push(file);
    return next();
  }))
  // Convert a stream of files into a menu collection object
  .pipe(reduceStream({objectMode: true}, function (menu, file) {
    var input={};
    input = JSON.parse(file.contents.toString());
    input.url = path.relative(siteConfig.paths.dist, file.path);
    input.id = input.id || 'page-'+menu.pages.length;
    if ( input.contentFromFile ) {
      input.content = fs.readFileSync(input.contentFromFile).toString();
      if ( !input.content ) {
        throw new gutil.PluginError('menu', 'Invalid contentFromFile reference ' + input.contentFromFile);
      } else {
        input.content = marked(input.content);
      }
    }
    menu.pages.forEach(function(p){
      if ( p.id === input.id ) {
        throw new gutil.PluginError('menu', 'Duplicate id in Page datatabase when parsing page ' + file.path);
      }
    });
    menu.pages.push(input);
    if ( input.isFrontPage && !menu.frontPageId ) {
      menu.frontPageId = input.id;
    }

    // Run feature builds
    var builds = [];
    if ( input.features ) {
      input.features.forEach(function(f){
        var stat;
        var feature = typeof f === 'string' ? {id:f} : f;
        var fn = './features/' + feature.id + '/build.js';
        try {
          stat = fs.lstatSync(fn);
        } catch(err) {}
        if ( stat && stat.isFile() ) {
          var build = require(fn);
          builds.push(build(input));
        }
      });
    }
    // Store for other tasks
    db[input.id] = input;
    return menu;
  }, {
    pages:[],
    frontPageId:null
  }))
  .on('error', logErrorAndNotify)
  // Convert reduced object into a json file
  .pipe(through.obj(function(data, enc, next){
    this.push(new File({
      path: process.cwd() + '/menu.json',
      contents: new Buffer(JSON.stringify(data))
    }));
    return next();
  }))
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(siteConfig.paths.dist + '/api/'));
  if ( siteConfig.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([siteConfig.paths.pages + '/**/*.*'], ['menu']);

// Generic tasks
gulp.task('build', ['clean', 'assets', 'styles', 'templates', 'menu', 'index', 'browserify']);
gulp.task('dist', ['build'], function(){
  process.exit(0);
});

// Target specific tasks
Object.keys(siteConfig.tasks).forEach(function(name){
  gulp.task(name, siteConfig.tasks[name]);
});
