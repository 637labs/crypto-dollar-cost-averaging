'use strict';

import { CoinbaseUser } from './users';
import { ApiService } from './api';

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
        ApiService.authenticatedRequest(
            {
                method: 'post',
                url: '/user/portfolio-profile/create/v1',
                data: {
                    userId: user.id,
                    profileCredentials: { ...credentials }
                },
                responseType: 'json'
            },
            (response) => {
                if (onSuccess) {
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName));
                }
            },
            (reason) => {
                if (onError) {
                    onError(reason);
                }
            }
        );
    }

    static get(
        user: CoinbaseUser,
        onSuccess: (portfolio: CoinbaseProPortfolio) => void,
        onFailure: () => void
    ) {
        ApiService.authenticatedRequest(
            {
                method: 'post',
                url: '/user/portfolio-profile/view/v1',
                data: {
                    userId: user.id,
                },
                responseType: 'json'
            },
            (response) => {
                if (onSuccess) {
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName));
                }
            },
            () => {
                if (onFailure) {
                    onFailure();
                }
            }
        );
    }
};

export { CoinbaseProPortfolio };
