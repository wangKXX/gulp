var express = require('express')
  , routes = require('./routes')
  , body = require('body-parser')
  , http = require('http')
  , path = require('path')
 
  ,domain = require("domain");
  
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
/*
 * tips:用domain作为express的中间件处理所有request和response的异步请求
 * */
app.configure(function(){
    app.use(function(res, req, next){
        var reqDomain = domain.create();
        reqDomain.on('error', function (err) { 
            console.log('捕获请求异常');
            res.send(500, err.stack);
        });
        reqDomain.run(next);
    });
});
/*
 tips:process对象是NOde的全局进程对象，包括了该进程的信息
 * */
process.on("uncaughtException",function(err){
    console.error("uncaughtException ERROR");
    if (typeof err === 'object') {
        if (err.message) {
            console.error('ERROR: ' + err.message)
        }
        if (err.stack) {
            console.error(err.stack);
        }
    } else {
        console.error('argument is not an object');
    }
});
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
http.createServer(app).listen(app.get('port'), function(){
  console.log('服务启动' + app.get('port'));
});
