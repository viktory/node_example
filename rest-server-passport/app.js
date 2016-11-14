var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

var authenticate = require('./authenticate');
var config = require('./config');

mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

var routes = require('./routes/index');
var users = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var favoriteRouter = require('./routes/favoriteRouter');

var app = express();
// Secure traffic only
app.all('*', function(req, res, next){
    console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
    if (req.secure) {
        return next();
    };

    res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// passport config
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leadership', leaderRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

module.exports = app;

/**
 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnt9LCJnZXR0ZXJzIjp7fSwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsiZmlyc3RuYW1lIjoiZGVmYXVsdCIsImxhc3RuYW1lIjoiZGVmYXVsdCIsImFkbWluIjoiaW5pdCIsIl9fdiI6ImluaXQiLCJ1c2VybmFtZSI6ImluaXQiLCJoYXNoIjoiaW5pdCIsInNhbHQiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6eyJmaXJzdG5hbWUiOnRydWUsImxhc3RuYW1lIjp0cnVlfSwiaW5pdCI6eyJfX3YiOnRydWUsImFkbWluIjp0cnVlLCJ1c2VybmFtZSI6dHJ1ZSwiaGFzaCI6dHJ1ZSwic2FsdCI6dHJ1ZSwiX2lkIjp0cnVlfSwibW9kaWZ5Ijp7fSwicmVxdWlyZSI6e319LCJzdGF0ZU5hbWVzIjpbInJlcXVpcmUiLCJtb2RpZnkiLCJpbml0IiwiZGVmYXVsdCIsImlnbm9yZSJdfSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9fSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImZpcnN0bmFtZSI6IiIsImxhc3RuYW1lIjoiIiwiYWRtaW4iOnRydWUsIl9fdiI6MCwidXNlcm5hbWUiOiJhZG1pbiIsImhhc2giOiI2NGYwYjYyOGM5NjI5M2QwNmVhMWFmNmI5NTkxMjdkODNlYmEzNjFlNzk3MzY3ZDFhN2IzM2Y4NDZmM2RlNmUxOTJhZGU4ZmQ0ZTJjYjRhNmQ5NzU5ZDFmODgyNzA3YjEyNzhiMWMxNmUzZmMyMmUzYjZkNzliMGQ4MTdmMWNjY2JiN2I0YTZlNzBkZGU0ZGQwNjQwMGEzMjFkNGIwMzJhMWE1ODI0ZTA4YTEwY2ExMDAwNGFlMjU2YzBmMTA3MjllZGY2YmU4ZGI0NjZlMGY1ODZmOWE5YWI3YmJiZTgwOWJkMmI5Y2RkZTFjODJmYWI5MWUyZWY0NjY0ZmFiZTMzYThjN2ExMDU1MDlkNTZmNjQ3NmUwN2MxYTViYzVlYzg4ZWI0M2ZhZDIwYTk0MzAwY2RkZDE5MGY5Yzc3M2FjYmQ5NWQyN2RiMzNlOWQ1MGI0ZjUzNDVkMGJiNzA4Yjg2YTQyYTg0MGI5YTQyY2IwMTU0NTVlY2U4YmY0ZWUyZTA3Y2VjYjljMTM2N2Y3OTZjOTMyNDYxZGQ5NTBmMDEwYzAxMWU3ZmNlYzM3Y2ZhYzI2Y2Y2MzZmZDU0NTYxMzNmY2RjNWU4NGExYzRkNGVhNmIyZmRjZjBiNjc3YTJmMjI4OWRhNGEyYTcxOTI1NDM2ZjNhYzU3NGY0N2RlOWMzZDNhZDFlMmE2MjhjMTAyN2EyMDEzMjE1ODNhODlkMDgxMjU3NTQ3NGJkZjg0ZDk5MTFjNTk2YzdmMGNjMjM5NzM1OTBjYWEzYmViYWRlNzBhOWUxNTY3NDNmNzgxNWNmZDEwMTcxNDRjMDAxNDM5OWYwMGE2ZjAyY2VmZWIyNzk1ODI4ZTMxNDBlZDg0NTNjM2ZhYzkwZDZmMWM0YmY2YzgwOGI3ZTA5M2IzZDM2NWNkNDU5OWYyN2EwZjdmYmY1ZmI0M2U4Yjc1ZTU2MjU1YTQ0Y2Y1NWM0OTk1OWIyZGQ4MzVkZTNiN2U1M2E3YWQzZDQ2YzA2OGM0NDVhZmUzNzE2OWYwOWZjMjM2ZDIwYmY4MzdlNjU1NGE2N2U4NTAwOWExMTRmMWJlNzhiY2JjNTJhNTU1NDBkNWNjYWY1NjRmNzQzMDlkMGY2NjVhMDc3NmYyZmRhYTA3YjQ5ZmNiM2QxZGY1YWMxN2I5MTRlNzI3MzRhYTRkMDI1ZjBiOTM3NjE5YWZhYjRjNDQ3NWJiYjlmMzdhYWFjMWRhYjQxYzk1ZDU4OTM3M2NmZjVjYWU1NTMxYzI0NjA4OGM0YzFlMjEzMDQ0MWFjMmExYmZhYzc2ZWU4Zjc4YzQ1NzI2MjI3Y2U0M2JhMzA0NjQ1N2UzNzI5ODgyMTMyYTljOTg5ZTg1Iiwic2FsdCI6ImNkMDdiOTFkOTgwNzZkMTkwNDIxNzlkNTc2ZWZlNmExNTNjODg0YTZiODBlNDAxY2RhNmQxMTM5MzllOGRkMjUiLCJfaWQiOiI1ODE4ZmM5MzFkN2RiNTE0MWMxMDlmZjIifSwiX3ByZXMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W251bGwsbnVsbCxudWxsXSwiJF9fb3JpZ2luYWxfdmFsaWRhdGUiOltudWxsXSwiJF9fb3JpZ2luYWxfcmVtb3ZlIjpbbnVsbF19LCJfcG9zdHMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W10sIiRfX29yaWdpbmFsX3ZhbGlkYXRlIjpbXSwiJF9fb3JpZ2luYWxfcmVtb3ZlIjpbXX0sImlhdCI6MTQ3ODg5NTcyMiwiZXhwIjoxNDc4ODk5MzIyfQ.5DXjO05xbyHlA1AHbYDwjgcOByYUxeeQbLvZkdLU1Ew
 */
