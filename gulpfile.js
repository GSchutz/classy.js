var gulp = require('gulp');
// any promise required for a gulp-jasmine-browser dependency
var Q = require('q');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine', function() {
  return gulp.src([
    'node_modules/babel-polyfill/dist/polyfill.js',
    'bower_components/lodash/lodash.js', 

    'src/classy.js', 
    'spec/**/*Spec.js'
  ])
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 7007}));
});