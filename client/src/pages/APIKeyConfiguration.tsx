import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';

import VerticalNav from '../components/VerticalNav';
import { ApiKeyForm } from '../components/PortfolioCredentials';

const useStyles = makeStyles((theme) => ({
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    toolbar: {
        minHeight: 70
    },
    root: {
        display: 'flex',
    },
}))

export default function APIKeyConfiguration(): JSX.Element {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <VerticalNav />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <Container>
                    <ApiKeyForm
                        onSuccess={(portfolio) => { }}
                        onAuthNeeded={() => { }}
                    />
                </Container>
            </main>
        </div>
    );
}

