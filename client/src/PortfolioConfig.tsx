import React from 'react';

interface AssetAllocationConfigProps {
    productId: string;
    dailyTargetAmount: number;
}

function AssetAllocationConfig(props: AssetAllocationConfigProps): JSX.Element {
    return (
        <div>
            <b>{props.productId}</b> | ${props.dailyTargetAmount} / <i>day</i>
        </div>
    );
};

interface PortfolioConfigProps {
    id: string;
    displayName: string;
    allocations: AssetAllocationConfigProps[];
}

function PortfolioConfig(props: PortfolioConfigProps): JSX.Element {
    return (
        <div>
            <h3>{props.displayName}</h3>
            {props.allocations.map((allocation) => {
                return <AssetAllocationConfig key={allocation.productId} {...allocation} />
            })}
        </div>
    );
};

export { PortfolioConfig };

