import React from 'react';
import { ApiKeyForm } from './PortfolioCredentials';
import { getJson } from './HttpUtils';


interface ConfigProps {
    userDisplayName: string;
    onAuthNeeded: () => void;
}

interface State {
    showApiKeyForm: boolean;
    portfolioName: string | null;
}

class ConfigurationPage extends React.Component<ConfigProps, State> {
    constructor(props: ConfigProps) {
        super(props);
        this.state = { showApiKeyForm: false, portfolioName: null };
    }

    componentDidMount() {
        getJson('/api/portfolio')
        .then(response => {
            if (response.ok) {
              response.json()
                .then(result => this.setState({ portfolioName: result.portfolioName, showApiKeyForm: false }));
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
        const { showApiKeyForm, portfolioName } = this.state;
        return (
            <div>
                <h2>{this.props.userDisplayName}</h2>
                <h1>Account Configuration</h1>
                {portfolioName != null && (<h2>{portfolioName}</h2>)}
                {showApiKeyForm && (
                    <ApiKeyForm
                        onSuccess={(portfolioName) => { this.setState({ showApiKeyForm: false, portfolioName }) }}
                        onAuthNeeded={this.props.onAuthNeeded}
                    />
                )}
                {!showApiKeyForm && (
                    <p>You're all set!</p>
                )}
            </div>
        )
    }
}

export { ConfigurationPage };
