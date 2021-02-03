var admin = require("firebase-admin");

var serviceAccount = require("../config/firebase/ServiceAccountKey.json");



module.exports = firebase = exports = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});