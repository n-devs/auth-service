const express = require('express');
const passport = require('passport');
const arj = require('api-response-json');
const firebase = require('../../../sdk-connect/firebase');
const facebookServiceAccount = require('../../../config/facebook/ServiceAccountKey.json');
const FacebookStrategy = require('passport-facebook').Strategy;
const router = express.Router();

// const facebook =require('../../../sdk-connect/facebook');
const firestore = firebase.firestore()

passport.use(new FacebookStrategy({ ...facebookServiceAccount }, function (accessToken, refreshToken, profile, done) {
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

router.get('/facebook/callback', isLoggedIn, async function (req, res) {
  // get the user out of session and pass to template

  const facebookUser = firestore.collection("facebook").doc(req.user.id);
  const mainUser = firestore.collection("users").doc();
  const authCol = firestore.collection("authentication");
  // const logCol = firestore.collection("_log");
  await facebookUser.get().then(function (doc) {
    // console.log("isAuthenticated",req.isAuthenticated());
    // console.log("headers:",req.headers);
    // console.log("_startTime:",req._startTime);
    // console.log("_remoteAddress:",req._remoteAddress);
    if (doc.exists) {
      console.log("Document data:", doc.data());
      arj.ok(res, true, "ok", { ...doc.data() })
    } else {
      // doc.data() will be undefined in this case
      mainUser.set({
        id: mainUser.id,
        name: req.user.displayName,
        facebook_id: req.user.id
      }).then(function () {
        facebookUser.set({
          uid: mainUser.id,
          ...req.user
        }).then(function () {
          let sessionID = authCol.doc(mainUser.id).collection("status").doc(req.sessionID);
          let authLog = authCol.doc(mainUser.id).collection("_log").doc();
          sessionID.set({
            uid: mainUser.id,
            session: req.sessionID,
            provider: req.user.provider,
            facebook_id: req.user.id,
            login_on: true,
            date: req._startTime,
            remoteAddress: req._remoteAddress,
            ...req.headers
          });
          authLog.set({
            uid: mainUser.id,
            session: req.sessionID,
            provider: req.user.provider,
            facebook_id: req.user.id,
            status: "signup",
            date: req._startTime,
            remoteAddress: req._remoteAddress,
            ...req.headers
          });

          arj.ok(res, true, "ok", { ...req.user })
        })
      })
      console.log("No such document!");
    }
  }).catch(function (error) {
    console.log("Error getting document:", error);
  });
});

router.get('/example/facebook/error', isLoggedIn, function (req, res) {
  res.render('facebook/error.ejs');
});

router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email', 'user_photos', 'user_gender']
}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/api/facebook/callback',
    failureRedirect: '/api/example/facebook/error'
  }));

router.get('/facebook/logout', function (req, res) {
  req.logout();
  res.redirect('/api/example/facebook');
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    // console.log(req,req.isAuthenticated());

    // console.log("_peername:",req._peername());
    // console.log("sessions:",req.sessions);
    return next();
  }


  res.redirect('/api/example/facebook');
}
module.exports = router;