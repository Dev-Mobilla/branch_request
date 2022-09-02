const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    passReqToCallback: true
},
    // function (request, accessToken, refreshToken, profile, done) {
    //     if (profile._json.hd === 'mlhuillier.com') {
    //         console.log(profile);
    //         return done(null, profile)
    //     } else {
    //         console.log('error');
    //         return done(new Error('Error'))
    //     }
    // }
    function (request, accessToken, refreshToken, profile, done) {
        console.log('PROFILE',profile);
        return done(null, profile)
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done){
    done(null, user);
})

