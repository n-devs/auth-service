const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
var router = express.Router();

// app.set('view engine', 'ejs');

// app.use(session({
//     resave: false,
//     saveUninitialized: true,
//     secret: 'SECRET'
//   }));
  
// app.use(passport.initialize());
// app.use(passport.session());

const config = {
    facebookAuth: {
        clientID: "1325183661180189",
        clientSecret: "1daf33f284d354973044aebf8b75cbb6",
        callbackURL: "http://localhost:3000/api/auth/facebook/callback"
    }
}



passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}
));

router.get('/example/facebook', function (req, res) {
    res.render('facebook/index.ejs'); // load the index.ejs file
  });
  
  router.get('/example/facebook/profile', isLoggedIn, function (req, res) {
      console.log(req.user);
    res.render('facebook/profile.ejs', {
      user: req.user // get the user out of session and pass to template
    });
  });
  
  router.get('/example/facebook/error', isLoggedIn, function (req, res) {
    res.render('facebook/error.ejs');
  });
  
  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope:['public_profile', 'email']
  }));
  
  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/api/example/facebook/profile',
      failureRedirect: '/api/example/facebook/error'
    }));
  
  router.get('/facebook/logout', function (req, res) {
    req.logout();
    res.redirect('/api/example/facebook');
  });
  
  
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/api/example/facebook');
  }
module.exports = router;