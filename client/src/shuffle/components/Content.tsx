import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    displayLinebreak: {
        textAlign: 'center',
        whiteSpace: 'pre-line'
    },
}));

export default function Content(): JSX.Element {
    const classes = useStyles();
    const subText = '1. Sync with Coinbase \n 2. Set contributions \n 3. Buy crypto every day';

    return (
        <div>
            <h1>Dollar Cost Average into Crypto</h1>
            <h1>SIMPLE and FREE</h1>
            <div className={classes.displayLinebreak}>
                {subText}
            </div>
        </div>
    );
}