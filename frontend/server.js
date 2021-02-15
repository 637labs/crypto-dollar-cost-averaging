'use strict';

var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser')
var helmet = require('helmet')
var passport = require('passport')
var CoinbaseStrategy = require('passport-coinbase').Strategy;
var { ensureLoggedIn } = require('connect-ensure-login');

var { session } = require('./session-config');

const PORT = 3000;
const HOST = process.env.HOSTNAME;
const ROOT_URL = process.env.NODE_ENV == 'development' ? `http://${HOST}:${PORT}` : `https://${HOST}:${PORT}`;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_ENV != 'development') {
    app.use(helmet());
}
app.use(express.static('public'));
app.use(cookieParser());
app.use(session());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    done(null, { id });
});

passport.use(new CoinbaseStrategy({
    clientID: process.env.COINBASE_CLIENT_ID,
    clientSecret: process.env.COINBASE_CLIENT_SECRET,
    callbackURL: `${ROOT_URL}/auth/coinbase/callback`
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(`Auth successful -- profile ID: ${profile.id}, token: ${accessToken}`)
        return cb(null, { id: profile.id })
    },
));

app.get('/login', function (req, res) {
    res.render('login')
});

app.post('/auth/coinbase',
    passport.authenticate('coinbase', { failureRedirect: '/login' })
);

app.get('/auth/coinbase/callback',
    passport.authenticate('coinbase', { successRedirect: '/protected', failureRedirect: '/login' })
);

app.get('/protected',
    ensureLoggedIn('/login'),
    function (req, res) {
        res.send('<p>noyce</p>');
    }
);


app.listen(PORT, HOST);
console.log(`Running on ${ROOT_URL}`);
