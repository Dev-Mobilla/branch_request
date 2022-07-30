const auth = {
    type:'OAuth2',
    user:"jonalyn.mobilla@mlhuillier.com",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN
};

const mailoptions = {
    from:"Jonalyn Mobilla &lt;jonalyn.mobilla@mlhuillier.com>",
    to:"shenna.caneda@mlhuillier.com",
    subject:"Gmail API NodeJS"
};

module.exports = {
    auth,
    mailoptions,
}