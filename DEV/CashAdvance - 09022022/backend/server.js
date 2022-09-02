const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const https = require('https');
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('./router/router');
const logger = require('./logs/logger');
const path = require('path');
const PORT = 3000;
const history = require('connect-history-api-fallback');
const session = require('express-session');
const passport = require('passport');
const url = require('url');
const Logger = require('./logs/logger');
const CryptoJs = require('crypto-js');
const cookieParser = require('cookie-parser');
const { google } = require('googleapis');
const setGoogleAuth = require('./config/googleAuthConfig');
const store = require('store')

require('./config/gmailAPIConfig');


app.use(cors())

// app.use(history());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.set('trust proxy', 'loopback')
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //     // secure: true,
    //     sameSite: 'Lax',
    // },

}))
app.use(cookieParser())
// app.use(passport.initialize());
// app.use(passport.session());

app.use('/', Router);
//must
app.use(express.static(path.resolve(__dirname, '../frontend/dist')))
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});

// GOOGLE AUTH
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
}

let storeToken = [];

const generateUrl = async (state) => {
    const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']

    const oauth2Client = await setGoogleAuth();

    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        prompt: 'consent',
        state: state
    })
    return authorizationUrl;
}

app.get('/session', (req, res) => {
    req.session.token = storeToken[0]
    console.log(req.session);
    res.send(req.session)

})

app.get('/getToken', (req, res) => {
    if (req.session.token) {
        console.log('TOKEN', storeToken);
        res.send({ access_token: req.session.token })
    } else {
        res.send({ message: req.session.token })
    }

})

app.get('/signin/:name', (req, res) => {
    Logger.loggerInfo.addContext('context', `google signin authenticate`);
    Logger.loggerInfo.info(`/auth/google/signin/${encodeURIComponent(req.params.name)}`);
    generateUrl(req.params.name).then(resp => {
        Logger.loggerInfo.addContext('context', `google signin authenticate`);
        Logger.loggerInfo.info(`/auth/google/signin/${encodeURIComponent(req.params.name)} - generateUrl : ${resp.toString()}`);
        res.send(resp.toString())
    }).catch(err => {
        console.log(err);
        Logger.loggerError.addContext('context', `google signin authenticate`);
        Logger.loggerError.error(`/auth/google/signin/${encodeURIComponent(req.params.name)} - generateUrl : ${JSON.stringify(err)}`);
        res.send(err)
    })
})

app.get('/auth/google/callback', async (req, res) => {
    Logger.loggerInfo.addContext('context', `google authenticate callback  - ${req.query.state}`);
    Logger.loggerInfo.info(`/auth/google/callback`);

    const code = req.query.code
    const state = req.query.state

    const oauth2Client = await setGoogleAuth();

    oauth2Client.getToken(code).then(resp => {
        Logger.loggerInfo.addContext('context', `google authenticate callback  - /auth/google/callback`);
        Logger.loggerInfo.info(`getToken: ${resp.tokens.access_token}`);
        oauth2Client.setCredentials({
            refresh_token: resp.tokens.refresh_token,
            access_token: resp.tokens.access_token
        });

        storeToken.push(resp.tokens.access_token);

        store.set('access_token', {access_token : resp.tokens.access_token})
        store.set('refresh_token', {refresh_token : resp.tokens.refresh_token})

        let oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        })
        oauth2.userinfo.get().then(response => {
            Logger.loggerInfo.addContext('context', `google authenticate callback  - /auth/google/callback`);
            Logger.loggerInfo.info(`getUserInfo: ${JSON.stringify(response.data)}`);
            console.log(response.data);
            res.redirect(`/auth/google/success/${state}?user=${JSON.stringify(response.data)}&token=${resp.tokens.access_token}`)
            // res.send(response.data)
        }).catch(error => {
            Logger.loggerError.addContext('context', `google authenticate callback  - /auth/google/callback`);
            Logger.loggerError.error(`getUserInfo ERROR: ${JSON.stringify(error)}`);
            res.send({ message: error })
        })
    }).catch(err => {
        Logger.loggerError.addContext('context', `google authenticate callback  - /auth/google/callback`);
        Logger.loggerError.error(`getToken ERROR: ${JSON.stringify(err)}`);
        res.send({ message: err })
    })

})

app.get('/auth/google/success/:path', (req, res) => {
    try {
        
        console.log(req.query.token);
        
        const cipherUser = CryptoJs.AES.encrypt(req.query.user, process.env.SECRET).toString();
        const encData = CryptoJs.enc.Base64.stringify(CryptoJs.enc.Utf8.parse(cipherUser));

        const queryToken = req.query.token
        const token = CryptoJs.AES.encrypt(queryToken, process.env.SECRET).toString();
        const encToken = CryptoJs.enc.Base64.stringify(CryptoJs.enc.Utf8.parse(token));

        if (req.params.path === 'cash-advance') {
            Logger.loggerInfo.addContext('context', `redirect after callback  - `);
            Logger.loggerInfo.info(`/auth/google/success/${req.params.path}`);
            req.session.token = storeToken[0]
            
            res.redirect(`http://cashadvance.mlhuillier.com:3000/#/cash-advance/?user=${encData}&token=${encToken}`)
            // res.redirect(`http://127.0.0.1:8080/#/cash-advance/?user=${encData}&token=${encToken}`)

            
        } else if (req.params.path === 'revolving-fund') {
            Logger.loggerInfo.addContext('context', `redirect after callback  - `);
            Logger.loggerInfo.info(`/auth/google/success/${req.params.path}`);

            res.redirect(`http://cashadvance.mlhuillier.com:3000/#/revolving-fund/?user=${encData}&token=${encToken}`)
            // res.redirect(`http://127.0.0.1:8080/#/revolving-fund/?user=${encData}&token=${encToken}`)

            // res.redirect(url.format({
            //     protocol: 'http',
            //     hostname: 'cashadvance.mlhuillier.com',
            //     port: 3000,
            //     pathname:'/%23/revolving-fund/',
            //     // pathname: `http://cashadvance.mlhuillier.com:3000/${hash}/revolving-fund/`,
            //     // pathname: 'http://10.4.8.168:3000/revolving-fund/',
            //     query: {
            //         user: cipherUser,
            //         token: token,
            //     }
            // }))
        }

    } catch (err) {
        Logger.loggerError.addContext('context', `/auth/google/success/${req.params.path}  - `);
        Logger.loggerError.error(`ERROR : ${JSON.stringify(err)}`);
        console.log('ERROR', err);
        res.send(err)
    }

})

app.get('/auth/google/failed', (req, res) => {
    // res.redirect('http://127.0.0.1:8080/')
    Logger.loggerError.addContext('context', `/auth/google/failed  - ${req.query}`);
    Logger.loggerError.error(`ERROR : google authentication failed`);
    res.send('authentication failed')
})

app.get('/logout', async (req, res, next) => {
    Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
    Logger.loggerInfo.info(`Logging out...`);

    console.log('token', req.query.token);
    const token = req.query.token;
    let postData = "token=" + token

    let postOptions = {
        host: 'oauth2.googleapis.com',
        port: '443',
        path: '/revoke',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const postReq = https.request(postOptions, (response) => {
        Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
        Logger.loggerInfo.info(`Requesting - headers: ${response.headers.host}, statusCode: ${response.statusCode}`);

        response.setEncoding('utf8');
        response.on('data', d => {
            console.log('Response:', d);
            Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
            Logger.loggerInfo.info(`postReq on data: ${d}, SESSION: ${JSON.stringify(req.session)}`);
            // res.send({ data: d })
            console.log('SESSION LOGOUT', req.session);
            if (response.statusCode === 200) {
                Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
                Logger.loggerInfo.info(`postReq on data: ${d}, statusCode: ${response.statusCode}`);
                req.session = null
                res.send({ message: 'Successfully Logged out', statusCode: response.statusCode })
            }else{
                Logger.loggerError.addContext('context', 'LOG OUT  - ');
                Logger.loggerError.info(`postReq on data: ${d}, statusCode: ${response.statusCode}`);
                res.send({ message: 'Unable to Log out', statusCode: response.statusCode })
            }
        })
        response.on('error', error => {
            console.log(error);
            Logger.loggerError.addContext('context', 'LOG OUT  - ');
            Logger.loggerError.error(`postReq on error: ${JSON.stringify(error)}`);
            res.send({ message: 'Server Error', statusCode: 500 })
        });
    })
    postReq.on('error', error => {
        console.log(error);
        Logger.loggerError.addContext('context', 'LOG OUT  - ');
        Logger.loggerError.error(`postReq on error: ${JSON.stringify(error)}`);
    });

    postReq.write(postData);
    postReq.end();


    // const oauth2Client = await setGoogleAuth();
    // oauth2Client.getAccessToken().then(resp => {
    //     console.log(resp);
    //     Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
    //     Logger.loggerInfo.info(`getAccesstoken: ${resp}`);
    //     let postData = "token=" + resp.token

    // let postOptions = {
    //     host: 'oauth2.googleapis.com',
    //     port: '443',
    //     path: '/revoke',
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Content-Length': Buffer.byteLength(postData)
    //     }
    // };

    // const postReq = https.request(postOptions, (response) => {
    //     Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
    //     Logger.loggerInfo.info(`Requesting: ${response}`);

    //     response.setEncoding('utf8');
    //     response.on('data', d => {
    //         console.log('Response:', d);
    //         Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
    //         Logger.loggerInfo.info(`postReq on data: ${d}`);
    //     })
    // })
    // postReq.on('error', error => {
    //     console.log(error);
    //     Logger.loggerError.addContext('context', 'LOG OUT  - ');
    //     Logger.loggerError.error(`postReq on error: ${error}`);
    // });

    // postReq.write(postData);
    // postReq.end();

    // req.logout(function (err) {
    //     if (err) {
    //         Logger.loggerInfo.addContext('context', `LOG OUT  - `);
    //         Logger.loggerInfo.info(`ERROR : ${err}`);
    //         return next(err);
    //     }
    //     req.session = null
    //     console.log('SESSION LOGOUT', req.session);
    //     res.send({ message: 'Successfully Logged out', statusCode: 200 })
    //     Logger.loggerInfo.addContext('context', 'LOG OUT  - ');
    //     Logger.loggerInfo.info(`SESSION: ${req.session}`);
    // });

    // }).catch(err => {
    //     console.log(err);
    //     Logger.loggerError.addContext('context', 'LOG OUT  - ');
    //     Logger.loggerError.error(`getAccessToken: ${JSON.stringify(err)}`);
    // })
})


// EXTERNAL URL
app.get('/response/:controlno', (req, res) => {
    Logger.loggerInfo.addContext('context', `redirect after clicking buttons  - `);
    Logger.loggerInfo.info(`/response/${req.params.controlno}`);
    res.redirect(`http://cashadvance.mlhuillier.com:3000/#/response/${req.params.controlno}`)
    // res.redirect(`http://10.4.8.168:3000/response/${req.params.controlno}`)
    // res.redirect(`http://127.0.0.1:8080/response/${req.params.controlno}`)
})
app.get('/alert/:controlno', (req, res) => {
    Logger.loggerInfo.addContext('context', `redirect after clicking buttons  - `);
    Logger.loggerInfo.info(`/alert/${req.params.controlno}`);
    res.redirect(`http://cashadvance.mlhuillier.com:3000/#/alert/${req.params.controlno}`)
    // res.redirect(`http://10.4.8.168:3000/alert/${req.params.controlno}`)
    // res.redirect(`http://127.0.0.1:8080/alert/${req.params.controlno}`)
})
app.get('/alert-comment/:controlno', (req, res) => {
    Logger.loggerInfo.addContext('context', `redirect after clicking buttons  - `);
    Logger.loggerInfo.info(`/alert-comment/${req.params.controlno}`);
    res.redirect(`http://cashadvance.mlhuillier.com:3000/#/alert-comment/${req.params.controlno}`)
    // res.redirect(`http://10.4.8.168:3000/alert-comment/${req.params.controlno}`)
    // res.redirect(`http://127.0.0.1:8080/alert-comment/${req.params.controlno}`)
})


http.listen(PORT, () => {
    logger.loggerInfo.addContext('context', 'server.js - ');
    logger.loggerInfo.info(`Server listening to port: ${PORT}`)
    console.log(`Server listening to port: ${PORT}`);

})


// app.get('/auth/google/signin/:name', (req, res, next) => {
//     Logger.loggerInfo.addContext('context', `passport authenticate`);
//     Logger.loggerInfo.info(`/auth/google/signin/${encodeURIComponent(req.params.name)}`);
//     passport.authenticate('google',
//         {
//             scope: ['email', 'profile'], state: encodeURIComponent(req.params.name),
//         })(req, res, next);
// }
//     // callbackURL: '/auth/google/callback'+ '?name=' + encodeURIComponent(req.query.name)
// )

// app.get('/auth/google/callback', (req, res, next) => {
//     Logger.loggerInfo.addContext('context', `passport authenticate  - ${req.query.state}`);
//     Logger.loggerInfo.info(`/auth/google/callback`);
//     passport.authenticate('google', {
//         // callbackURL: '/auth/google/callback'+ '?name=' + encodeURIComponent(req.query.name),
//         successRedirect: `/auth/google/success/${encodeURIComponent(req.query.state)}`,
//         failureRedirect: '/auth/google/failed',
//     })(req, res, next)
// })

// app.get('/auth/google/signin', passport.authenticate('google', { scope: ['email', 'profile'] }))
// app.get('/auth/google/callback', passport.authenticate('google', {
//     successRedirect: '/auth/google/success',
//     failureRedirect: '/auth/google/failed',
// }))