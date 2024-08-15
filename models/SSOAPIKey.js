require('dotenv').config();
const { Schema, model } = require('mongoose');

const SSOAPIKey = new Schema({
    apiKey: String,
    userUUID: String,
    websiteDomain: String,
    afterSignupRedirectRoute: String,
    afterLoginRedirectRoute: String, 
    websiteServerDomain: String,
    requiresEmail: Boolean,
    requiresFirstName: Boolean,
    requiresLastName: Boolean,
    requiresAddress: Boolean,
    requiresPhoneNumber: Boolean, 
    requiresInterests: Boolean,
    requiresBirthdate: Boolean,
    requiresAvailability: Boolean,
    requiresBio: Boolean
});

const SSO = model('SSOAPIKey', SSOAPIKey);
module.exports = SSO;