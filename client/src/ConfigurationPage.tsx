import React from 'react';
import { ApiKeyForm } from './PortfolioCredentials';
import { PortfolioConfig } from './PortfolioConfig';
import { getJson } from './HttpUtils';


interface ConfigProps {
    userDisplayName: string;
    onAuthNeeded: () => void;
}

interface PortfolioTradeSpec {
    productId: string;
    dailyTargetAmount: number;
}
interface PortfolioDetails {
    displayName: string;
    tradeSpecs: PortfolioTradeSpec[];
}

interface State {
    showApiKeyForm: boolean;
    portfolioDetails: PortfolioDetails | null;
}

class ConfigurationPage extends React.Component<ConfigProps, State> {
    constructor(props: ConfigProps) {
        super(props);
        this.state = { showApiKeyForm: false, portfolioDetails: null };
    }

    componentDidMount() {
        getJson('/api/portfolio')
            .then(response => {
                if (response.ok) {
                    response.json()
                        .then(result => this.setState({
                            portfolioDetails: { displayName: result.portfolioName, tradeSpecs: result.tradeSpecs },
                            showApiKeyForm: false
                        }));
                } else if (response.status === 401) {
                    this.props.onAuthNeeded()
                } else if (response.status === 404) {
                    this.setState({ showApiKeyForm: true })
                } else {
                    console.error(`Fetching configured portfolio returned unexpected status: ${response.status}`)
                }
            })
            .catch(error => {
                console.error(`Failed to fetch configured portfolio: ${error}`)
            })
    }

    render() {
        const { showApiKeyForm, portfolioDetails } = this.state;
        return (
            <div>
                <h2>{this.props.userDisplayName}</h2>
                <h1>Account Configuration</h1>
                {portfolioDetails != null && (<PortfolioConfig {...portfolioDetails} />)}
                {showApiKeyForm && (
                    <ApiKeyForm
                        onSuccess={(portfolioName) => { this.setState({ showApiKeyForm: false, portfolioDetails: { displayName: portfolioName, tradeSpecs: [] } }) }}
                        onAuthNeeded={this.props.onAuthNeeded}
                    />
                )}
            </div>
        )
    }
}

export { ConfigurationPage };
