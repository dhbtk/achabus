/**
 * Created by eduardo on 30/06/16.
 */
"use strict";
import gulp from 'gulp';
import gutil from 'gulp-util';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

import sourcemaps from 'gulp-sourcemaps';

import sass from 'gulp-sass';

import es from 'event-stream';

import browserify from 'browserify';
import babelify from 'babelify';
import browserifyInc from 'browserify-incremental';

import del from 'del';

const JS_ROOT = './app/assets/javascripts';
const CSS_ROOT = './app/assets/stylesheets';

const JS_DEST = './public/js';
const CSS_DEST = './public/css';

const MODULES = ['admin', 'frontend'];

/**
 * Task para limpar os diretórios de destino
 */
gulp.task('clean', () => del([JS_DEST + '/*.js', JS_DEST + '/*.map', CSS_DEST + '/*.css', CSS_DEST + '/*.map']));

// JAVASCRIPT

browserifyInc.args.debug = true;

gulp.task('build:js', done => {
    const tasks = MODULES.map(entry => {
        const b = browserify(`${JS_ROOT}/${entry}/index.js`, browserifyInc.args)
            .transform(babelify)
            .transform('browserify-shim');
        browserifyInc(b, {cacheFile: './browserify-cache.json'});

        const bundle = () => {
            return b.bundle()
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(`${entry}.js`))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(JS_DEST));
        };
        return bundle();
    });
    es.merge(tasks).on('end', done);
});

gulp.task('watch:js', () => {
    return gulp.watch(JS_ROOT + '/**/*.js', ['build:js']);
});


// CSS

gulp.task('build:css', done => {
    const tasks = MODULES.map(entry => {
        return gulp.src(`${CSS_ROOT}/${entry}/${entry}.scss`)
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sass({includePaths: ['node_modules/']}).on('error', sass.logError))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(CSS_DEST));
    });
    es.merge(tasks).on('end', done);
});

gulp.task('watch:css', () => {
    return gulp.watch(CSS_ROOT + '/**/*.scss', ['build:css']);
});

gulp.task('build', ['build:js', 'build:css']);

gulp.task('watch', ['watch:js', 'watch:css']);

gulp.task('default', ['clean', 'build', 'watch']);
