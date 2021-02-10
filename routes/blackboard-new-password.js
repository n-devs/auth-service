const express = require('express');
const arj = require('api-response-json');
const firebase = require('../sdk-connect/firebase-admin');
// const mailer = require('../sdk-connect/mailer');
// const jwt = require('jsonwebtoken');
const router = express.Router();
// const unirest = require("unirest");
const TwinBcrypt = require('twin-bcrypt');
// const emailBlackboardTemplat = require('../public/javascripts/emailBlackboardTemplat')

const firestore = firebase.firestore()

router.get('/blackboard/new-password', function (req, res) {
    // const { id, email, name } = req.query;
    res.render('blackboard-new-password', { data: { id: req.query.id } })

});

router.post('/api/blackboard/new-password', function (req, res) {
    const { id, password, password_conf } = req.body;
    const userCollect = firestore.collection("users");
    console.log(req.body);

    if (password === password_conf) {
        console.log(1);

        TwinBcrypt.hash(`${password}`, function (hash) {
            console.log(2);
           
            let userDoc = userCollect.doc(id);
            userDoc.update({
                password: hash
            }).then(function () {
                arj.ok(res, true, "ok", {})
            }).catch(function () {
                arj.unauthorized(res, false, "ไม่พบ ผู้ใช้", {})
            })

        })

    } else {
        console.log(4);
        arj.unauthorized(res, false, "password ไม่ตรงกัน", {})
    }




});

module.exports = router;