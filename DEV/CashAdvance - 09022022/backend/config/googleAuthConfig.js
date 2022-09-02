const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const setGoogleAuth = async () => {

    const oauth2Client = new OAuth2({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.CALLBACK_URL,
    })

    return oauth2Client;
}

module.exports = setGoogleAuth;
