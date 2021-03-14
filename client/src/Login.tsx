import React from 'react';
import { Button, Form } from 'semantic-ui-react';

class LoginModal extends React.Component {
    render(): JSX.Element {
        return (
            <Form action="/auth/coinbase" method="POST">
                <Button type="submit">Login with Coinbase</Button>
            </Form>
        );
    };
}

export { LoginModal };
