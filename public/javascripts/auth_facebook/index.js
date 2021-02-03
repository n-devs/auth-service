const express = require('express');
const passport = require('passport');
const arj = require('api-response-json');
const firebase = require('../../../sdk-connect/firebase');
const facebookServiceAccount = require('../../../config/facebook/ServiceAccountKey.json');
const rapidapiServiceAccount = require('../../../config/rapidapi/ServiceAccountKey.json');
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const unirest = require("unirest");
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
  arj.ok(res, true, "ok", { ...req.user })

});

router.get('/example/facebook/error', isLoggedIn, function (req, res) {
  res.render('facebook/error.ejs');
});

router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email', 'user_photos', 'user_gender']
}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/api/example/facebook/profile',
    failureRedirect: '/api/example/facebook/error'
  }));

router.get('/facebook/logout', async function (req, res) {
  const geoReq = unirest("GET", "http://gd.geobytes.com/GetCityDetails");

  const facebookUser = firestore.collection("facebook").doc(req.user.id);
  const userCollect = firestore.collection("users");
  const authCollect = firestore.collection("authentication");

  // console.log(req.user.id);
  // const token = jwt.sign({ session: req.sessionID }, `${req._startAt[1]}`, { expiresIn: '3d' });
  // const logCol = firestore.collection("_log");

  await facebookUser.get().then(function (doc) {

    geoReq.end(function (_geoRes) {
      if (doc.exists) {

        let userDoc = userCollect.doc(doc.data().uid);
        userDoc.get().then(function (_userDoc) {
 
          if (_userDoc.exists) {
   
            let sessionID = authCollect.doc(_userDoc.data().id).collection("status").doc(req.sessionID);
            let authLog = authCollect.doc(_userDoc.data().id).collection("_log");

            sessionID.delete()

            authLog.doc(`signin-${req.sessionID}`).get().then(function (docAuthLog) {
      
              authLog.doc(`signout-${req.sessionID}`).set({
                ...docAuthLog.data(), ["_endTime"]: req._startTime,
                ["_endAt"]: req._startAt,
              }).then(function () {
                req.logout();

                res.redirect('/api/example/facebook');
              })
            })

          } else {
            console.log("no uid");
          }
        })

      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })

  }).catch(function (error) {
    console.log("Error getting document:", error);
  });


});


async function isLoggedIn(req, res, next) {
  console.log(req._startAt);
  if (req.isAuthenticated()) {
    const geoReq = unirest("GET", "http://gd.geobytes.com/GetCityDetails");

    const facebookUser = firestore.collection("facebook").doc(req.user.id);
    const userCollect = firestore.collection("users");
    const authCollect = firestore.collection("authentication");

    const token = jwt.sign({ session: req.sessionID }, `${req._startAt[1]}`, { expiresIn: '3d' });
    // const logCol = firestore.collection("_log");

    await facebookUser.get().then(function (doc) {
      geoReq.end(function (_geoRes) {
        if (doc.exists) {
          let userDoc = userCollect.doc(doc.data().uid);
          userDoc.get().then(function (_userDoc) {
            if (_userDoc.exists) {
              let sessionID = authCollect.doc(_userDoc.data().id).collection("status").doc(req.sessionID);
              let authLog = authCollect.doc(_userDoc.data().id).collection("_log").doc(`signin-${req.sessionID}`);

              sessionID.update({
                uid: userDoc.id,
                session: req.sessionID,
                provider: req.user.provider,
                facebook_id: req.user.id,
                login_on: true,
                date: req._startTime,
                key_token: `${req._startAt[1]}`,
                token: token,
                remoteAddress: req._remoteAddress,
                ...req.headers,
                ..._geoRes.body
              }).catch(function () {
                sessionID.set({
                  uid: userDoc.id,
                  session: req.sessionID,
                  provider: req.user.provider,
                  facebook_id: req.user.id,
                  login_on: true,
                  date: req._startTime,
                  key_token: `${req._startAt[1]}`,
                  token: token,
                  remoteAddress: req._remoteAddress,
                  ...req.headers,
                  ..._geoRes.body
                })
              });

              authLog.update({
                id: authLog.id,
                uid: userDoc.id,
                session: req.sessionID,
                provider: req.user.provider,
                facebook_id: req.user.id,
                status: "signin",
                date: req._startTime,
                key_token: `${req._startAt[1]}`,
                token: token,
                _remoteAddress: req._remoteAddress,
                _endTime: req._startTime,
                _endAt: req._startAt,
                ...req.headers,
                ..._geoRes.body
              }).catch(function () {
                authLog.set({
                  id: authLog.id,
                  uid: userDoc.id,
                  session: req.sessionID,
                  provider: req.user.provider,
                  facebook_id: req.user.id,
                  status: "signin",
                  date: req._startTime,
                  key_token: `${req._startAt[1]}`,
                  token: token,
                  _remoteAddress: req._remoteAddress,
                  _startTime: req._startTime,
                  _startAt: req._startAt,
                  ...req.headers,
                  ..._geoRes.body
                });
              });



            } else {
              console.log("no uid");
            }
          })

        } else {
          // doc.data() will be undefined in this case
          let userDoc = userCollect.doc();
          userDoc.set({
            id: userDoc.id,
            name: req.user.displayName,
            facebook_id: req.user.id
          }).then(function () {
            facebookUser.set({
              uid: userDoc.id,
              ...req.user
            }).then(function () {
              let sessionID = authCollect.doc(userDoc.id).collection("status").doc(req.sessionID);
              let authLog = authCollect.doc(userDoc.id).collection("_log").doc(`signup-${req.sessionID}`);
              sessionID.update({
                uid: userDoc.id,
                session: req.sessionID,
                provider: req.user.provider,
                facebook_id: req.user.id,
                login_on: true,
                date: req._startTime,
                key_token: `${req._startAt[1]}`,
                token: token,
                remoteAddress: req._remoteAddress,
                ...req.headers,
                ..._geoRes.body
              }).catch(function () {
                sessionID.set({
                  uid: userDoc.id,
                  session: req.sessionID,
                  provider: req.user.provider,
                  facebook_id: req.user.id,
                  login_on: true,
                  date: req._startTime,
                  key_token: `${req._startAt[1]}`,
                  token: token,
                  remoteAddress: req._remoteAddress,
                  ...req.headers,
                  ..._geoRes.body
                });
              });
              authLog.update({
                id: authLog.id,
                uid: userDoc.id,
                session: req.sessionID,
                provider: req.user.provider,
                facebook_id: req.user.id,
                status: "signup",
                date: req._startTime,
                key_token: `${req._startAt[1]}`,
                token: token,
                _remoteAddress: req._remoteAddress,
                _endTime: req._startTime,
                _endAt: req._startAt,
                ...req.headers,
                ..._geoRes.body
              }).catch(function () {
                authLog.set({
                  id: authLog.id,
                  uid: userDoc.id,
                  session: req.sessionID,
                  provider: req.user.provider,
                  facebook_id: req.user.id,
                  status: "signup",
                  date: req._startTime,
                  key_token: `${req._startAt[1]}`,
                  token: token,
                  _remoteAddress: req._remoteAddress,
                  _startTime: req._startTime,
                  _startAt: req._startAt,
                  ...req.headers,
                  ..._geoRes.body
                });
              });

              // arj.ok(res, true, "ok", { ...req.user })
            })
          })
          console.log("No such document!");
        }
      })

    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
    return next();
  }


  res.redirect('/api/example/facebook');
}


module.exports = router;