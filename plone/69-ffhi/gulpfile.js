/// <binding BeforeBuild='sass' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

///
// include plug-ins
var gulp = require('gulp');
var sass = require('gulp-sass');

var config = {
    appsass: 'sass/*.scss',
    cssout: 'css'
}

gulp.task('sass', function () {
    gulp.src(config.appsass)
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(config.cssout));
});

gulp.task('sass:watch', function () {
    gulp.watch(config.appsass, ['sass']);
});

//Set a default tasks
gulp.task('default', ['sass'], function () {

});