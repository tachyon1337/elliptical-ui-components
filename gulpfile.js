
var gulp=require('gulp');

gulp.task('default',function(){
    console.log('echo default task');
});

gulp.task('build',function(){
    copyScripts();
});

function copyScripts(){
    gulp.src('./lib/**/*.*')
        .pipe(gulp.dest('./dist/ui/'));
}