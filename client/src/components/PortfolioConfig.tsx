import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, CircularProgress, Grid, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';

import { AssetAllocation } from '../api/PortfolioData';
import { Product, CoinbaseProAPI } from '../api/CoinbaseProData';

const CASH_RUNWAY_DAYS_WARNING_THRESHOLD = 5;

interface AssetAllocationConfigProps {
    productId: string;
    displayName: string;
    dailyTargetAmount: number;
}

function AssetAllocationRow(props: AssetAllocationConfigProps): JSX.Element {
    return (
        <TableRow
        // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row">
                {props.displayName}
            </TableCell>
            <TableCell align="center">{props.dailyTargetAmount}</TableCell>
        </TableRow>
    );
};

function _isInteger(x: string): boolean {
    return x === `${parseInt(x)}`;
}

interface EditableAssetAllocationRowProps extends AssetAllocationConfigProps {
    onDailyAmountUpdate: (updatedDailyAmount: number) => void;
}

function EditableAssetAllocationRow(props: EditableAssetAllocationRowProps): JSX.Element {
    const [dailyAmount, setDailyAmount] = useState<string>(`${props.dailyTargetAmount}`);

    const handleDailyAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (_isInteger(event.target.value) || event.target.value === '') {
            setDailyAmount(event.target.value);
            props.onDailyAmountUpdate(event.target.value === '' ? 0 : parseInt(event.target.value));
        }
    }

    return (
        <TableRow>
            <TableCell component="th" scope="row">
                {props.displayName}
            </TableCell>
            <TableCell align="center">
                <TextField
                    value={dailyAmount}
                    onChange={handleDailyAmountChange}
                />
            </TableCell>
        </TableRow>
    );
};

interface NewAssetAllocationRowProps {
    options: Product[];
    onSubmitAssetAddition: (asset: Product) => void;
}

function NewAssetAllocationRow(props: NewAssetAllocationRowProps): JSX.Element {
    const [selectedOption, setSelectedOption] = useState<Product | null>(null);
    const [inputValue, setInputValue] = useState('');

    return (
        <TableRow>
            <TableCell>
                <Autocomplete
                    onChange={(event, newValue) => {
                        setSelectedOption(newValue);
                    }}
                    inputValue={inputValue}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    options={props.options}
                    getOptionLabel={(option) => option.displayName}
                    style={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Add asset" variant="outlined" />}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                />
            </TableCell>
            {selectedOption !== null && (
                <TableCell>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            props.onSubmitAssetAddition(selectedOption);
                            setInputValue(''); // Clear the input box to make space for additional entries
                        }}
                        endIcon={<AddIcon />}
                    />
                </TableCell>
            )}
        </TableRow>
    );
}

type ProductId = Product["id"];

interface PortfolioConfigProps {
    id: string;
    displayName: string;
    usdBalance: number;
    initialAllocations: AssetAllocation[];
    onPortfolioUpdate: (portfolioId: string) => Promise<void>;
    setAssetAllocation: (portfolioId: string, allocation: AssetAllocation) => Promise<void>;
    removeAssetAllocation: (portfolioId: string, productId: string) => Promise<void>;
}

interface EnhancedPortfolioConfigProps extends PortfolioConfigProps {
    allProducts: Product[];
    productsById: { [key: ProductId]: Product };
}

function PortfolioConfig(props: EnhancedPortfolioConfigProps): JSX.Element {
    const [editing, setEditing] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    const [allocationAmounts, setAllocationAmounts] = useState<{ [key: string]: number }>(
        Object.fromEntries<number>(props.initialAllocations.map(allocation => [allocation.productId, allocation.dailyTargetAmount]))
    );
    const [addedAllocations, setAddedAllocations] = useState<ProductId[]>([]);

    const handleUpdateAllocation = (productId: string) => {
        return (updatedDailyAmount: number) => {
            setAllocationAmounts({ ...allocationAmounts, [productId]: updatedDailyAmount });
        };
    }

    const handleSave = () => {
        const apiPromises = new Array<Promise<void>>();
        // Update or remove initial allocations
        for (const originalAllocation of props.initialAllocations) {
            const productId = originalAllocation.productId;
            if (originalAllocation.dailyTargetAmount !== allocationAmounts[productId]) {
                if (allocationAmounts[productId] > 0) {
                    apiPromises.push(
                        props.setAssetAllocation(
                            props.id,
                            { productId, dailyTargetAmount: allocationAmounts[productId] }
                        ));
                } else {
                    apiPromises.push(
                        props.removeAssetAllocation(
                            props.id,
                            productId
                        ));
                }
            }
        }
        // Set new allocations
        for (const productId of addedAllocations) {
            const allocationAmount = allocationAmounts[productId];
            if (allocationAmount > 0) {
                apiPromises.push(
                    props.setAssetAllocation(
                        props.id,
                        { productId, dailyTargetAmount: allocationAmount }
                    ));
            }
        }
        setEditing(false);
        setSaving(true);
        Promise.all(apiPromises).finally(() => {
            props.onPortfolioUpdate(props.id).finally(() => {
                setSaving(false);
                setAddedAllocations([]);
            });
        })
    }

    const currentAllocatedProductIds = props.initialAllocations.map(allocation => allocation.productId).concat(addedAllocations);
    const totalDailyContributions = currentAllocatedProductIds.map(productId => allocationAmounts[productId]).reduce<number>((sum, x) => sum + x, 0);
    const cashRunwayDays = totalDailyContributions > 0 ? Math.floor(props.usdBalance / totalDailyContributions) : Infinity;
    const runwayTextColor = cashRunwayDays <= CASH_RUNWAY_DAYS_WARNING_THRESHOLD ? 'error' : 'textPrimary';
    const runwayString = cashRunwayDays === Infinity ? '--' : `${cashRunwayDays} days`;
    return (
        <Box
            sx={{ minWidth: 500, maxWidth: 800 }}
        >
            <Grid container spacing={2}>
                <Grid item xs={4}><Typography color='textPrimary'>USD Balance:</Typography></Grid>
                <Grid item xs={8}><Typography color={runwayTextColor}>${props.usdBalance}</Typography></Grid>
                <Grid item xs={4}><Typography color='textPrimary'>Total daily contributions:</Typography></Grid>
                <Grid item xs={8}><Typography color='textPrimary'>${totalDailyContributions}</Typography></Grid>
                <Grid item xs={4}><Typography color='textPrimary'>Cash runway:</Typography></Grid>
                <Grid item xs={8}><Typography color={runwayTextColor}>{runwayString}</Typography></Grid>
            </Grid>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Asset</TableCell>
                            <TableCell align="center">Daily contributions (USD)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentAllocatedProductIds.map((productId) => (
                            editing ?
                                <EditableAssetAllocationRow
                                    key={productId}
                                    productId={productId}
                                    displayName={props.productsById[productId].displayName}
                                    dailyTargetAmount={allocationAmounts[productId]}
                                    onDailyAmountUpdate={handleUpdateAllocation(productId)}
                                /> :
                                <AssetAllocationRow
                                    key={productId}
                                    productId={productId}
                                    displayName={props.productsById[productId].displayName}
                                    dailyTargetAmount={allocationAmounts[productId]}
                                />
                        ))}
                        {editing && (
                            <NewAssetAllocationRow
                                options={props.allProducts.filter(product => !currentAllocatedProductIds.includes(product.id))}
                                onSubmitAssetAddition={(product) => {
                                    setAddedAllocations(prevAddedAllocations => [...prevAddedAllocations, product.id]);
                                    setAllocationAmounts({ ...allocationAmounts, [product.id]: 0 });
                                }}
                            />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {!(editing || saving) && (
                <Button variant="contained" color="primary" onClick={() => setEditing(true)} endIcon={<EditIcon />}>
                    Edit
                </Button>
            )}
            {editing && !saving && (
                <Button variant="contained" color="primary" onClick={handleSave} endIcon={<SaveIcon />}>
                    Save
                </Button>
            )}
            {saving && (
                <CircularProgress />
            )}
        </Box>
    );
};

export default function QueryingPortfolioConfig(props: PortfolioConfigProps): JSX.Element {
    const [allProducts, setAllProducts] = useState<Product[] | null>(null);
    const [productsById, setProductsById] = useState<{ [key: ProductId]: Product } | null>(null);

    useEffect(() => {
        CoinbaseProAPI.getAvailableProducts()
            .then(products => {
                setAllProducts(products);
                setProductsById(
                    Object.fromEntries<Product>(products.map(product => [product.id, product]))
                )
            })
    }, []);

    if (allProducts === null || productsById === null) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    } else {
        return <PortfolioConfig {...props} allProducts={allProducts} productsById={productsById} />
    }
}

export { PortfolioConfig };

