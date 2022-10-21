'use strict';

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
const cookieParser = require('cookie-parser');
import helmet from 'helmet';
import passport from 'passport';
import { Strategy as CoinbaseStrategy } from 'passport-coinbase';
const proxy = require('express-http-proxy');

import { session } from './session-config';
import { CoinbaseUser } from './users';
import { CoinbaseProPortfolio } from './portfolios';

const STATUS_UNAUTHORIZED = 401;

const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;
const HOST: string = process.env.HOSTNAME!;
const ROOT_URL = process.env.NODE_ENV == 'development' ? `http://${HOST}:${PORT}` : `https://${HOST}:${PORT}`;
const CLIENT_BUILD_DIR: string = process.env.CLIENT_BUILD_PATH!;

const AUTH_CALLBACK_URL_BASE = process.env.AUTH_CALLBACK_URL_BASE || ROOT_URL;


const app = express();

if (process.env.NODE_ENV != 'development') {
    app.use(helmet());
}
app.use(express.static(CLIENT_BUILD_DIR));
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
    if (CoinbaseUser.isCoinbaseUser(user)) {
        done(null, { id: user.id, displayName: user.displayName });
    } else {
        done(Error("Failed to serialize user -- expected a CoinbaseUser"));
    }
});

passport.deserializeUser<SerializedUser>((serUser, done) => {
    done(null, new CoinbaseUser(serUser.id, serUser.displayName));
});

passport.use(new CoinbaseStrategy({
    clientID: process.env.COINBASE_CLIENT_ID!,
    clientSecret: process.env.COINBASE_CLIENT_SECRET!,
    callbackURL: `${AUTH_CALLBACK_URL_BASE}/auth/coinbase/callback`
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

function ensureLoggedIn() {
    return function (req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.sendStatus(STATUS_UNAUTHORIZED);
        }
        next();
    }
};

app.get('/', function (req, res) {
    res.sendFile(path.join(CLIENT_BUILD_DIR, 'index.html'));
});

app.get('/dashboard', function (req, res) {
    res.sendFile(path.join(CLIENT_BUILD_DIR, 'index.html'));
});

app.get('/keyconfig', function (req, res) {
    res.sendFile(path.join(CLIENT_BUILD_DIR, 'index.html'));
});

app.get('/auth/coinbase',
    passport.authenticate('coinbase', { failureRedirect: '/' })
);

app.get('/auth/coinbase/callback',
    passport.authenticate('coinbase', { successRedirect: '/dashboard', failureRedirect: '/' })
);

app.get('/api/active-user',
    ensureLoggedIn(),
    (req, res) => {
        if (!CoinbaseUser.isCoinbaseUser(req.user)) {
            console.error("Request user is not of type CoinbaseUser");
            return;
        }
        res.status(200).json({ displayName: req.user.displayName });
    }
);

app.post('/api/portfolio/create',
    ensureLoggedIn(),
    bodyParser.json(),
    (req, res) => {
        if (!CoinbaseUser.isCoinbaseUser(req.user)) {
            console.error("Request user is not of type CoinbaseUser");
            return;
        }
        CoinbaseProPortfolio.create(
            req.user,
            {
                apiKey: req.body.apiKey,
                b64Secret: req.body.b64Secret,
                passphrase: req.body.passphrase
            },
            (portfolio: CoinbaseProPortfolio) => {
                res.status(200).json({
                    portfolioId: portfolio.id,
                    portfolioName: portfolio.displayName,
                    tradeSpecs: portfolio.tradeSpecs,
                    usdBalance: portfolio.usdBalance
                });
            },
            (err) => {
                console.error(err);
                res.sendStatus(400);
            }
        );
    }
);

// DEPRECATED
app.get('/api/portfolio',
    ensureLoggedIn(),
    (req, res) => {
        if (!CoinbaseUser.isCoinbaseUser(req.user)) {
            console.error("Request user is not of type CoinbaseUser");
            return;
        }
        CoinbaseProPortfolio.deprecatedGet(
            req.user,
            (portfolio: CoinbaseProPortfolio) => {
                res.status(200).json({
                    portfolioId: portfolio.id,
                    portfolioName: portfolio.displayName,
                    tradeSpecs: portfolio.tradeSpecs,
                    usdBalance: portfolio.usdBalance
                });
            },
            () => {
                res.sendStatus(404);
            }
        );
    }
);

app.get('/api/portfolio/:portfolioId',
    ensureLoggedIn(),
    (req, res) => {
        if (!CoinbaseUser.isCoinbaseUser(req.user)) {
            console.error("Request user is not of type CoinbaseUser");
            return;
        }
        CoinbaseProPortfolio.get(
            req.user,
            req.params.portfolioId,
            (portfolio: CoinbaseProPortfolio) => {
                res.status(200).json({
                    portfolioId: portfolio.id,
                    portfolioName: portfolio.displayName,
                    tradeSpecs: portfolio.tradeSpecs,
                    usdBalance: portfolio.usdBalance
                });
            },
            () => {
                res.sendStatus(404);
            }
        );
    }
);

app.post('/api/portfolio/:portfolioId/allocation/:productId/set/v1',
    ensureLoggedIn(),
    bodyParser.json(),
    (req, res) => {
        if (!CoinbaseUser.isCoinbaseUser(req.user)) {
            console.error("Request user is not of type CoinbaseUser");
            return;
        }
        CoinbaseProPortfolio.setTradeSpec(
            req.params.portfolioId,
            req.user,
            { productId: req.params.productId, dailyTargetAmount: req.body.dailyTargetAmount },
            (portfolio: CoinbaseProPortfolio) => {
                res.status(200).json({
                    portfolioId: portfolio.id,
                    portfolioName: portfolio.displayName,
                    tradeSpecs: portfolio.tradeSpecs,
                    usdBalance: portfolio.usdBalance
                });
            },
            () => {
                res.sendStatus(400);
            }
        );
    }
);

app.post('/api/portfolio/:portfolioId/allocation/:productId/remove/v1',
    ensureLoggedIn(),
    bodyParser.json(),
    (req, res) => {
        if (!CoinbaseUser.isCoinbaseUser(req.user)) {
            console.error("Request user is not of type CoinbaseUser");
            return;
        }
        CoinbaseProPortfolio.removeTradeSpec(
            req.params.portfolioId,
            req.user,
            req.params.productId,
            (portfolio: CoinbaseProPortfolio) => {
                res.status(200).json({
                    portfolioId: portfolio.id,
                    portfolioName: portfolio.displayName,
                    tradeSpecs: portfolio.tradeSpecs,
                    usdBalance: portfolio.usdBalance
                });
            },
            () => {
                res.sendStatus(400);
            }
        );
    }
);

app.use('/api/proxy/cbp', proxy('https://api.exchange.coinbase.com', {
    https: true
}));


app.listen(PORT);
console.log(`Running on ${ROOT_URL}`);
