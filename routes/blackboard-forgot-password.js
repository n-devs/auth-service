const express = require('express');
const arj = require('api-response-json');
const firebase = require('../sdk-connect/firebase-admin');
const mailer = require('../sdk-connect/mailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const unirest = require("unirest");
const TwinBcrypt = require('twin-bcrypt');
const forgotPasswordBlackboardTemplat = require('../public/javascripts/forgotPasswordBlackboardTemplat')

router.post('/api/blackboard/forgot-password', function (req, res) {
    const { id, email, name } = req.body;
    console.log(req.body);
    // arj.ok(res, true, "ok", {
    //     html: emailBlackboardTemplat(id, email, name)
    // })
    mailer.sendMail({
        from: '"Blackboard" <support@blackboardapp.co>', // sender address
        to: `${email}`, // list of receivers
        subject: "Blackboard Forgot Password", // Subject line
        html: forgotPasswordBlackboardTemplat(id, email, name), // html body
    }).then(function () {
        console.log(1);
        arj.ok(res, true, "ok", {})
    }).catch(function () {
        console.log(2);
        arj.unauthorized(res, false, "unauthorized", {})
    })

});

module.exports = router;