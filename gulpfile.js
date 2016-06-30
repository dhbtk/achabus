/**
 * Created by eduardo on 30/06/16.
 */
"use strict";
var gulp = require('gulp');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var sourcemaps = require('gulp-sourcemaps');

var assign = require('lodash.assign');
var gutil = require('gulp-util');

var opts = assign({}, watchify.args, {
    entries: ['app/assets/javascripts/admin/index.js'],
    debug: true
});

var bundler = watchify(browserify(opts));
bundler.transform(babelify);

function bundle() {
    return bundler.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('admin.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/js'));
}
bundler.on('update', bundle);
bundler.on('log', gutil.log);

gulp.task('watch', bundle);