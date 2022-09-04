'use strict';

import { CoinbaseUser } from './users';
import { ApiService } from './api';

interface PortfolioCredentials {
    apiKey: string;
    b64Secret: string;
    passphrase: string;
}

interface TradeSpec {
    productId: string;
    dailyTargetAmount: number;
}

class CoinbaseProPortfolio {
    constructor(public id: string, public displayName: string, public tradeSpecs: TradeSpec[], public usdBalance: number) { }

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
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName, response.data.tradeSpecs, response.data.usdBalance));
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
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName, response.data.tradeSpecs, response.data.usdBalance));
                }
            },
            () => {
                if (onFailure) {
                    onFailure();
                }
            }
        );
    }

    static setTradeSpec(
        portfolioId: string,
        user: CoinbaseUser,
        tradeSpec: TradeSpec,
        onSuccess: (portfolio: CoinbaseProPortfolio) => void,
        onFailure: () => void
    ) {
        ApiService.authenticatedRequest(
            {
                method: 'post',
                url: `/user/portfolio-profile/${portfolioId}/allocation/${tradeSpec.productId}/set/v1`,
                data: {
                    userId: user.id,
                    dailyTargetAmount: tradeSpec.dailyTargetAmount,
                },
                responseType: 'json'
            },
            (response) => {
                if (onSuccess) {
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName, response.data.tradeSpecs, response.data.usdBalance));
                }
            },
            () => {
                if (onFailure) {
                    onFailure();
                }
            }
        );
    }

    static removeTradeSpec(
        portfolioId: string,
        user: CoinbaseUser,
        productId: string,
        onSuccess: (portfolio: CoinbaseProPortfolio) => void,
        onFailure: () => void
    ) {
        ApiService.authenticatedRequest(
            {
                method: 'post',
                url: `/user/portfolio-profile/${portfolioId}/allocation/${productId}/remove/v1`,
                data: {
                    userId: user.id,
                },
                responseType: 'json'
            },
            (response) => {
                if (onSuccess) {
                    onSuccess(new CoinbaseProPortfolio(response.data.id, response.data.displayName, response.data.tradeSpecs, response.data.usdBalance));
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
