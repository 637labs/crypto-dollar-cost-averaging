import React from 'react';

interface TradeSpecProps {
    productId: string;
    dailyTargetAmount: number;
}

class TradeSpec extends React.Component<TradeSpecProps> {
    render() {
        return (
            <div>
                <b>{this.props.productId}</b> | ${this.props.dailyTargetAmount} / <i>day</i>
            </div>
        )
    }
}

interface PortfolioConfigProps {
    displayName: string;
    tradeSpecs: TradeSpecProps[];
}

class PortfolioConfig extends React.Component<PortfolioConfigProps> {
    render() {
        return (
            <div>
                <h3>{this.props.displayName}</h3>
                {this.props.tradeSpecs.map((specProps) => {
                    return <TradeSpec {...specProps} />
                })}
            </div>
        )
    }
}

export { PortfolioConfig };

