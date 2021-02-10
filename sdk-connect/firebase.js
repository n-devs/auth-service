var firebase = require("firebase");
require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyCrUqlQIfWIfRWgFMpfhP35DweoSWwlJoY",
    authDomain: "auth-service-b4fa9.firebaseapp.com",
    projectId: "auth-service-b4fa9",
    storageBucket: "auth-service-b4fa9.appspot.com",
    messagingSenderId: "968117563170",
    appId: "1:968117563170:web:ee2e199e754538374bff7b",
    measurementId: "G-KHMTE6WQ7Y"
  };


module.exports = firebase = exports = firebase.initializeApp({
    ...firebaseConfig
  });