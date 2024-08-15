require('dotenv').config();
const { Schema, model } = require('mongoose');

const LoginAuthorizationSchema = new Schema({
    apiKey: String,
    authorizationCode: String,
    userUUID: String,
});

const LoginAuthorization = model('LoginAuthorization', LoginAuthorizationSchema);
module.exports = LoginAuthorization;