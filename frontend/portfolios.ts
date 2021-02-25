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
    static create(user: CoinbaseUser, credentials: PortfolioCredentials, onSuccess: () => void, onError: (reason: any) => void) {
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

export { CoinbaseProPortfolio };
