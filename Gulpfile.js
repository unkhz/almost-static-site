var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    rimraf = require('rimraf'),
    argv = require('yargs').argv,
    notifier = new require('node-notifier')(),
    template = require('gulp-template'),
    glob = require('glob'),
    fs = require('fs')
    Q = require('q'),
    _ = require('lodash'),
    path = require('path'),
    filter = require('gulp-filter'),
    concat = require('gulp-concat');

// Require target specific configuration
var target = require('./config/' + (argv.target || 'dev') + '.js' )
var db = {};

function logErrorAndNotify(e) {
  notifier.notify({
    title:'Error on ' + e.plugin,
    message: e.message
  });
  gutil.log('Error running task', e.plugin);
  gutil.log(e.message);
  gutil.log(e.stack);
}

// Clean
gulp.task('clean', function() {
  rimraf.sync(target.dirs.dist);
});


// JSHint
var jshint = require('gulp-jshint');
gulp.task('lint', function() {
  return gulp.src(target.dirs.src + '/*.js')
  .pipe(jshint())
  .on('error', logErrorAndNotify)
  .pipe(jshint.reporter('default'));
});


// Browserify
var browserify = require('gulp-browserify');
gulp.task('browserify', ['lint'], function() {
  var stream = gulp.src([target.dirs.src + '/main.js'])
  .pipe(browserify())
  .on('error', logErrorAndNotify)
  .pipe(concat('main.js'))
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(target.dirs.dist))
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
});
gulp.task('watch', function() {
  gulp.watch([target.dirs.src + '/*.js', target.dirs.src + '/**/*.js'],[
    'lint',
    'browserify'
  ]);
});

// View partials
gulp.task('templates', function() {
  return Q.nfcall(glob, '**/*.html', {cwd: target.dirs.src})
  .then(function(files){
    target.index.bootstraps.templates = files.reduce(function(m,file){
      m[file] = fs.readFileSync(target.dirs.src+'/'+file).toString();
      return m;
    }, {});
  });
});
gulp.watch([target.dirs.src + '/**/*.html'], ['index']);

// Index template and partials
gulp.task('index', ['templates', 'menu'], function() {
  target.index.url = function(suffix) {
    return  target.server.baseUrl + suffix.replace(/^\//,'');
  };

  // Get bootstrapped content from DB
  target.index.index = db.index;
  target.index.footer = db.footer;
  target.index.header = db.header;

  // Process
  stream = gulp.src([target.dirs.src + '/index.html'])
  .pipe(template(target))
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(target.dirs.dist));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.dirs.src + '/index.html'], ['index']);

gulp.task('assets', function() {
  var stream = gulp.src([target.dirs.assets + '/**/*.*'])
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(target.dirs.dist));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});


// SASS
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
// Styles task
gulp.task('styles', function() {
  var stream = gulp.src([
    target.dirs.src + '/css/main.scss',
    target.dirs.styles + '/*.scss',
  ])
  // Concat before compile, so that includes are available in dynamic styles
  .pipe(concat('main.css'))
  .pipe(sass({
    // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
    onError: function(err){
      logErrorAndNotify({plugin:'sass', message: err});
    }
  }))
  .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(target.dirs.dist));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.dirs.src + '/**/*.scss', target.dirs.styles + '/**/*.scss'], [
  'styles'
]);


// Server
var liveReload = require('gulp-livereload'),
    liveReloadServer = require('tiny-lr')(),
    connectLiveReload = require('connect-livereload'),
    express = require('express');

var server = express();
server.use(target.server.baseUrl, express.static(target.dirs.dist));

if ( target.server.enableLiveReload ) {
  server.use(connectLiveReload({port: target.liveReloadPort}));
}

if ( target.server.enablePushState ) {
  server.all(target.server.baseUrl + '*', function(req, res) {
    res.sendFile('index.html', {
      root: target.dirs.dist
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
var frontMatter = require('gulp-front-matter');
var entityConvert = require('gulp-entity-convert');
var through = require('through2');
var reduceStream = require('through2-reduce');
var File = require('vinyl');

gulp.task('menu', function(done){
  var mdFilter = filter('**/*.md');
  var yamlFilter = filter('**/*.yaml');
  var stream = gulp.src(['**/*.yaml', '**/*.md'], {cwd:target.dirs.pages})

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
  .pipe(markdown({}))

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
  .pipe(gulp.dest(target.dirs.dist + '/api/'))

  // menu.json
  .pipe(through.obj(function (file, enc, next) {
    this.push(file);
    return next();
  }))
  // Convert a stream of files into a menu collection object
  .pipe(reduceStream({objectMode: true}, function (menu, file) {
    var input={};
    input = JSON.parse(file.contents.toString());
    input.url = path.relative(target.dirs.dist, file.path);
    delete input.content;
    input.id = input.id || 'page-'+menu.pages.length;
    menu.pages.forEach(function(p){
      if ( p.id === input.id ) {
        throw new gutil.PluginError("menu", "Duplicate id in Page datatabase when parsing page " + file.path);
      }
    });
    menu.pages.push(input);
    if ( input.isFrontPage && !menu.frontPageId ) {
      menu.frontPageId = input.id;
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
      path: process.cwd() + "/menu.json",
      contents: new Buffer(JSON.stringify(data))
    }));
    return next();
  }))
  .on('error', logErrorAndNotify)
  .pipe(gulp.dest(target.dirs.dist + '/api/'));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.dirs.pages + '/**/*.*'], ['menu']);

// Generic tasks
gulp.task('build', ['clean', 'assets', 'styles', 'templates', 'menu', 'index', 'browserify'])

// Target specific tasks
Object.keys(target.tasks).forEach(function(name){
  gulp.task(name, target.tasks[name]);
});


