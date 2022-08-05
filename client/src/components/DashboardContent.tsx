import React, { useEffect, useState } from 'react';
import {
    Redirect,
} from 'react-router-dom';

import { ApiKeyForm } from './PortfolioCredentials';
import PortfolioConfig from './PortfolioConfig';
import { Portfolio, PortfolioAPI } from '../api/PortfolioData';


export default function DashboardContent(): JSX.Element {
    const [portfolioDetails, setPortfolioDetails] = useState<Portfolio | null>(null);
    const [showApiKeyForm, setShowApiKeyForm] = useState<boolean>(false);
    const [authNeeded, setAuthNeeded] = useState<boolean>(false);

    useEffect(() => {
        PortfolioAPI.fetchPortfolio(
            portfolio => setPortfolioDetails(portfolio),
            () => setAuthNeeded(true),
            () => setShowApiKeyForm(true)
        )
    }, []);

    const handlePortfolioUpdate = () => {
        return PortfolioAPI.fetchPortfolio(
            portfolio => setPortfolioDetails(portfolio),
            () => setAuthNeeded(true),
            () => setShowApiKeyForm(true)
        );
    }

    if (authNeeded) {
        return (
            <Redirect to='/' />
        );
    }
    return (
        <div>
            <h1>Account Configuration</h1>
            {portfolioDetails != null && (
                <PortfolioConfig
                    onPortfolioUpdate={handlePortfolioUpdate}
                    setAssetAllocation={PortfolioAPI.setAssetAllocation}
                    removeAssetAllocation={PortfolioAPI.removeAssetAllocation}
                    initialAllocations={portfolioDetails.allocations}
                    {...portfolioDetails}
                />
            )}
            {showApiKeyForm && (
                <ApiKeyForm
                    onSuccess={(portfolio) => {
                        setPortfolioDetails(portfolio);
                        setShowApiKeyForm(false);
                    }}
                    onAuthNeeded={() => { setAuthNeeded(true) }}
                />
            )}
        </div>
    );
};
