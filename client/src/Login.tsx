import React from 'react';
import Button from '@material-ui/core/Button';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

interface CoinbaseLoginButtonProps {
    classes: ClassNameMap;
}

function CoinbaseLoginButton(props: CoinbaseLoginButtonProps): JSX.Element {
    return (
        <Button variant="contained" color="secondary" className={props.classes.primaryAction} href="/auth/coinbase">Login with Coinbase</Button>
    );
}

export { CoinbaseLoginButton };
