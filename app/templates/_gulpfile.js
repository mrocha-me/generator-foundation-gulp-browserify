var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gulp = require('gulp');

<% if (props.jade) { %>
var processhtml = require('gulp-jade');<% } else { %>
var processhtml = require('gulp-minify-html');<% } %>

<% if (!props.compass) { %>
var sass = require('gulp-sass');<% } else { %>
var compass = require('gulp-compass');<% } %>

var watch = require('gulp-watch');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');

var onError = function(err) {
  console.log(err.message);
  this.emit('end');
};

gulp.task('html', function() {
  return gulp.src('./src/templates/**/*')
    .pipe(processhtml())
    .pipe(gulp.dest('build'))
    .pipe(connect.reload());
});

<% if (!props.compass) { %>
gulp.task('sass', function() {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass())
    .on('error', onError)
    .pipe(gulp.dest('./build/stylesheets'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./build/stylesheets'))
    .pipe(connect.reload());
});
<% } else { %>
gulp.task('sass', function() {
  gulp.src('./src/scss/**/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'build/stylesheets',
      sass: 'src/scss'
    }))
    .on('error', onError)
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./build/stylesheets'))
    .pipe(connect.reload());
});
<% } %>

gulp.task('js', function() {
  return browserify('./src/js/main')
    .bundle()
    .on('error', onError)
    .pipe(source('bundle.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./build/js'))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('./src/templates/**/*', ['html']);
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch('./src/js/**/*.js', ['js']);
});

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task('default', ['html', 'sass', 'js', 'watch', 'connect']);