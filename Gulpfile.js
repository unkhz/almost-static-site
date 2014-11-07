'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var rimraf = require('rimraf');
var argv = require('yargs').argv;
var notifier = new require('node-notifier')();
var template = require('gulp-template');
//var glob = require('glob');
var fs = require('fs');
//var Q = require('q');
//var _ = require('lodash');
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

var site = argv.site.replace(/\/$/, '');
var db = {};
var target;

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
function initConfig() {
  [
    // Check under the working directory
    path.join(process.cwd(), site + '.js'),
    path.join(process.cwd(), site, 'config.js'),
    path.join(process.cwd(), site),

    // Check under the directory where gulp was started
    path.join(process.env.INIT_CWD, site + '.js'),
    path.join(process.env.INIT_CWD, site, 'config.js'),
    path.join(process.env.INIT_CWD, site)
  ]
  .some(function(configFile) {
    var stat;
    try {
      stat = fs.lstatSync(configFile);
    } catch(err) {}
    if ( stat && stat.isFile() ) {
      gutil.log('Using configuration in ', configFile);
      target = require(path.resolve(configFile));
      target.configFile = configFile;
      site = path.dirname(target.configFile);
      return true;
    }
  });
  if ( !target || !target.paths ) {
    gutil.log('Invalid site configuration in ', site);
    process.exit(1);
  }
}
initConfig();
gulp.task('config', initConfig);
gulp.watch([
  'Gulpfile.js',
  target.configFile
], ['lint', 'config']);

// Clean
gulp.task('clean', function() {
  rimraf.sync(target.paths.dist);
});

// JSHint
var jshint = require('gulp-jshint');
gulp.task('lint', function() {
  return gulp.src([
    'Gulpfile.js',
    target.configFile,
    target.paths.mainModule + '/**/*.js',
    target.paths.features + '/**/*.js'
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
    target.paths.mainJS
  ])
  .pipe(browserify())
  .on('error', logErrorAndNotify)
  .pipe(concat('main.js'))
  .on('error', logErrorAndNotify);

  if ( target.browserify.enableUglify ) {
    stream.pipe(uglify())
    .on('error', logErrorAndNotify);
  }

  stream.pipe(gulp.dest(target.paths.dist))
  .on('error', logErrorAndNotify);
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([
  target.paths.mainModule + '/**/*.js',
  target.paths.features + '/**/*.js',
  site + '/**/*.js',
],[
  'lint',
  'browserify'
]);

// View partials
gulp.task('templates', function() {
  target.client.bootstraps.templates = {};
  return gulp.src([
    target.paths.mainModule + '/**/*.html',
    target.paths.features + '/**/*.html',
    site + '/**/*.html'
  ])
  .pipe(through.obj(function (file, enc, next) {
    var fn = path.relative('./', file.path);
    target.client.bootstraps.templates[fn] = file.contents.toString();
    next();
  }));
});
gulp.watch([
  target.paths.mainModule + '/**/*.html',
  target.paths.features + '/**/*.html',
  site + '/**/*.html'
], ['index']);

// Index template and partials
gulp.task('index', ['templates', 'menu'], function() {
  var stream;
  target.client.url = function(suffix) {
    return  target.server.baseUrl + suffix.replace(/^\//,'');
  };

  // Get bootstrapped content from DB
  target.client.footer = db.footer;
  target.client.header = db.header;

  // Process
  stream = gulp.src([target.paths.mainHTML])
  .pipe(template(target))
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(target.paths.dist));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.paths.mainHTML], ['index']);

gulp.task('assets', function() {
  var stream = gulp.src([
    target.paths.assets + '/**/*.*',
    'node_modules/font-awesome/fonts/*.*'
  ])
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(target.paths.dist + '/assets'));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.paths.assets + '/**/*.*'], ['assets']);


// SASS
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
// Styles task
gulp.task('styles', function() {
  var stream = gulp.src([
    target.paths.mainModule + '/css/main.scss',
    target.paths.features + '/**/*.scss',
    target.paths.styles + '/**/*.scss',
    site + '/**/*.scss',
  ])
  // Concat before compile, so that includes are available in dynamic styles
  .pipe(concat('main.css'))
  // Add separate files at this point E.g build icons separately to circumvent IE's rule limit
  .pipe(addsrc([
    target.paths.mainModule + '/css/icons.scss'
  ]))
  .pipe(sass({
    // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
    onError: function(err){
      logErrorAndNotify({plugin:'sass', message: err});
    }
  }))
  .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
  .on('error', logErrorAndNotify);

  if ( target.styles.enableMinify ) {
    stream.pipe(cssmin())
    .on('error', logErrorAndNotify);
  }

  stream.pipe(gulp.dest(target.paths.dist));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([
  target.paths.mainModule + '/**/*.scss',
  target.paths.features + '/**/*.scss',
  target.paths.styles + '/**/*.scss',
  site + '/**/*.scss',
], [
  'styles'
]);


// Server
var server = express();
server.use(target.server.baseUrl, express.static(target.paths.dist));

if ( target.server.enableLiveReload ) {
  server.use(connectLiveReload({port: target.liveReloadPort}));
}

if ( target.server.enablePushState ) {
  server.all(target.server.baseUrl + '[^.]+', function(req, res) {
    res.sendFile('index.html', {
      root: target.paths.dist
    });
  });
}

gulp.task('server', ['build'], function() {
  server.listen(target.server.port);
  if ( target.server.enableLiveReload ) {
    liveReloadServer.listen(target.server.liveReloadPort);
  }
});


// MENU
var yaml = require('gulp-yaml');
var markdown = require('gulp-markdown');
var marked = require('marked');
var frontMatter = require('gulp-front-matter');
var entityConvert = require('gulp-entity-convert');
marked.setOptions(target.markdown);

gulp.task('menu', function(){
  var mdFilter = filter('**/*.md');
  var yamlFilter = filter('**/*.yaml');
  var stream = gulp.src(['**/*.yaml', '**/*.md'], {cwd:target.paths.pages})

  // YAML -> JSON
  .pipe(yamlFilter)
  .pipe(yaml())
  .on('error', logErrorAndNotify)
  .pipe(yamlFilter.restore())

  // Markdown -> HTML
  .pipe(mdFilter)
  .pipe(frontMatter({
    property: 'frontMatterData',
    remove: true
  }))
  .pipe(entityConvert())
  .pipe(markdown(target.markdown))

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
  .pipe(mdFilter.restore())

  // JSON -> api/pages/*.json
  .pipe(gulp.dest(target.paths.dist + '/api/'))

  // menu.json
  .pipe(through.obj(function (file, enc, next) {
    this.push(file);
    return next();
  }))
  // Convert a stream of files into a menu collection object
  .pipe(reduceStream({objectMode: true}, function (menu, file) {
    var input={};
    input = JSON.parse(file.contents.toString());
    input.url = path.relative(target.paths.dist, file.path);
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
  .pipe(gulp.dest(target.paths.dist + '/api/'));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.paths.pages + '/**/*.*'], ['menu']);

// Generic tasks
gulp.task('build', ['clean', 'assets', 'styles', 'templates', 'menu', 'index', 'browserify']);
gulp.task('dist', ['build'], function(){
  process.exit(0);
});

// Target specific tasks
Object.keys(target.tasks).forEach(function(name){
  gulp.task(name, target.tasks[name]);
});
