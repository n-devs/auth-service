var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var facebookRouter = require('./routes/auth-facebook')
var confirmEmailRouter = require('./routes/blackboard-confirm-email')
var forgotEmailRouter = require('./routes/blackboard-forgot-password')
var newPasswordRouter = require('./routes/blackboard-new-password')
var authFirebaseRouter = require('./routes/auth-firebase')

const session = require('express-session');
const passport = require('passport');
const apiSdk = require('./test-sdk')
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use('/', [facebookRouter,confirmEmailRouter,newPasswordRouter,forgotEmailRouter,authFirebaseRouter]);
// app.use('/users', usersRouter);
app.use('/api', [facebookRouter]);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
