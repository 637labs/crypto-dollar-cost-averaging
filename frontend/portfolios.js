'use strict';

const axios = require('axios').default;

const API_URL = process.env.API_URL;

class CoinbaseProPortfolio {
    static create({ user, apiKey, b64Secret, passphrase, onSuccess, onError }) {
        axios({
            method: 'post',
            url: '/user/portfolio-profile/create/v1',
            baseURL: API_URL,
            data: {
                userId: user.id,
                profileCredentials: {
                    apiKey,
                    b64Secret,
                    passphrase
                }
            },
            responseType: 'json'
        })
            .then(function (response) {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch(function (error) {
                if (onError) {
                    onError(error);
                }
            });
    }
};

module.exports = { CoinbaseProPortfolio };
