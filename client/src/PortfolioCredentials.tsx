import React from 'react';
import { Form, InputOnChangeData, Message } from 'semantic-ui-react';
import { postJson } from './HttpUtils';

interface ApiKeyFormProps {
    onSuccess: (portfolioName: string) => void;
    onAuthNeeded: () => void;
}

interface State {
    apiKey: string;
    secret: string;
    passphrase: string;

    loading: boolean;
    submissionSucceeded: boolean;
    submissionFailed: boolean;
    failureMessage: string;
}

class ApiKeyForm extends React.Component<ApiKeyFormProps, State> {

    constructor(props: ApiKeyFormProps) {
        super(props);
        this.state = { apiKey: '', secret: '', passphrase: '', loading: false, submissionSucceeded: false, submissionFailed: false, failureMessage: '' };
    }

    handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ apiKey: data.value });

    handleSecretChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ secret: data.value });

    handlePassphraseChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ passphrase: data.value });

    handleSubmit = () => {
        const { apiKey, secret, passphrase } = this.state;

        this.setState({ loading: true, submissionSucceeded: false, submissionFailed: false });

        postJson('/api/portfolio/create', { apiKey, b64Secret: secret, passphrase })
            .then(response => {
                if (response.ok) {
                    this.setState({ loading: false, submissionSucceeded: true });
                    response.json().then(result => this.props.onSuccess(result.portfolioName));
                } else if (response.status === 401) {
                    this.props.onAuthNeeded();
                } else {
                    console.error(`API key submission returned with non-OK status: ${response.status}`)
                    this.setState({ loading: false, submissionFailed: true });
                    response.json().then(result => {
                        this.setState({ failureMessage: result.message || '' });
                        console.error(`API key submission failed with message: ${result.message || ''}`)
                    })
                }
            })
            .catch(error => {
                this.setState({ loading: false, submissionFailed: true });
                console.error(`Failed to submit API key: ${error}`)
            })
    }

    render() {
        const { apiKey, secret, passphrase, loading, submissionSucceeded, submissionFailed, failureMessage } = this.state;
        return (
            <div>
                <h3>CoinbasePro - portfolio API Key</h3>
                <Form onSubmit={this.handleSubmit} loading={loading}>
                    <Form.Group>
                        <Form.Input
                            label='API Key'
                            name='apiKey'
                            value={apiKey}
                            onChange={this.handleApiKeyChange}
                        />
                        <Form.Input
                            label='Secret'
                            name='secret'
                            value={secret}
                            onChange={this.handleSecretChange}
                        />
                        <Form.Input
                            label='Passphrase'
                            name='passphrase'
                            value={passphrase}
                            onChange={this.handlePassphraseChange}
                        />
                        <Form.Button content='Submit' />
                        {submissionSucceeded && (
                            <Message
                                success
                                header='Success'
                                content="API key was submitted and verified"
                            />
                        )}
                        {submissionFailed && (
                            <Message
                                error
                                header='Submission Failed'
                                content={failureMessage || 'There was an issue submitting your API key'}
                            />
                        )}
                    </Form.Group>
                </Form>
            </div>
        );
    }
}

export { ApiKeyForm };
