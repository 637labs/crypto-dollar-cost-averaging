import { getJson } from '../HttpUtils';

const COINBASE_PRO_API_PROXY_URL_BASE = '/api/proxy/cbp';
const ALL_PRODUCTS_URL = `${COINBASE_PRO_API_PROXY_URL_BASE}/products`;

interface Product {
    id: string;
    displayName: string;
    minimumPurchaseAmount: number;
}

function _isSupportedProduct(productJson: any): boolean {
    return (
        !productJson['trading_disabled'] &&
        !productJson['auction_mode'] &&
        !productJson['post_only'] &&
        !productJson['limit_only'] &&
        !productJson['cancel_only'] &&
        productJson['quote_currency'] === 'USD'
    )
}

function _productFromJson(productJson: any): Product {
    return {
        id: productJson['id'],
        displayName: productJson['base_currency'],
        minimumPurchaseAmount: productJson['min_market_funds']
    };
}

class CoinbaseProAPI {
    static getAvailableProducts(): Promise<Product[]> {
        return getJson(ALL_PRODUCTS_URL)
            .then(response => response.json())
            .then((productsJson: any[]) => productsJson
                .filter(_isSupportedProduct)
                .map(_productFromJson)
                // Sort by displayName
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
            )
    }
}

export type { Product };
export { CoinbaseProAPI };
