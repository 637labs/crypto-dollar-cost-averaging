'use strict';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.API_URL;
const API_TOKEN_URL = `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${API_URL}`;

interface AccessToken {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
}
class ApiService {
    static authenticatedRequest(config: AxiosRequestConfig, onSuccess: (value: AxiosResponse<any>) => void, onError: (reason: any) => void) {
        if (process.env.NODE_ENV != 'development') {
            axios.get<AccessToken>(API_TOKEN_URL,
                {
                    method: 'get',
                    headers: {
                        'Metadata-Flavor': 'Google'
                    }
                }
            ).then((tokenResponse) => {
                const accessToken = tokenResponse.data.access_token;
                const { headers } = config;
                return axios({
                    ...config,
                    baseURL: API_URL,
                    headers: {
                        ...headers,
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
            }).then((value) => {
                onSuccess(value)
            }).catch((reason) => onError(reason));
        } else {
            axios({
                ...config,
                baseURL: API_URL
            }).then((value) => {
                onSuccess(value)
            }).catch((reason) => onError(reason));
        }
    }
}


export { ApiService };
