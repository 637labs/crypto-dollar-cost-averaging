import React from 'react';
import Button from '@material-ui/core/Button';

class LoginModal extends React.Component {
    render(): JSX.Element {
        return (
            <Button href="/auth/coinbase">Login with Coinbase</Button>
        );
    };
}

export { LoginModal };
