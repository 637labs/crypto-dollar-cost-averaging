'use strict';

const axios = require('axios').default;

const API_URL = process.env.API_URL;

class CoinbaseUser {
    constructor(id, displayName) {
        this.id = id;
        this.displayName = displayName;
    }

    static getOrCreate(coinbaseProfileId, displayName, onSuccess, onError) {
        axios({
            method: 'post',
            url: '/user/get-or-create/v1',
            baseURL: API_URL,
            data: {
                user: {
                    provider: 'coinbase',
                    id: coinbaseProfileId
                }
            },
            responseType: 'json'
        })
            .then(function (response) {
                onSuccess(new CoinbaseUser(response.data.id, displayName))
            })
            .catch(function (error) {
                onError(error);
            });
    }

    setBasicOAuthTokens(accessToken, refreshToken, onSuccess, onError) {
        axios({
            method: 'post',
            url: '/user/oauth/basic/set/v1',
            baseURL: API_URL,
            data: {
                userId: this.id,
                oauthCredentials: {
                    accessToken,
                    refreshToken
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

module.exports = { CoinbaseUser };
