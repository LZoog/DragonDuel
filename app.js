var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var methodOverride = require('method-override');

var flash = require('connect-flash');
var passport = require('passport');

var mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONN_DRAGON_DUEL);

var app = express();
var http = require('http').Server(app);
http.listen(80);
var io = require('socket.io')(http);

//when this event fires, execute this callback function
// io.on('connect', function(socket) {
//   console.log('connected from app.js');
//   // var user = global.currentUser.local;
//   // console.log('hits',user);
//   // User.findOne({ 'local.username': user.username }, { 'local.battlefield': true }, function(err, user) {
//   //   if (err) console.log(err);
//   //   var data = {};
//   //   data.username = user.username;
//   // });
// });
app.set('socketio', io);

var routes = require('./routes/index');
var users = require('./routes/users');
var battlefield = require('./routes/battlefield')(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(ejsLayouts);


//AUTHENTICATION
//we want every view to automatically use flash
app.use(flash());
// use express.session() before passport.session() to ensure that the login session is restored in the correct order
app.use(session({ secret: 'DD-PASSPORT-AUTH' }));
// passport.initialize() middleware is required to initialize Passport.
app.use(passport.initialize());
// If your application uses persistent login sessions, passport.session()
app.use(passport.session());
// Set Passport configuration
require('./config/passport')(passport);
app.use(methodOverride(function(request, response) {
  if(request.body && typeof request.body === 'object' && '_method' in request.body) {
    var method = request.body._method;
    delete request.body._method;
    return method;
  }
}));
// Custom middleware to allow global access to currentUser variable
app.use(function(req, res, next) {
  global.currentUser = req.user;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/duel', battlefield);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
