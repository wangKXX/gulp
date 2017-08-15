var pub = require('../src/gulp-pub.js');
var gulp = require('gulp');
var rename = require('gulp-rename');

var functionPaths = {
	img: 'assets/images',
	js: 'builds/scripts',
	tpl: 'angular/templates',
	at: '@/test/root/dir',
	at2: '@http://testing.com'
};

gulp.task('buffers', function buffersTask() {
	return gulp.src('input/*.*')
		.pipe(pub(functionPaths))
		.pipe(rename(function renamePath(path) {
			path.basename += '-buffer';
		}))
		.pipe(gulp.dest('output'));
});

gulp.task('streams', function streamsTask() {
	return gulp.src('input/*.*', { buffer: false })
		.pipe(pub(functionPaths))
		.pipe(rename(function renamePath(path) {
			path.basename += '-stream';
		}))
		.pipe(gulp.dest('output'));
});

gulp.task('default', ['buffers', 'streams']);
