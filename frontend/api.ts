'use strict';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.API_URL;
const API_TOKEN_URL = `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${API_URL}`;

class ApiService {
    static authenticatedRequest(config: AxiosRequestConfig, onSuccess: (value: AxiosResponse<any>) => void, onError: (reason: any) => void) {
        if (process.env.NODE_ENV != 'development') {
            axios({
                method: 'get',
                url: API_TOKEN_URL,
                headers: {
                    'Metadata-Flavor': 'Google'
                }
            }).then((token) => {
                const { headers } = config;
                return axios({
                    ...config,
                    baseURL: API_URL,
                    headers: {
                        ...headers,
                        'Authorization': `Bearer ${token}`
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
