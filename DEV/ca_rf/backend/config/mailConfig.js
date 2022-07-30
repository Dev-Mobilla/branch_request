const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const hbs = require('nodemailer-express-handlebars');
const OAuth2 = google.auth.OAuth2;

require('dotenv').config();

const setTransporter = async () => {

    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject('ERROR', error);
            }
            resolve(token);
        });
    });


    const nodeTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'jonalyn.mobilla@mlhuillier.com',
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        }
    });
    
    const handlebarOptions = {
        viewEngine: {
            extName: '.handlebars',
            partialsDir: 'views/patials',
            layoutsDir: 'views/layouts',
            defaultLayout: '',
        },
        viewPath: 'views/templates',
        extName: '.handlebars',
        // helpers: {
        //     if_equal: function (a, b, opts) {
        //         if (a == b) {
        //             return opts.fn(this)
        //         } else {
        //             return opts.inverse(this)
        //         }
        //     },
        // }
    };
    nodeTransporter.use('compile', hbs(handlebarOptions));

    return nodeTransporter;
};

module.exports = setTransporter;