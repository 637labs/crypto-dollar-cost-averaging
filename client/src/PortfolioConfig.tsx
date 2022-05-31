import React from 'react';

interface TradeSpecProps {
    productId: string;
    dailyTargetAmount: number;
}

function TradeSpec(props: TradeSpecProps): JSX.Element {
    return (
        <div>
            <b>{props.productId}</b> | ${props.dailyTargetAmount} / <i>day</i>
        </div>
    );
};

interface PortfolioConfigProps {
    displayName: string;
    tradeSpecs: TradeSpecProps[];
}

function PortfolioConfig(props: PortfolioConfigProps): JSX.Element {
    return (
        <div>
            <h3>{props.displayName}</h3>
            {props.tradeSpecs.map((specProps) => {
                return <TradeSpec key={specProps.productId} {...specProps} />
            })}
        </div>
    );
};

export { PortfolioConfig };

