'use strict';

import { Profile as CoinbaseProfile } from 'passport-coinbase';
import axios from 'axios';

const API_URL = process.env.API_URL;

class CoinbaseUser {
    constructor(public id: string, public displayName: string) { }

    static isCoinbaseUser(obj: any): obj is CoinbaseUser {
        return ("id" in obj && typeof obj.id === "string" && "displayName" in obj && typeof obj.displayName === "string");
    }

    static getOrCreate(profile: CoinbaseProfile, onSuccess: (user: CoinbaseUser) => void, onError: (reason: any) => void) {
        axios({
            method: 'post',
            url: '/user/get-or-create/v1',
            baseURL: API_URL,
            data: {
                user: {
                    provider: 'coinbase',
                    id: profile.id
                }
            },
            responseType: 'json'
        })
            .then((response) => {
                onSuccess(new CoinbaseUser(response.data.id, profile.displayName));
            })
            .catch((reason) => {
                onError(reason);
            });
    }

    setBasicOAuthTokens(accessToken: string, refreshToken: string, onSuccess: () => void, onError: (reason: any) => void) {
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
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((reason) => {
                if (onError) {
                    onError(reason);
                }
            });
    }
};

export { CoinbaseUser };
