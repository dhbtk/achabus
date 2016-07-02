/**
 * Created by eduardo on 30/06/16.
 */
"use strict";
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

var sass = require('gulp-sass');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');


// JAVASCRIPT

function rebundleAdmin(bundler) {
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

gulp.task('adminjs', () => {
    const bundler = browserify('./app/assets/javascripts/admin/index.js');
    bundler.transform(babelify);
    bundler.transform('browserify-shim');

    return (rebundleAdmin(bundler))();
});

gulp.task('watchadminjs', () => {
    watchify.args.debug = true;
    const bundler = watchify(browserify('./app/assets/javascripts/admin/index.js'), watchify.args);
    bundler.transform(babelify);
    bundler.transform('browserify-shim');

    bundler.on('update', rebundleAdmin(bundler));
    bundler.on('log', gutil.log.bind(gutil));

    return (rebundleAdmin(bundler))();
});

function rebundleFrontend(bundler) {
    return function () {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('frontend.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./public/js'));
    }
}

gulp.task('frontendjs', () => {
    const bundler = browserify('./app/assets/javascripts/frontend/index.js');
    bundler.transform(babelify);
    bundler.transform('browserify-shim');

    return (rebundleFrontend(bundler))();
});

gulp.task('watchfrontendjs', () => {
    watchify.args.debug = true;
    const bundler = watchify(browserify('./app/assets/javascripts/frontend/index.js'), watchify.args);
    bundler.transform(babelify);
    bundler.transform('browserify-shim');

    bundler.on('update', rebundleFrontend(bundler));
    bundler.on('log', gutil.log.bind(gutil));

    return (rebundleFrontend(bundler))();
});

gulp.task('js', ['frontendjs', 'adminjs']);
gulp.task('watchjs',['watchadminjs', 'watchfrontendjs']);

// CSS

gulp.task('admincss', () => {
    return gulp.src('./app/assets/stylesheets/admin/admin.scss')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass({includePaths: ['node_modules/']}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'))
        .pipe(livereload());
});

gulp.task('frontendcss', () => {
    return gulp.src('./app/assets/stylesheets/frontend/frontend.scss')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass({includePaths: ['node_modules/']}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'))
        .pipe(livereload());
});

gulp.task('css',['admincss','frontendcss']);

gulp.task('watchcss', () => {
    livereload.listen();
    return gulp.watch('./app/assets/stylesheets/**/*.scss', ['admincss', 'frontendcss']);
});

gulp.task('build', ['js', 'css']);

gulp.task('default', ['watchjs', 'css', 'watchcss']);