import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import FeeSlider from "./FeeSlider";

const useStyles = makeStyles((theme) => ({
    displayLinebreak: {
        textAlign: 'center',
        whiteSpace: 'pre-line'
    },
}));

export default function SplashScreenContent(): JSX.Element {
    const classes = useStyles();
    const subText = '1. Sync with Coinbase \n 2. Set contributions \n 3. Buy crypto every day';

    return (
        <div>
            <h1>Dollar Cost Average into Crypto</h1>
            <h1>SIMPLE and FREE</h1>
            <div className={classes.displayLinebreak}>
                {subText}
            </div>
            <img src={require('../../moneyGraph.jpeg')} alt="Money graph" />
            <div>
                Q: How much will I save in fees compared to Coinbase.com? <br />
                A: It depends how much you buy. Interact with the slider below to find out!
            </div>
            <FeeSlider />
        </div>
    );
}