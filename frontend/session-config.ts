'use strict';

var serverSession = require('express-session') // TODO: setup scalable session store
var cookieSession = require('cookie-session');

const session = function () {
    if (process.env.SERVER_SESSION == 'true') {
        return serverSession({
            resave: false, // don't save session if unmodified
            saveUninitialized: false, // don't create session until something stored
            secret: process.env.SESSION_SECRET,
            name: 'sessionId' // use generic session cookie name to prevent server fingerprinting
        });
    } else {
        return cookieSession({
            secret: process.env.SESSION_SECRET,
            name: 'sessionId', // use generic session cookie name to prevent server fingerprinting
            maxAge: 60 * 60 * 1000 // 1 hour
        });
    }
};

export { session };
