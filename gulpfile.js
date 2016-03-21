var gulp = require('gulp'),
    mocha = require('gulp-mocha');


gulp.task('test', function() {
    return gulp.src('./test/specs.js')
        .pipe(mocha());
});

gulp.task('default', ['test']);