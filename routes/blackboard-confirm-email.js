const express = require('express');
const arj = require('api-response-json');
const firebase = require('../sdk-connect/firebase');
const mailer = require('../sdk-connect/mailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const unirest = require("unirest");
const TwinBcrypt = require('twin-bcrypt');



const firestore = firebase.firestore()

router.get('/blackboard/confirm-email', function (req, res) {
    const { id,email } = req.query;

    const emailCollect = firestore.collection("email");
    const emailDoc = emailCollect.doc(id);
    emailDoc.update({
        confirm: true
    }).then(function () {
        res.render('blackboard-confirm-email', { email: email }); // load the index.ejs file
       
    })

});

module.exports = router;