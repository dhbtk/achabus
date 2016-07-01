/**
 * Created by eduardo on 30/06/16.
 */
"use strict";
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var sourcemaps = require('gulp-sourcemaps');

var sass = require('gulp-sass');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');


// JAVASCRIPT

function rebundle(bundler) {
    return function () {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('admin.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./public/js'));
    }
}

gulp.task('js', () => {
    const bundler = browserify('./app/assets/javascripts/admin/index.js');
    bundler.transform(babelify);

    return (rebundle(bundler))();
});

gulp.task('watchjs', () => {
    watchify.args.debug = true;
    const bundler = watchify(browserify('./app/assets/javascripts/admin/index.js'), watchify.args);
    bundler.transform(babelify);

    bundler.on('update', rebundle(bundler));
    bundler.on('log', gutil.log.bind(gutil));

    return (rebundle(bundler))();
});

// CSS

gulp.task('css', () => {
    return gulp.src('./app/assets/stylesheets/admin.scss')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass({includePaths: ['node_modules/']}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'));
});

gulp.task('watchcss', () => {
    return gulp.watch('./app/assets/stylesheets/admin.scss', ['css']);
});

gulp.task('build', ['js', 'css']);

gulp.task('default', ['watchjs', 'css', 'watchcss']);