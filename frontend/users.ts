'use strict';

import { Profile as CoinbaseProfile } from 'passport-coinbase';
import { ApiService } from './api';

class CoinbaseUser {
    constructor(public id: string, public displayName: string) { }

    static isCoinbaseUser(obj: any): obj is CoinbaseUser {
        return ("id" in obj && typeof obj.id === "string" && "displayName" in obj && typeof obj.displayName === "string");
    }

    static getOrCreate(profile: CoinbaseProfile, onSuccess: (user: CoinbaseUser) => void, onError: (reason: any) => void) {
        ApiService.authenticatedRequest(
            {
                method: 'post',
                url: '/user/get-or-create/v1',
                data: {
                    user: {
                        provider: 'coinbase',
                        id: profile.id
                    }
                },
                responseType: 'json'
            },
            (response: { data: { id: string; }; }) => {
                onSuccess(new CoinbaseUser(response.data.id, profile.displayName));
            },
            (reason: any) => {
                onError(reason);
            }
        );
    }

    setBasicOAuthTokens(accessToken: string, refreshToken: string, onSuccess: () => void, onError: (reason: any) => void) {
        ApiService.authenticatedRequest(
            {
                method: 'post',
                url: '/user/oauth/basic/set/v1',
                data: {
                    userId: this.id,
                    oauthCredentials: {
                        accessToken,
                        refreshToken
                    }
                },
                responseType: 'json'
            },
            () => {
                if (onSuccess) {
                    onSuccess();
                }
            },
            (reason) => {
                if (onError) {
                    onError(reason);
                }
            }
        );
    }
};

export { CoinbaseUser };
