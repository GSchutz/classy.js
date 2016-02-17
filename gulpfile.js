var gulp      = require('gulp'),
    Q         = require('q'), // any promise required for a gulp-jasmine-browser dependency
    rimraf    = require('rimraf')
    watch     = require('gulp-watch'),
    concat    = require('gulp-concat'),
    uglify    = require('gulp-uglify');


const SRC_JS = [
  'src/**/*'
];

const SPECS = [
  'bower_components/lodash/lodash.js', 

  'dist/classy.min.js', 
  'spec/**/*Spec.js'
];

gulp.task('clean', function (cb) {
  rimraf('dist', cb);
});

gulp.task('dist', ['clean'], function(cb) {
  gulp.src(SRC_JS)
    .pipe(concat('classy.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
    .on('end', cb);
});

gulp.task('default', ['jasmine', 'watch']);

gulp.task('jasmine', ['dist'], function() {
  var jasmineBrowser = require('gulp-jasmine-browser');

  gulp.src(SPECS)
    .pipe(watch(SPECS))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 7007}));
});

gulp.task('watch', function() {
  var restart = require('gulp-restart');

  // will restart the entire gulp
  gulp.watch(SRC_JS, restart);
});