import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Product } from '../api/CoinbaseProData';
import { AssetAllocation } from '../api/PortfolioData';
import { PortfolioConfig } from '../components/PortfolioConfig';

const ALL_PRODUCTS: Product[] = [
    { id: "ETH-USD", displayName: "ETH", minimumPurchaseAmount: 5 },
    { id: "BTC-USD", displayName: "BTC", minimumPurchaseAmount: 10 },
    { id: "ATOM-USD", displayName: "ATOM", minimumPurchaseAmount: 1 },
    { id: "LINK-USD", displayName: "LINK", minimumPurchaseAmount: 1 },
];
const PRODUCTS_BY_ID = Object.fromEntries<Product>(ALL_PRODUCTS.map(product => [product.id, product]));


// sleep time expects milliseconds
function sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
}
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/PortfolioConfig',
    component: PortfolioConfig,
} as ComponentMeta<typeof PortfolioConfig>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof PortfolioConfig> = (args) => <PortfolioConfig {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    id: "portfolio-abc123",
    displayName: "My DCA Portfolio",
    usdBalance: 1000,
    initialAllocations: [{ productId: "ETH-USD", dailyTargetAmount: 15 }, { productId: "BTC-USD", dailyTargetAmount: 10 }],
    allProducts: ALL_PRODUCTS,
    productsById: PRODUCTS_BY_ID,
    onPortfolioUpdate: () => {
        return Promise.resolve();
    },
    setAssetAllocation: (portfolioId: string, allocation: AssetAllocation) => {
        return sleep(200);
    },
    removeAssetAllocation: (portfolioId: string, productId: string) => {
        return sleep(200);
    }
};

export const ZeroAllocation = Template.bind({});
ZeroAllocation.args = {
    id: "portfolio-abc123",
    displayName: "My DCA Portfolio",
    usdBalance: 1000,
    initialAllocations: [{ productId: "ETH-USD", dailyTargetAmount: 0 }, { productId: "BTC-USD", dailyTargetAmount: 0 }],
    allProducts: ALL_PRODUCTS,
    productsById: PRODUCTS_BY_ID,
    onPortfolioUpdate: () => {
        return Promise.resolve();
    },
    setAssetAllocation: (portfolioId: string, allocation: AssetAllocation) => {
        return sleep(200);
    },
    removeAssetAllocation: (portfolioId: string, productId: string) => {
        return sleep(200);
    }
};
