var gulp = require("gulp"),
    less = require("gulp-less"),
    notify = require("gulp-notify"),
    plumber = require("gulp-plumber");//异常处理包
//图片压缩插件，png,jpg  
/*var smushit = require('gulp-smushit');*/


const babel = require('gulp-babel');//es6转换
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');//重命名
const cssnano = require('gulp-cssnano');//css压缩
const concat = require('gulp-concat');//合并
const browserify = require('browserify');//允许js以nodejs的形式书写
const source = require('vinyl-source-stream');
//图片压缩插件
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache");
var pngquant = require("imagemin-pngquant");

// 编译并压缩js
gulp.task('convertJS', function(){
  return gulp.src('public/resourcejs/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});

// 将js转化成浏览器识别的形式
gulp.task("browserify", function () {
    var b = browserify({
        entries: [
        "public/resourcejs/test.js",
        "public/resourcejs/index.js"
        ]
    });
    return b.bundle()
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("public/js"));
});  
  
// 合并并压缩css
gulp.task('convertCSS', function(){
  return gulp.src('public/css/*.css')
    .pipe(cssnano())
    .pipe(rename(function(path){
      path.basename += '.min';
    }))
    .pipe(gulp.dest('public/mincss'));
});

//less编译
var browserSync = require('browser-sync').create();//浏览器实时更新
gulp.task("testless",function(){
    gulp.src("public/less/*.less")
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))//设置当less编译出错的时候提示错误
    .pipe(less())
    .pipe(gulp.dest("public/css"))
    .pipe(browserSync.stream());
    
});

gulp.task("Imagesmin",function(){
    return gulp.src("public/resourceimages/*.{png,jpg}")
                .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
                .pipe(cache(imagemin({
                        progressive: true,
                        svgoPlugins: [{removeViewBox: false}],
                        use: [pngquant()]
                })))
                .pipe(gulp.dest("public/images"));
});

/*//图片压缩==这种方式会报错，不知道什么原因
gulp.task("imagemin",function(){
    return  gulp.src('public/resourceimages/*.{jpg,png}')
            .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
            .pipe(smushit({
                verbose: true
            }))
            .pipe(gulp.dest('public/images'));  
});*/

//服务端实现自动更新  *需要借助谷歌插件
/*var nodemon = require('gulp-nodemon');
gulp.task("node",function() {
     nodemon({
        script: 'app.js',
        ext: 'js html',
        env: {
             'NODE_ENV': 'development'
        }
     })
});*/

gulp.task("server",function(e){
    browserSync.init({
        proxy: "localhost:3000"
    });
    gulp.watch("public/resourceimages/*.{jpg,png}",['Imagesmin']);
    gulp.watch("public/less/*.less",['testless']);
    gulp.watch(["views/*html","public/css/*.css","public/js/*.js"]).on("change",browserSync.reload);
    gulp.watch('public/css/*.css', ['convertCSS']);
    gulp.watch('public/resourcejs/*.js', ['convertJS', 'browserify']);
});

gulp.task("default",['server']);
