var serviceAccount = require("../config/email/ServiceAccountKey.json");
const nodemailer = require("nodemailer");

module.exports = mailer = nodemailer.createTestAccount({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: "contact@blackboardapp.co",
        serviceClient: serviceAccount.client_id,
        privateKey: serviceAccount.private_key
    }
});