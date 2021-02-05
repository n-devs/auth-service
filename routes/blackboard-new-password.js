const express = require('express');
const arj = require('api-response-json');
const firebase = require('../sdk-connect/firebase');
const mailer = require('../sdk-connect/mailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const unirest = require("unirest");
const TwinBcrypt = require('twin-bcrypt');
const emailBlackboardTemplat = require('../public/javascripts/emailBlackboardTemplat')

router.get('/blackboard/new-password', function (req, res) {
    // const { id, email, name } = req.query;
    res.render('blackboard-new-password', req.query)

});

router.post('/api/blackboard/new-password', function (req, res) {
    const { id, password,password_conf } = req.body;
    const userCollect = firestore.collection("users");
    let userDoc = userCollect.doc(id);
    if(password === password_conf) {
        TwinBcrypt.hash(`${password}`, function (hash) {
            userDoc.update({
                password: hash
            }).then(function () {
                arj.ok(res, true, "ok", {})
            })
           
        })
       
    }else {
        arj.unauthorized(res, false, "password ไม่ตรงกัน", {})
    }
    
 


});

module.exports = router;