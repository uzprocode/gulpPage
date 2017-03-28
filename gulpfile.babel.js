'use strict';

import gulp from 'gulp';

//掛載gulp plugins
let gulpPlugins = require('gulp-load-plugins');
let $ = gulpPlugins({scope: ['devDependencies']});
$.browsersync = require('browser-sync').create();
$.merge = require('merge-stream');
$.wdUtil = (function() {
  return {
    log: (msg) => {
      $.util.log($.util.colors.yellow(msg));
    },
    error: (err) => {
      $.notify.onError({title: "Error", message: "<%= error %>"})(err);
      this.emit('end');
    }
  };
})();

//common path
const paths = {
  img: {
    org: 'img/',
    build: 'images/'
  },
  css: {
    org: 'scss/',
    build: 'css/'
  },
  js: {
    org: 'esJs/',
    build: 'js/'
  },
  base: './org/',
  dest: './dest/'
};
//clean folder
gulp.task('clean', () => {
  return gulp.src([`${paths.dest}**/*`], {read: false})
  .pipe($.debug({title: 'do clean....'}))
  .pipe($.clean());

});

//scss
gulp.task('scss', () => {
  return gulp.src(`${paths.base}${paths.css.org}**/*.scss`)
  .pipe($.debug({title: 'do scss....'}))
  .pipe($.sourcemaps.init())
  .pipe($.sass())
  .pipe($.autoprefixer({
    browsers: [
      'last 2 version',
      'safari 5',
      'ie 8',
      'ie 9',
      'opera 12.1',
      'ios 6',
      'android 4'
    ],
    cascade: false
  }))
  .pipe($.sourcemaps.write(`./`))
  .pipe(gulp.dest(`${paths.dest}${paths.css.build}`));
});
//
gulp.task('watch:css', ['scss'], function () {
  return gulp.src(`${paths.dest}${paths.css.build}**/*.css`)
    .pipe($.debug({title: 'reload css....'}))
    .pipe($.browsersync.stream());
});

//ES6Js
//将ES6转换成可以在浏览器中运行的代码
let plumberOptions = {
  errorHandler: $.wdUtil.err
};

gulp.task('js', () => {
  return gulp.src(`${paths.base}${paths.js.org}*.js`)
    .pipe($.debug({title: 'do Js....'}))
    .pipe($.plumber(plumberOptions))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
    .pipe($.browserify())
    // stripDebug::移除JS裡有關console.log的功能
    // .pipe(Plugin.if(!doDev, Plugin.stripDebug()))
    // uglify::壓縮JS
    // .pipe(Plugin.if(!doDev, Plugin.uglify()))
    .pipe(gulp.dest(`${paths.dest}${paths.js.build}`));
});
gulp.task('jsUglify',()=>{
  return gulp.src(`${paths.dest}${paths.js.build}*.js`)
    .pipe($.stripDebug())
    .pipe($.uglify())
    .pipe(gulp.dest(`${paths.dest}${paths.js.build}`));
});
//
gulp.task('html', () => {
  return gulp.src([`${paths.base}/*.html`])
  .pipe($.debug({title: 'do Html....'}))
  .pipe(gulp.dest(`${paths.dest}`));
});

gulp.task('watch:html', function (callback) {
  $.sequence(
  //'html:buildTemplate',
  'html',
  'browser-sync--reload'
  )(callback);
});

//browser-sync
gulp.task('browser-sync', () => {
  $.browsersync.init({
    injectChanges: true,
    server: {
      baseDir: `${paths.dest}`
    }
  });
  gulp.watch(`${paths.base}${paths.css.org}**/*.scss`, ['watch:css']);
  gulp.watch(`${paths.base}/*.html`, ['watch:html']);
});
gulp.task('browser-sync--reload', function () {
  $.browsersync.reload();
});

//
gulp.task('default', (callback) => {
  $.sequence(
  //'html:buildTemplate',
  'clean',
  ['scss','js','html'],
  'browser-sync'
  )(callback);
});
