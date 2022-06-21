import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, CircularProgress } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';

import { AssetAllocation, PortfolioAPI } from './api/PortfolioData';

interface AssetAllocationConfigProps {
    productId: string;
    dailyTargetAmount: number;
}

interface PortfolioConfigProps {
    id: string;
    displayName: string;
    allocations: AssetAllocation[];
    onPortfolioUpdate: () => Promise<void>;
}

function AssetAllocationRow(props: AssetAllocationConfigProps): JSX.Element {
    return (
        <TableRow
        // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row">
                {props.productId}
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
                {props.productId}
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

function PortfolioConfig(props: PortfolioConfigProps): JSX.Element {
    const [editing, setEditing] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [updatedAllocations, setUpdatedAllocations] = useState<{ [key: string]: number }>(
        Object.fromEntries<number>(props.allocations.map(allocation => [allocation.productId, allocation.dailyTargetAmount]))
    );

    const handleUpdateAllocation = (productId: string) => {
        return (updatedDailyAmount: number) => {
            setUpdatedAllocations({ ...updatedAllocations, [productId]: updatedDailyAmount });
        };
    }

    const handleSave = () => {
        const apiPromises = new Array<Promise<void>>();
        for (let originalAllocation of props.allocations) {
            let productId = originalAllocation.productId;
            if (originalAllocation.dailyTargetAmount !== updatedAllocations[productId]) {
                apiPromises.push(
                    PortfolioAPI.setAssetAllocation(
                        props.id,
                        { productId, dailyTargetAmount: updatedAllocations[productId] },
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
            });
        })
    }

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
                        {props.allocations.map((allocation) => (
                            editing ?
                                <EditableAssetAllocationRow
                                    key={allocation.productId}
                                    onDailyAmountUpdate={handleUpdateAllocation(allocation.productId)}
                                    {...allocation}
                                /> :
                                <AssetAllocationRow
                                    key={allocation.productId}
                                    productId={allocation.productId}
                                    dailyTargetAmount={updatedAllocations[allocation.productId]}
                                />
                        ))}
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

