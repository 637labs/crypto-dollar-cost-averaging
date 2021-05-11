'use strict';

import axios from 'axios';

import { CoinbaseUser } from './users';

const API_URL = process.env.API_URL;

interface PortfolioCredentials {
    apiKey: string;
    b64Secret: string;
    passphrase: string;
}

class CoinbaseProPortfolio {
    constructor(public id: string, public displayName: string) { }

    static create(
        user: CoinbaseUser,
        credentials: PortfolioCredentials,
        onSuccess: (portfolio: CoinbaseProPortfolio) => void,
        onError: (reason: any) => void
    ) {
        axios({
            method: 'post',
            url: '/user/portfolio-profile/create/v1',
            baseURL: API_URL,
            data: {
                userId: user.id,
                profileCredentials: { ...credentials }
            },
            responseType: 'json'
        })
            .then((response) => {
                if (onSuccess) {
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName));
                }
            })
            .catch((reason) => {
                if (onError) {
                    onError(reason);
                }
            });
    }

    static get(
        user: CoinbaseUser,
        onSuccess: (portfolio: CoinbaseProPortfolio) => void,
        onFailure: () => void
    ) {
        axios({
            method: 'post',
            url: '/user/portfolio-profile/view/v1',
            baseURL: API_URL,
            data: {
                userId: user.id,
            },
            responseType: 'json'
        })
            .then((response) => {
                if (onSuccess) {
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName));
                }
            })
            .catch(() => {
                if (onFailure) {
                    onFailure();
                }
            });
    }
};

export { CoinbaseProPortfolio };
