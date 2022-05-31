import React, { useEffect, useState } from 'react';
import {
    Redirect,
} from 'react-router-dom';

import { ApiKeyForm } from './PortfolioCredentials';
import { PortfolioConfig } from './PortfolioConfig';
import { getJson } from './HttpUtils';


interface PortfolioTradeSpec {
    productId: string;
    dailyTargetAmount: number;
}
interface PortfolioDetails {
    displayName: string;
    tradeSpecs: PortfolioTradeSpec[];
}

export default function ConfigurationPage(): JSX.Element {
    const [portfolioDetails, setPortfolioDetails] = useState<PortfolioDetails | null>(null);
    const [showApiKeyForm, setShowApiKeyForm] = useState<boolean>(false);
    const [authNeeded, setAuthNeeded] = useState<boolean>(false);

    useEffect(() => {
        getJson('/api/portfolio')
            .then(response => {
                if (response.ok) {
                    response.json()
                        .then(result => setPortfolioDetails({
                            displayName: result.portfolioName,
                            tradeSpecs: result.tradeSpecs
                        }));
                } else if (response.status === 401) {
                    setAuthNeeded(true);
                } else if (response.status === 404) {
                    setShowApiKeyForm(true);
                } else {
                    console.error(`Fetching configured portfolio returned unexpected status: ${response.status}`)
                }
            })
            .catch(error => {
                console.error(`Failed to fetch configured portfolio: ${error}`)
            })
    }, []);

    if (authNeeded) {
        return (
            <Redirect to='/' />
        );
    }
    return (
        <div>
            <h1>Account Configuration</h1>
            {portfolioDetails != null && (<PortfolioConfig {...portfolioDetails} />)}
            {showApiKeyForm && (
                <ApiKeyForm
                    onSuccess={(portfolioName) => {
                        setPortfolioDetails({ displayName: portfolioName, tradeSpecs: [] });
                        setShowApiKeyForm(false);
                    }}
                    onAuthNeeded={() => { setAuthNeeded(true) }}
                />
            )}
        </div>
    );
};
