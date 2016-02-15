var gulp = require('gulp');
// any promise required for a gulp-jasmine-browser dependency
var Q = require('q');
var jasmineBrowser = require('gulp-jasmine-browser');
var watch = require('gulp-watch');

gulp.task('jasmine', function() {
  var files = [
    'node_modules/babel-polyfill/dist/polyfill.js',
    'bower_components/lodash/lodash.js', 

    'src/classy.js', 
    'spec/**/*Spec.js'
  ];
  return gulp.src(files)
    .pipe(watch(files))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 7007}));
});