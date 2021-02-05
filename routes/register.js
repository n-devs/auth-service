const express = require('express');
const arj = require('api-response-json');
const firebase = require('../sdk-connect/firebase');
const mailer = require('../sdk-connect/mailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const unirest = require("unirest");
const TwinBcrypt = require('twin-bcrypt');
const emailBlackboardTemplat = require('../public/javascripts/emailBlackboardTemplat')



const firestore = firebase.firestore()

function TypeOf(val) {
    return typeof val === "undefined" ? false : true
}

router.post(`/auth/register`, function (req, res, next) {
    const { name, email, password, password_conf } = req.body;
    const userCollect = firestore.collection("users");
    const authCollect = firestore.collection("authentication");
    const emailCollect = firestore.collection("email");
    const geoReq = unirest("GET", "http://gd.geobytes.com/GetCityDetails");
    const token = jwt.sign({ session: req.sessionID }, `${req._startAt[1]}`, { expiresIn: '3d' });

    if (TypeOf(name) && TypeOf(email) && TypeOf(password) && TypeOf(password_conf)) {
        if (password === password_conf) {
            let findEmail = userCollect.where("email", "==", `${email}`);
            findEmail.get().then(function (doc) {
                if (doc.exists) {
                    arj.unauthorized(res, false, `${email} ได้ลงทะเบียนไว้แล้ว`, {})
                } else {

                    geoReq.end(function (_geoRes) {
                        let userDoc = userCollect.doc();
                        let emailDoc = emailCollect.doc();
                        TwinBcrypt.hash(`${password}`, function (hash) {
                            userDoc.set({
                                id: userDoc.id,
                                name: req.user.displayName,
                                email: email,
                                email_id: emailDoc.id,
                                password: hash
                            }).then(function () {
                                emailDoc.set({
                                    id: emailDoc.id,
                                    uid: userDoc.id,
                                    provider: "email",
                                    email: email,
                                    confirm: false
                                }).then(function () {
                                    let sessionID = authCollect.doc(userDoc.id).collection("status").doc(req.sessionID);
                                    let authLog = authCollect.doc(userDoc.id).collection("_log").doc(`signup-${req.sessionID}`);
                                    sessionID.update({
                                        uid: userDoc.id,
                                        session: req.sessionID,
                                        provider: "email",
                                        email_id: emailDoc.id,
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
                                            provider: "email",
                                            email_id: emailDoc.id,
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
                                        provider: "email",
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
                                            provider: "email",
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

                                    mailer.sendMail({
                                        from: '"Blackboard" <support@blackboardapp.co>', // sender address
                                        to: `${email}`, // list of receivers
                                        subject: "Register Blackboard Confirm Email", // Subject line
                                        html: emailBlackboardTemplat(emailDoc.id, email, name), // html body
                                    })

                                    arj.ok(res, true, "ok", {
                                        access_token: token,
                                        data: {
                                            id: userDoc.id,
                                            name: req.user.displayName,
                                            email: email,
                                            email_id: emailDoc.id,
                                        }

                                    })
                                })

                            })
                        });
                    })
                }
            })
        } else {
            arj.unauthorized(res, false, "ยืนยัน password ไม่ตรงกัน", {})
        }
    } else {
        if (!TypeOf(name)) {
            arj.unauthorized(res, false, "กรุณากรอกชื่อ", {})
        } else if (!TypeOf(email)) {
            arj.unauthorized(res, false, "กรุณากรอกอีเมล์", {})
        } else if (!TypeOf(password)) {
            arj.unauthorized(res, false, "กรุณากรอก password", {})
        } else if (!TypeOf(password_conf)) {
            arj.unauthorized(res, false, "กรุณากรอก password confirm", {})
        }

    }
});

module.exports = router;