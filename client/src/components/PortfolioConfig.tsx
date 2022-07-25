import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, CircularProgress } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';

import { AssetAllocation, PortfolioAPI } from '../api/PortfolioData';
import { Product, CoinbaseProAPI } from '../api/CoinbaseProData';

interface AssetAllocationConfigProps {
    productId: string;
    displayName: string;
    dailyTargetAmount: number;
}

interface PortfolioConfigProps {
    id: string;
    displayName: string;
    initialAllocations: AssetAllocation[];
    onPortfolioUpdate: () => Promise<void>;
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

function PortfolioConfig(props: PortfolioConfigProps): JSX.Element {
    const [allProducts, setAllProducts] = useState<Product[] | null>(null);
    const [productsById, setProductsById] = useState<{ [key: ProductId]: Product } | null>(null);

    const [editing, setEditing] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    const [allocationAmounts, setAllocationAmounts] = useState<{ [key: string]: number }>(
        Object.fromEntries<number>(props.initialAllocations.map(allocation => [allocation.productId, allocation.dailyTargetAmount]))
    );
    const [addedAllocations, setAddedAllocations] = useState<ProductId[]>([]);

    useEffect(() => {
        CoinbaseProAPI.getAvailableProducts()
            .then(products => {
                setAllProducts(products);
                setProductsById(
                    Object.fromEntries<Product>(products.map(product => [product.id, product]))
                )
            })
    }, []);

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
                        PortfolioAPI.setAssetAllocation(
                            props.id,
                            { productId, dailyTargetAmount: allocationAmounts[productId] },
                            () => { },
                            () => { },
                            () => { }
                        ));
                } else {
                    apiPromises.push(
                        PortfolioAPI.removeAssetAllocation(
                            props.id,
                            productId,
                            () => { },
                            () => { },
                            () => { }
                        ));
                }
            }
        }
        // Set new allocations
        for (const productId of addedAllocations) {
            const allocationAmount = allocationAmounts[productId];
            if (allocationAmount > 0) {
                apiPromises.push(
                    PortfolioAPI.setAssetAllocation(
                        props.id,
                        { productId, dailyTargetAmount: allocationAmount },
                        () => { },
                        () => { },
                        () => { }
                    ));
            }
        }
        setEditing(false);
        setSaving(true);
        Promise.all(apiPromises).finally(() => {
            props.onPortfolioUpdate().finally(() => {
                setSaving(false);
                setAddedAllocations([]);
            });
        })
    }

    if (allProducts === null || productsById === null) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    }

    const currentAllocatedProductIds = props.initialAllocations.map(allocation => allocation.productId).concat(addedAllocations);
    return (
        <div>
            <TableContainer component={Paper}>
                {/* <Table sx={{ minWidth: 650 }}> */}
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
                                    displayName={productsById[productId].displayName}
                                    dailyTargetAmount={allocationAmounts[productId]}
                                    onDailyAmountUpdate={handleUpdateAllocation(productId)}
                                /> :
                                <AssetAllocationRow
                                    key={productId}
                                    productId={productId}
                                    displayName={productsById[productId].displayName}
                                    dailyTargetAmount={allocationAmounts[productId]}
                                />
                        ))}
                        {editing && (
                            <NewAssetAllocationRow
                                options={allProducts.filter(product => !currentAllocatedProductIds.includes(product.id))}
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
        </div>
    );
};

export { PortfolioConfig };

