const express = require('express');
const arj = require('api-response-json');
const firebase = require('../sdk-connect/firebase');
const mailer = require('../sdk-connect/mailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const unirest = require("unirest");
const TwinBcrypt = require('twin-bcrypt');
const emailBlackboardTemplat =require('../public/javascripts/emailBlackboardTemplat')

router.post('/api/blackboard/forgot-password', function (req, res) {
    const { id, email, name } = req.body;

    mailer.sendMail({
        from: '"Blackboard" <support@blackboardapp.co>', // sender address
        to: `${email}`, // list of receivers
        subject: "Blackboard Forgot Password", // Subject line
        html: emailBlackboardTemplat(id, email, name), // html body
    })


    arj.ok(res, true, "ok", {})


});

module.exports = router;