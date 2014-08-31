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
    _ = require('lodash');

// Require target specific configuration
var target = require('./config/' + (argv.target || 'dev') + '.js' )

function logErrorAndNotify(e) {
  notifier.notify({
    title:'Error on ' + e.plugin,
    message: e.message
  });
  gutil.log('Error running task', e.plugin, e.message);
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
  return Q.nfcall(glob, 'views/**/*.html', {cwd: target.dirs.src})
  .then(function(files){
    target.index.bootstraps.templates = files.reduce(function(m,file){
      m[file] = fs.readFileSync(target.dirs.src+'/'+file).toString();
      return m;
    }, {});
  });
});
gulp.watch([target.dirs.src + '/views/**/*.html'], ['index']);

// Index template and partials
gulp.task('index', ['templates'], function() {
  target.index.url = function(suffix) {
    return  target.server.baseUrl + suffix.replace(/^\//,'');
  };
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


// SASS
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
// Styles task
gulp.task('styles', function() {
  var stream = gulp.src(target.dirs.src + '/css/main.scss')
  // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
  .pipe(sass({
    onError: logErrorAndNotify
  }))
  .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
  .pipe(gulp.dest(target.dirs.dist));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.dirs.src + '/**/*.scss'], [
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


// API
var yaml = require('gulp-yaml');

gulp.task('yaml', function(done){
  var stream = gulp.src('**/*.yaml', {cwd:target.dirs.data})
  .pipe(yaml())
  .pipe(gulp.dest(target.dirs.dist + '/api'));
  if ( target.server.enableLiveReload ) {
    stream.pipe(liveReload(liveReloadServer));
  }
  return stream;
});
gulp.watch([target.dirs.data + '/**/*.yaml'], ['yaml']);

var markdown = require('gulp-markdown');
var frontMatter = require('gulp-front-matter');
var entityConvert = require('gulp-entity-convert');
var through = require('through2');

gulp.task('markdown', function() {
  var stream = gulp.src('**/*.md', {cwd:target.dirs.data})
  .pipe(frontMatter({
    property: 'frontMatterData',
    remove: true
  }))
  .pipe(entityConvert())
  .pipe(markdown({}))
  // Frontmatter + contents -> JSON
  .pipe(through.obj(function (file, enc, next) {
    if ( file.isBuffer() ) {
      file.frontMatterData.content = file.contents.toString();
      file.contents = new Buffer(JSON.stringify(file.frontMatterData));
      file.path = file.path.replace(/\.html$/, '.json');
    }
    this.push(file);
    return next();
  }))
  .pipe(gulp.dest(target.dirs.dist + '/api'));
});
gulp.watch([target.dirs.data + '/**/*.md'], ['markdown']);

// Generic tasks
gulp.task('build', ['clean', 'yaml', 'markdown', 'styles', 'templates', 'index', 'browserify'])

// Target specific tasks
Object.keys(target.tasks).forEach(function(name){
  gulp.task(name, target.tasks[name]);
});


