'use strict';
const gulp = require('gulp');
const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const config = require('./config');
const webpackConfigProduction = require('./webpack.config.production');
const webpackConfig = require('./webpack.config');
const webpack = require('webpack');

var currentWebPackConfig = webpackConfigProduction;

gulp.task('webpack', (callback) => {
    let myConfig = Object.create(currentWebPackConfig);
    webpack(myConfig, function(err, stats) {
        if(err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('lint', () => {
    return gulp.src(config.gulpServerSrc)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('watch', () => {
    currentWebPackConfig = webpackConfig;
    gulp.watch('app/client/**/*', ['webpack']);
});

gulp.task('default', ['webpack']);
