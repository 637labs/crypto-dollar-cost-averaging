import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Input, Grid, Box, Slider } from '@material-ui/core';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const useStyles = makeStyles((theme) => ({
    box: {
        margin: 40,
        flexDirection: "row",
        display: "flex",
        gap: 15,
        alignItems: "center"
    }
}));

export default function FeeSlider(): JSX.Element {
    const classes = useStyles();
    const sliderMinValue = 5;
    const sliderMaxValue = 500;
    const sliderDefaultValue = 100;
    const [coinbaseComFees, setCoinbaseComFees] = React.useState(100);
    const [coinbaseProFees, setCoinbaseProFees] = React.useState(100);
    const [toggleButtonState, setToggleButtonState] = React.useState("1"); //TODO: This should be an enum
    const [sliderState, setSliderState] = React.useState<number | string | Array<number | string>>(
        50,
    );

    const handleSliderChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
        setSliderState(newValue);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderState(event.target.value === '' ? '' : Number(event.target.value));
    };

    // TODO: Handle non number
    const handleInputBlur = () => {
        if (sliderState < sliderMinValue) {
            setSliderState(sliderMinValue);
        } else if (sliderState > sliderMaxValue) {
            setSliderState(sliderMaxValue);
        }
    };

    const handleToggleButtonChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string,
    ) => {
        setToggleButtonState(newAlignment);
    };

    useEffect(() => {
        setCoinbaseComFees(Number(calculateCoinbaseComFees(Number(sliderState), toggleButtonState)));
        setCoinbaseProFees(Number(calculateCoinbaseProFees(Number(sliderState), toggleButtonState)));

    }, [sliderState, toggleButtonState]);

    return (
        <Container maxWidth="sm" >
            <Box className={classes.box} >
                <div>
                    Crypto bought per day:
                </div>
                <Input
                    value={sliderState}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    inputProps={{
                        min: sliderMinValue,
                        max: sliderMaxValue,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                    }}
                />
                <Box sx={{ width: 300 }}>
                    <Slider
                        value={typeof sliderState === 'number' ? sliderState : 0}
                        onChange={handleSliderChange}
                        min={sliderMinValue}
                        max={sliderMaxValue}
                        defaultValue={sliderDefaultValue}
                        valueLabelDisplay="on"
                    />
                </Box>
            </Box>
            <ToggleButtonGroup
                value={toggleButtonState}
                exclusive
                onChange={handleToggleButtonChange}
            >
                <ToggleButton value="1">One Year</ToggleButton>
                <ToggleButton value="5">Five Years</ToggleButton>
                <ToggleButton value="10">Ten Years</ToggleButton>
            </ToggleButtonGroup>
            <Grid container spacing={2}>
                <Grid item xs={8}><div>Coinbase.com total fees:</div></Grid>
                <Grid item xs={4}><div>${coinbaseComFees}</div></Grid>
                <Grid item xs={8}><div>nckl total fees:</div></Grid>
                <Grid item xs={4}><div>${coinbaseProFees}</div></Grid>
            </Grid>

        </Container >
    );
}

// From https://www.gobankingrates.com/investing/crypto/coinbase-fees/
function calculateCoinbaseComFees(cryptoPerDay: number, years: string): number {
    const yearsNum = parseInt(years, 10);
    let fee = 0;
    if (cryptoPerDay <= 10) {
        fee = 0.99;
    } else if (cryptoPerDay <= 25) {
        fee = 1.49;
    } else if (cryptoPerDay <= 50) {
        fee = 1.99
    } else if (cryptoPerDay <= 200) {
        fee = 2.99
    } else {
        fee = cryptoPerDay * 0.0149;
    }
    return Math.floor(fee * 365 * yearsNum);
}

function calculateCoinbaseProFees(cryptoPerDay: number, years: string): number {
    const yearsNum = parseInt(years, 10);
    return Math.floor(cryptoPerDay * 0.006 * 365 * yearsNum);
}
