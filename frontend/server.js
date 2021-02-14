'use strict';

var path = require('path');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var passport = require('passport')
var CoinbaseStrategy = require('passport-coinbase').Strategy;

const PORT = 3000;
const HOST = process.env.HOSTNAME;
const ROOT_URL = `http://${HOST}:${PORT}`

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.SESSION_SECRET
}));
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

app.get('/login', function (req, res, next) {
    res.render('login')
});

app.post('/auth/coinbase',
    passport.authenticate('coinbase', { failureRedirect: '/login' })
);

app.get('/auth/coinbase/callback',
    passport.authenticate('coinbase', { successRedirect: '/protected', failureRedirect: '/login' })
);

app.get('/protected',
    function (req, res) {
        if (!req.user) {
            res.redirect('/login')
        } else {
            res.send('<p>noyce</p>')
        }
    }
);


app.listen(PORT, HOST);
console.log(`Running on ${ROOT_URL}`);
