import React from 'react';
import { Button, TextField, LinearProgress, Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { postJson } from './HttpUtils';

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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

    handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ apiKey: event.target.value });

    handleSecretChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ secret: event.target.value });

    handlePassphraseChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ passphrase: event.target.value });

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
                {loading && (
                    <LinearProgress />
                )}
                {!loading && !submissionSucceeded && (
                    <div>
                        <TextField
                            label='API Key'
                            name='apiKey'
                            value={apiKey}
                            onChange={this.handleApiKeyChange}
                        />
                        <TextField
                            label='Secret'
                            name='secret'
                            value={secret}
                            onChange={this.handleSecretChange}
                        />
                        <TextField
                            label='Passphrase'
                            name='passphrase'
                            value={passphrase}
                            onChange={this.handlePassphraseChange}
                        />
                        <Button onClick={this.handleSubmit}>Submit</Button>
                    </div>
                )}
                <Snackbar open={submissionSucceeded} autoHideDuration={6000}>
                    <Alert severity="success">
                        Success: API key was submitted and verified
                    </Alert>
                </Snackbar>
                <Snackbar open={submissionFailed}>
                    <Alert severity="error">
                        Submission Failed: {failureMessage || 'There was an issue submitting your API key'}
                    </Alert>
                </Snackbar>
            </div>
        );
    }
}

export { ApiKeyForm };
