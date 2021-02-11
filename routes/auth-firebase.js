const express = require('express');
// const passport = require('passport');
const arj = require('api-response-json');
const firebase = require('../sdk-connect/firebase');
const admin = require('../sdk-connect/firebase-admin');
// const facebookServiceAccount = require('../config/facebook/ServiceAccountKey.json');
// const rapidapiServiceAccount = require('../config/rapidapi/ServiceAccountKey.json');
// const FacebookStrategy = require('passport-facebook').Strategy;
// const jwt = require('jsonwebtoken');
// const unirest = require("unirest");
const router = express.Router();
const firestore = admin.firestore()

const userCollect = firestore.collection("users");

router.post('/api/auth/firebase/email/signin', function (req, res) {
  const { email, password } = req.body;
  console.log("email", typeof email);
  if (typeof email === "undefined" || email === "") {
    arj.unauthorized(res, false, "กรุณากรอก อีเมล", {})
  }
  else if (typeof password === "undefined") {
    arj.unauthorized(res, false, "กรุณากรอก รหัสผ่าน", {})
  }
  else {
    const toArr = password.split("")

    if (toArr.length <= 5) {
      arj.unauthorized(res, false, "กรุณากรอก รหัสผ่าน มากกว่า 6 ตัว", {})
    } else {


      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in
          var user = userCredential.user;
          let userDoc = userCollect.doc(user.uid);
          admin
            .auth()
            .createCustomToken(user.uid)
            .then((customToken) => {
              // Send token back to client
              // console.log("user", user);
              userDoc.get().then(function (_userDoc) {

                if (_userDoc.exists) {
                  arj.ok(res, true, "ok", {
                    // J: user.J,
                    // l: user.l,
                    // m: user.m,
                    // za: user.za,
                    // _lat: user._lat,
                    access_token: customToken,
                    // refreshToken: user.refreshToken,
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    phoneNumber: user.phoneNumber,
                    isAnonymous: user.isAnonymous,
                    tenantId: user.tenantId,
                    metadata: user.metadata,
                    providerData: user.providerData
                  })
                } else {
                  userDoc.set({
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    email: user.email,
                    // emailVerified: user.emailVerified,
                    phoneNumber: user.phoneNumber,
                    // isAnonymous: user.isAnonymous,
                    // tenantId: user.tenantId
                  }).then(function () {
                    arj.created(res, true, "created", {
                      // J: user.J,
                      // l: user.l,
                      // m: user.m,
                      // za: user.za,
                      // _lat: user._lat,
                      access_token: customToken,
                      // refreshToken: user.refreshToken,
                      uid: user.uid,
                      displayName: user.displayName,
                      photoURL: user.photoURL,
                      email: user.email,
                      emailVerified: user.emailVerified,
                      phoneNumber: user.phoneNumber,
                      isAnonymous: user.isAnonymous,
                      tenantId: user.tenantId,
                      metadata: user.metadata,
                      providerData: user.providerData
                    })
                  })
                }
              })

            })
            .catch((error) => {
              arj.unauthorized(res, false, "Error creating custom token", {
                error: error
              })
              console.log('Error creating custom token:', error);
            });
        })
        .catch((error) => {
          console.log(3);
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('errorCode', errorCode);
          console.log('errorMessage', errorMessage);
          arj.unauthorized(res, false, "error signin", {
            errorCode: errorCode,
            errorMessage: errorMessage
          })

        });
    }
  }


});

router.post('/api/auth/firebase/signin', function (req, res) {
  const { uid } = req.body;
  admin
    .auth()
    .createCustomToken(uid)
    .then((customToken) => {
      firebase.auth().signInWithCustomToken(customToken).then((userCredential) => {
        var user = userCredential.user;
        let userDoc = userCollect.doc(user.uid);

        userDoc.get().then(function (_userDoc) {

          if (_userDoc.exists) {
            arj.ok(res, true, "ok", {
              // J: user.J,
              // l: user.l,
              // m: user.m,
              // za: user.za,
              // _lat: user._lat,
              access_token: customToken,
              // refreshToken: user.refreshToken,
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
              email: user.email,
              emailVerified: user.emailVerified,
              phoneNumber: user.phoneNumber,
              isAnonymous: user.isAnonymous,
              tenantId: user.tenantId,
              metadata: user.metadata,
              providerData: user.providerData
            })
          } else {
            userDoc.set({
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
              email: user.email,
              // emailVerified: user.emailVerified,
              phoneNumber: user.phoneNumber,
              // isAnonymous: user.isAnonymous,
              // tenantId: user.tenantId
            }).then(function () {
              arj.created(res, true, "created", {
                // J: user.J,
                // l: user.l,
                // m: user.m,
                // za: user.za,
                // _lat: user._lat,
                access_token: customToken,
                // refreshToken: user.refreshToken,
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
                email: user.email,
                emailVerified: user.emailVerified,
                phoneNumber: user.phoneNumber,
                isAnonymous: user.isAnonymous,
                tenantId: user.tenantId,
                metadata: user.metadata,
                providerData: user.providerData
              })
            })
          }
        })
      })
      // Send token back to client

    })
    .catch((error) => {
      arj.unauthorized(res, false, "Error creating custom token", {
        error: error
      })
      console.log('Error creating custom token:', error);
    });
})

router.post('/api/auth/firebase/email/signup', function (req, res) {
  const { email, password, password_conf } = req.body;
  console.log("email", typeof email);
  if (typeof email === "undefined" || email === "") {
    arj.unauthorized(res, false, "กรุณากรอก อีเมล", {})
  }
  else if (typeof password === "undefined") {
    arj.unauthorized(res, false, "กรุณากรอก รหัสผ่าน", {})
  } else if (typeof password_conf === "undefined") {
    arj.unauthorized(res, false, "กรุณากรอก ช่องยืนยันรหัสผ่าน", {})
  } else if (password !== password_conf) {
    arj.unauthorized(res, false, "กรุณากรอก รหัสผ่านให้ตรงกัน", {})
  }
  else {
    const toArr = password.split("")

    if (toArr.length <= 5) {
      arj.unauthorized(res, false, "กรุณากรอก รหัสผ่าน มากกว่า 6 ตัว", {})
    } else {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in 
          var user = userCredential.user;
          let userDoc = userCollect.doc(user.uid);
          admin
            .auth()
            .createCustomToken(user.uid)
            .then((customToken) => {
              userDoc.set({
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
                email: user.email,
                // emailVerified: user.emailVerified,
                phoneNumber: user.phoneNumber,
                // isAnonymous: user.isAnonymous,
                // tenantId: user.tenantId
              }).then(function () {
                arj.created(res, true, "created", {
                  // J: user.J,
                  // l: user.l,
                  // m: user.m,
                  // za: user.za,
                  // _lat: user._lat,
                  access_token: customToken,
                  // refreshToken: user.refreshToken,
                  uid: user.uid,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  email: user.email,
                  emailVerified: user.emailVerified,
                  phoneNumber: user.phoneNumber,
                  isAnonymous: user.isAnonymous,
                  tenantId: user.tenantId,
                  metadata: user.metadata,
                  providerData: user.providerData
                })
              })


              firebase.auth().currentUser.sendEmailVerification()
                .then(() => {
                  console.log("Email verification sent!");
                  // arj.ok(res, true, "ok", {})
                  // Email verification sent!
                  // ...
                })
            })

        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          arj.unauthorized(res, false, "error signup", {
            errorCode: errorCode,
            errorMessage: errorMessage
          })
          // ..
        });
    }
  }


});

router.post('/api/auth/firebase/email/send/verification', function (req, res) {
  // Admin SDK API to generate the password reset link.
  const token = req.headers['access_token'];
  const { email } = req.body;
  console.log(email, token);
  firebase.auth().signInWithCustomToken(token).then((userCredential) => {
    // Signed in
    var user = userCredential.user;

    firebase.auth().currentUser.sendEmailVerification()
      .then(() => {
        arj.ok(res, true, " Email verification sent!", {})
        // Email verification sent!
        // ...
      }).catch(function (error) {
        arj.unauthorized(res, false, "Error email verification sent!", {})
        // An error happened.
      });

    // console.log(user);
  })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      arj.unauthorized(res, false, "Error email verification sent!", {
        errorCode: errorCode,
        errorMessage: errorMessage
      })
      // ...
    });

});

router.post('/api/auth/firebase/email/send/reset-password', function (req, res) {

  const { email } = req.body;

  const emailAddress = email;
  // ...
  firebase.auth().sendPasswordResetEmail(emailAddress).then(function () {
    // Email sent.
    arj.ok(res, true, "Reset password sent!", {})
  }).catch(function (error) {
    // An error happened.
    arj.unauthorized(res, false, "Error reset password sent!", {})
  });
})

router.post('/api/auth/firebase/update/email', function (req, res) {
  // Admin SDK API to generate the password reset link.
  const token = req.headers['access_token'];
  const { email } = req.body;
  // console.log(email, token);
  firebase.auth().signInWithCustomToken(token).then((userCredential) => {
    // Signed in
    // var user = userCredential.user;
    firebase.auth().updateEmail(email).then(function () {
      // Update successful.
      userDoc.update({ email: email }).then(function () {
        arj.ok(res, true, "update email ok.", {})
      })

    }).catch(function (error) {
      // An error happened.
      arj.unauthorized(res, false, "update email error.", {})
    });
    // console.log(user);
  })

})

router.put('/api/auth/firebase/update/profile', function (req, res) {
  // Admin SDK API to generate the password reset link.
  const token = req.headers['access_token'];
  // const { email } = req.body;
  // console.log(email, token);
  firebase.auth().signInWithCustomToken(token).then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    let userDoc = userCollect.doc(user.uid);
    firebase.auth().currentUser.updateProfile({ ...req.body }).then(function () {
      // Update successful.
      userDoc.update({ ...req.body }).then(function () {
        arj.ok(res, true, "profile update ok.", {})
      })

    }).catch(function (error) {
      // An error happened.
      arj.unauthorized(res, false, "profile update error.", {})
    });
    // console.log(user);
  })
})

router.get('/api/auth/firebase/profile', function (req, res) {
  // Admin SDK API to generate the password reset link.
  const token = req.headers['access_token'];
  // const { email } = req.body;
  // console.log(email, token);
  firebase.auth().signInWithCustomToken(token).then((userCredential) => {
    // Signed in
    var _user = userCredential.user;
    const user = firebase.auth().currentUser;
    console.log(user);
    if (user != null) {

      arj.ok(res, true, "ok.", { ...user })
    } else {
      arj.unauthorized(res, false, "profileerror.", {})
    }
  })
})

router.put('/api/auth/firebase/update/password', function (req, res) {
  // Admin SDK API to generate the password reset link.
  // const token = req.headers['access_token'];
  const { email, password, newPassword } = req.body;
  // console.log(email, token);
  const user = firebase.auth()
  // firebase.auth().signInWithCustomToken(token).then((userCredential) => {
  user.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log(user);
      user.updatePassword(newPassword).then(function () {
        // Update successful.
        arj.ok(res, true, "update password ok.", {})
      }).catch(function (error) {
        // An error happened.
        arj.unauthorized(res, false, "update password error.", {})
      });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;

      arj.unauthorized(res, false, "password ไม่ถูกต้อง.", {
        errorCode: errorCode,
        errorMessage: errorMessage
      })
    });
  // })

})

router.delete('/api/auth/firebase/signout', function (req, res) {
  // Admin SDK API to generate the password reset link.
  const token = req.headers['access_token'];
  // const { email } = req.body;
  // console.log(email, token);
  firebase.auth().signInWithCustomToken(token).then((userCredential) => {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      arj.ok(res, true, "signout ok.", {})
    }).catch((error) => {
      // An error happened.
      arj.unauthorized(res, false, "profile update error.", {
        error: error
      })
    });
  })

})

module.exports = router;