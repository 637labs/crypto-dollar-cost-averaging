'use strict';

var path = require('path');
import express from 'express';
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var helmet = require('helmet')
import passport from 'passport';
import { Strategy as CoinbaseStrategy } from 'passport-coinbase';
var { ensureLoggedIn } = require('connect-ensure-login');

import { session } from './session-config';
import { CoinbaseUser } from './users';
import { CoinbaseProPortfolio } from './portfolios';

const PORT = 3000;
const HOST: string = process.env.HOSTNAME!;
const ROOT_URL = process.env.NODE_ENV == 'development' ? `http://${HOST}:${PORT}` : `https://${HOST}:${PORT}`;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_ENV != 'development') {
    app.use(helmet());
}
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session());
app.use(passport.initialize());
app.use(passport.session());

interface SerializedUser {
    id: string;
    displayName: string;
}

passport.serializeUser<SerializedUser>((user, done) => {
    done(null, { id: user.id, displayName: user.displayName });
});

passport.deserializeUser<SerializedUser>((serUser, done) => {
    done(null, new CoinbaseUser(serUser.id, serUser.displayName));
});

passport.use(new CoinbaseStrategy({
    clientID: process.env.COINBASE_CLIENT_ID!,
    clientSecret: process.env.COINBASE_CLIENT_SECRET!,
    callbackURL: `${ROOT_URL}/auth/coinbase/callback`
},
    function (accessToken, refreshToken, profile, cb) {
        console.log("Received Coinbase tokens")
        CoinbaseUser.getOrCreate(
            profile,
            (user: CoinbaseUser) => {
                console.log("Successfully fetched API user");
                user.setBasicOAuthTokens(
                    accessToken,
                    refreshToken,
                    () => cb(null, user),
                    (err) => {
                        console.error(err);
                        return cb(err, null);
                    });
            },
            (err) => {
                console.error(err);
                return cb(err, null);
            }
        );
    },
));

app.get('/login', function (req, res) {
    res.render('login')
});

app.post('/auth/coinbase',
    passport.authenticate('coinbase', { failureRedirect: '/login' })
);

app.get('/auth/coinbase/callback',
    passport.authenticate('coinbase', { successRedirect: '/configure', failureRedirect: '/login' })
);

app.get('/configure',
    ensureLoggedIn('/login'),
    (req, res) => {
        res.render('configure', {
            userName: req.user.displayName
        });
    }
);

app.post('/api/portfolio/create',
    ensureLoggedIn('/login'),
    (req, res) => {
        CoinbaseProPortfolio.create(
            req.user,
            {
                apiKey: req.body.apiKey,
                b64Secret: req.body.b64Secret,
                passphrase: req.body.passphrase
            },
            () => { res.status(200); },
            (err) => {
                console.error(err);
                res.status(400);
            }
        );
    }
);


app.listen(PORT, HOST);
console.log(`Running on ${ROOT_URL}`);
