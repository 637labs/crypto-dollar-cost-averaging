import React, { useState } from 'react';
import { Button, TextField, LinearProgress, Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { Portfolio, PortfolioAPI } from './api/PortfolioData';


function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface ApiKeyFormProps {
    onSuccess: (portfolio: Portfolio) => void;
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

        PortfolioAPI.createPortfolio(
            apiKey, secret, passphrase,
            (portfolio) => {
                setLoading(false);
                setSubmissionSucceeded(true);
                props.onSuccess(portfolio);
            },
            () => props.onAuthNeeded(),
            (errorMessage) => {
                setLoading(false);
                setSubmissionFailed(true);
                if (errorMessage) {
                    setSubmissionFailureMessage(errorMessage);
                }
            }
        );
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
