import React, { useState } from 'react';
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

function ApiKeyForm(props: ApiKeyFormProps): JSX.Element {
    const [apiKey, setApiKey] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [passphrase, setPassphrase] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [submissionSucceeded, setSubmissionSucceeded] = useState<boolean>(false);
    const [submissionFailed, setSubmissionFailed] = useState<boolean>(false);
    const [submissionFailureMessage, setSubmissionFailureMessage] = useState<string>('');

    const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => setApiKey(event.target.value);

    const handleSecretChange = (event: React.ChangeEvent<HTMLInputElement>) => setSecret(event.target.value);

    const handlePassphraseChange = (event: React.ChangeEvent<HTMLInputElement>) => setPassphrase(event.target.value);

    const handleSubmit = () => {
        setLoading(true);
        setSubmissionSucceeded(false);
        setSubmissionFailed(false);

        postJson('/api/portfolio/create', { apiKey, b64Secret: secret, passphrase })
            .then(response => {
                if (response.ok) {
                    setLoading(false);
                    setSubmissionSucceeded(true);
                    response.json().then(result => props.onSuccess(result.portfolioName));
                } else if (response.status === 401) {
                    props.onAuthNeeded();
                } else {
                    console.error(`API key submission returned with non-OK status: ${response.status}`);
                    setLoading(false);
                    setSubmissionFailed(true);
                    response.json().then(result => {
                        setSubmissionFailureMessage(result.message || '');
                        console.error(`API key submission failed with message: ${result.message || ''}`);
                    });
                }
            })
            .catch(error => {
                setLoading(false);
                setSubmissionFailed(true);
                console.error(`Failed to submit API key: ${error}`);
            });
    };

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
                        onChange={handleApiKeyChange}
                    />
                    <TextField
                        label='Secret'
                        name='secret'
                        value={secret}
                        onChange={handleSecretChange}
                    />
                    <TextField
                        label='Passphrase'
                        name='passphrase'
                        value={passphrase}
                        onChange={handlePassphraseChange}
                    />
                    <Button onClick={handleSubmit}>Submit</Button>
                </div>
            )}
            <Snackbar open={submissionSucceeded} autoHideDuration={6000}>
                <Alert severity="success">
                    Success: API key was submitted and verified
                </Alert>
            </Snackbar>
            <Snackbar open={submissionFailed}>
                <Alert severity="error">
                    Submission Failed: {submissionFailureMessage || 'There was an issue submitting your API key'}
                </Alert>
            </Snackbar>
        </div>
    );
};

export { ApiKeyForm };
