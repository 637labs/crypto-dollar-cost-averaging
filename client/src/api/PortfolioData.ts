import { getJson, postJson } from '../HttpUtils';

interface AssetAllocation {
    productId: string;
    dailyTargetAmount: number;
}

interface Portfolio {
    id: string;
    displayName: string;
    usdBalance: number;
    allocations: AssetAllocation[];
}

class PortfolioAPI {

    static createPortfolio(
        apiKey: string,
        b64Secret: string,
        passphrase: string,
        onSuccess: (portfolio: Portfolio) => void,
        onAuthNeeded: () => void,
        onError: (errorMessage: string | null) => void
    ): void {
        postJson('/api/portfolio/create', { apiKey, b64Secret, passphrase })
            .then(response => {
                if (response.ok) {
                    response.json().then(result => onSuccess({
                        id: result.portfolioId,
                        displayName: result.portfolioName,
                        usdBalance: result.usdBalance,
                        allocations: result.tradeSpecs
                    }));
                } else if (response.status === 401) {
                    onAuthNeeded();
                } else {
                    console.error(`API key submission returned with non-OK status: ${response.status}`);
                    response.json().then(result => {
                        onError(result.message || '');
                        console.error(`API key submission failed with message: ${result.message || ''}`);
                    });
                }
            })
            .catch(error => {
                onError(null);
                console.error(`Failed to submit API key: ${error}`);
            });
    }

    static listPortfolios(
        onSuccess: (portfolios: [{ id: string, displayName: string }]) => void,
        onAuthNeeded: () => void,
        onNotFound: () => void
    ): Promise<void> {
        return getJson('/api/portfolios')
            .then(response => {
                if (response.ok) {
                    response.json()
                        .then(result => onSuccess(result.portfolios));
                } else if (response.status === 401) {
                    onAuthNeeded();
                } else if (response.status === 404) {
                    onNotFound();
                } else {
                    console.error(`Listing configured portfolios returned unexpected status: ${response.status}`)
                }
            })
            .catch(error => {
                console.error(`Failed to list configured portfolios: ${error}`)
            })
    }

    static fetchPortfolio(
        portfolioId: string,
        onSuccess: (portfolio: Portfolio) => void,
        onAuthNeeded: () => void,
        onNotFound: () => void
    ): Promise<void> {
        return getJson(`/api/portfolio/${portfolioId}`)
            .then(response => {
                if (response.ok) {
                    response.json()
                        .then(result => onSuccess({
                            id: result.portfolioId,
                            displayName: result.portfolioName,
                            usdBalance: result.usdBalance,
                            allocations: result.tradeSpecs
                        }));
                } else if (response.status === 401) {
                    onAuthNeeded();
                } else if (response.status === 404) {
                    onNotFound();
                } else {
                    console.error(`Fetching configured portfolio returned unexpected status: ${response.status}`)
                }
            })
            .catch(error => {
                console.error(`Failed to fetch configured portfolio: ${error}`)
            })
    }

    static setAssetAllocation(
        portfolioId: string,
        allocation: AssetAllocation,
        onSuccess: ((portfolio: Portfolio) => void) = () => { },
        onAuthNeeded: () => void = () => { },
        onError: () => void = () => { }
    ): Promise<void> {
        return postJson(`/api/portfolio/${portfolioId}/allocation/${allocation.productId}/set/v1`, { dailyTargetAmount: allocation.dailyTargetAmount })
            .then(response => {
                if (response.ok) {
                    response.json().then(result => onSuccess({
                        id: result.portfolioId,
                        displayName: result.portfolioName,
                        usdBalance: result.usdBalance,
                        allocations: result.tradeSpecs
                    }));
                } else if (response.status === 401) {
                    onAuthNeeded();
                } else {
                    response.json().then(result => {
                        onError();
                        console.error(`Failed to set asset allocation with message: ${result.message || ''}`);
                    });
                }
            })
            .catch(error => {
                onError();
                console.error(`Failed to set asset allocation: ${error}`);
            });
    }

    static removeAssetAllocation(
        portfolioId: string,
        productId: string,
        onSuccess: (portfolio: Portfolio) => void = () => { },
        onAuthNeeded: () => void = () => { },
        onError: () => void = () => { }
    ): Promise<void> {
        return postJson(`/api/portfolio/${portfolioId}/allocation/${productId}/remove/v1`)
            .then(response => {
                if (response.ok) {
                    response.json().then(result => onSuccess({
                        id: result.portfolioId,
                        displayName: result.portfolioName,
                        usdBalance: result.usdBalance,
                        allocations: result.tradeSpecs
                    }));
                } else if (response.status === 401) {
                    onAuthNeeded();
                } else {
                    response.json().then(result => {
                        onError();
                        console.error(`Failed to remove asset allocation with message: ${result.message || ''}`);
                    });
                }
            })
            .catch(error => {
                onError();
                console.error(`Failed to remove asset allocation: ${error}`);
            });
    }
}


export type { Portfolio, AssetAllocation };
export { PortfolioAPI };