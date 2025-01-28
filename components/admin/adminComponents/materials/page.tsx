'use client'
import { Container, Typography, Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select, FormHelperText } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const MaterialManagementAdmin: React.FC = () => {
    const [roofTypes, setRoofTypes] = useState<{ id: number; name: string }[]>([]);
    const [selectedRoofType, setSelectedRoofType] = useState<string>("");
    const [newMaterial, setNewMaterial] = useState({ name: "", cost: 0, id: 0 });
    const [materialList, setMaterialList] = useState<{ name: string; cost: number; id: number }[]>([]);
    const [editMaterialIndex, setEditMaterialIndex] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ roofType: boolean; materialName: boolean; materialCost: boolean }>({
        roofType: false,
        materialName: false,
        materialCost: false,
    });
    const [tableData, setTableData] = useState<{
        [x: string]: any; roofType: string; materials: { id: number; name: string; cost: number }[] 
    }[]>([]);

    // Fetch Roof Types on Component Mount
    useEffect(() => {
        fetch('/api/roofTypes')
            .then(response => response.json())
            .then((data) => {
                const roofTypesData = data?.data;
                if (Array.isArray(roofTypesData)) {
                    setRoofTypes(roofTypesData);
                } else {
                    console.error('Invalid roof types format:', roofTypesData);
                    setRoofTypes([]);
                }
            })
            .catch(error => console.error('Error fetching roof types:', error));
    }, []);
    
    // Fetch Materials Data for Table
    const fetchMaterialsData = async () => {
        try {
            const response = await fetch('/api/materials');
            const data = await response.json();
    
            if (data.success && Array.isArray(data.data)) {
                setTableData(data.data);
            } else {
                console.error('Invalid data format');
            }
        } catch (error) {
            console.error('Error fetching table data:', error);
        }
    };
    
    useEffect(() => {
        fetchMaterialsData(); 
    }, []);
    
    // Add or Update Material
    const addMaterialToList = () => {
        const errorState = { materialName: false, materialCost: false };
    
        // Check for empty or invalid fields
        if (!newMaterial.name.trim()) errorState.materialName = true;
        if (newMaterial.cost <= 0 || isNaN(newMaterial.cost)) errorState.materialCost = true;
    
        setErrors(prev => ({ ...prev, ...errorState }));
    
        // Exit if there are errors
        if (errorState.materialName || errorState.materialCost) return;
    
        // Check for duplicate material name under the same roof type
        const duplicateMaterial = materialList.some(
            (material) => material.name.toLowerCase() === newMaterial.name.toLowerCase()
        );
    
        if (duplicateMaterial) {
            toast.error("This material name is already added for the selected roof type. Please choose a different name.");
            return;
        }
    
        if (editMaterialIndex !== null) {
            // Update existing material
            const updatedMaterials = [...materialList];
            updatedMaterials[editMaterialIndex] = newMaterial;
            setMaterialList(updatedMaterials);
            setEditMaterialIndex(null);
        } else {
            // Add new material
            setMaterialList([...materialList, { ...newMaterial, id: Date.now() }]);
        }
    
        // Clear the input fields
        setNewMaterial({ name: "", cost: 0, id: 0 });
    };
    

    // Edit Material
    const editMaterial = (index: number) => {
        const materialToEdit = materialList[index];
        setNewMaterial({ ...materialToEdit });
        setEditMaterialIndex(index); 
    };
    
    // Delete Material
    const deleteMaterial = (index: number) => {
        const updatedMaterials = materialList.filter((_, i) => i !== index);
        setMaterialList(updatedMaterials);
    };

    // Submit Material Data (Create or Update)
    const handleSubmit = async () => {
        const errorState = { roofType: false };
        if (!selectedRoofType) errorState.roofType = true;
        setErrors(prev => ({ ...prev, ...errorState }));
        if (errorState.roofType) return;

        const newRow = {
            roofType: selectedRoofType,
            materials: materialList,
        };


        if (editMaterialIndex !== null) {
            // Find the correct index in tableData
            const indexInTable = tableData.findIndex(row => row.roofType === selectedRoofType);
            if (indexInTable !== -1) {
                await updateMaterial(indexInTable, newRow); 
            } else {
                console.error("Selected roof type not found in table data.");
                toast.error("Failed to update material: Roof type not found.");
            }
        } else {
            await createMaterial(newRow); 
        }
    };

    // Create Material (POST)
    const createMaterial = async (newRow: { roofType: string; materials: { id: number; name: string; cost: number }[] }) => {
        try {
            const response = await fetch('/api/materials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRow), 
            });
    
            const data = await response.json();
            if (data.success) {
                setTableData([...tableData, newRow]); 
                setMaterialList([]); 
                setSelectedRoofType(""); 
                fetchMaterialsData(); 
            } else {
                console.error('Error creating material:', data.message);
            }
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    // Update Material (PUT)
// Update Material (PUT)
const updateMaterial = async (index: number, newRow: { roofType: string; materials: { id: number; name: string; cost: number }[] }) => {
    try {
        if (index < 0 || index >= tableData.length) {
            console.error("Invalid index:", index);
            toast.error("Failed to update material: Invalid index.");
            return;
        }

        const rowToUpdate = tableData[index]; // Get the row from tableData using the index
        const materialId = rowToUpdate.id; // Extract the ID from the row (if exists)

        // Send the updated material with its ID and roofType
        const response = await fetch(`/api/materials`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: materialId, // Send the ID of the material being updated
                roofType: newRow.roofType,
                materials: newRow.materials,
            }),
        });

        const data = await response.json();
        if (data.success) {
            const updatedTableData = [...tableData];
            updatedTableData[index] = { ...rowToUpdate, ...newRow };
            setTableData(updatedTableData);

            setMaterialList([]);
            setSelectedRoofType("");
            setEditMaterialIndex(null);

            toast.success("Material updated successfully!");
        } else {
            console.error('Error updating material:', data.message);
        }
    } catch (error) {
        console.error('Error updating material:', error);
    }
};


    

    // Delete Table Row (DELETE)
    const deleteTableRow = async (index: number) => {
        try {
            const rowToDelete = tableData[index];
            const rowId = rowToDelete?.id;
            if (!rowId) {
                toast.error("Row ID is missing.");
                return;
            }

            const response = await fetch(`/api/materials`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: rowId }),
            });

            const data = await response.json();
            console.log("Delete Response:", data);

            if (response.ok && data.success) {
                const updatedTableData = tableData.filter((_, i) => i !== index);
                setTableData(updatedTableData);
            } else {
                console.error('Error deleting material:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    // Edit Table Row
    const editTableRow = (index: number) => {
        const rowToEdit = tableData[index];
        setSelectedRoofType(rowToEdit.roofType);
        setMaterialList([...rowToEdit.materials]); 
    };

    return (
        <Container sx={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>Material Management</Typography>

            {/* Roof Type Selection */}
            <Box>
                <Typography variant="h6">Select Roof Type</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2 }}>
                    <Select
                        value={selectedRoofType}
                        onChange={(e) => {
                            setSelectedRoofType(e.target.value);
                            setErrors(prev => ({ ...prev, roofType: false }));
                        }}
                        displayEmpty
                        error={errors.roofType}
                    >
                        <MenuItem value="">
                            <em>Select Roof Type</em>
                        </MenuItem>
                        {Array.isArray(roofTypes) && roofTypes.map((roof) => (
                            <MenuItem key={roof.id} value={roof.name}>{roof.name}</MenuItem>
                        ))}
                    </Select>
                    {errors.roofType && <FormHelperText>Please select a roof type.</FormHelperText>}
                </Box>
            </Box>

            {/* Material Entry */}
            {selectedRoofType && (
                <Box>
                    <Typography variant="h5">Materials</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
                        <TextField
                            label="Material Name"
                            value={newMaterial.name}
                            onChange={(e) => {
                                setNewMaterial({ ...newMaterial, name: e.target.value });
                                setErrors(prev => ({ ...prev, materialName: false }));
                            }}
                            error={errors.materialName}
                            helperText={errors.materialName ? 'Material name is required' : ''}
                        />
                        <TextField
                            label="Cost"
                            type="number"
                            value={newMaterial.cost}
                            onChange={(e) => {
                                setNewMaterial({ ...newMaterial, cost: Number(e.target.value) });
                                setErrors(prev => ({ ...prev, materialCost: false }));
                            }}
                            error={errors.materialCost}
                            helperText={errors.materialCost ? 'Invalid cost' : ''}
                        />
<Button
    variant="contained"
    onClick={addMaterialToList}
    sx={{ display: editMaterialIndex !== null ? 'none' : 'inline-block' }}
>
    {editMaterialIndex !== null ? 'Update Material' : 'Add Material'}
</Button>
                    </Box>

                    {/* Material List */}
                    {materialList.length > 0 && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Material Name</TableCell>
                                        <TableCell>Cost</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {materialList.map((material, index) => (
                                        <TableRow key={material.id}>
                                            <TableCell>{material.name}</TableCell>
                                            <TableCell>{material.cost}</TableCell>
                                            <TableCell style={{ display: 'flex', gap: '8px' }}>
                                            <Button variant="outlined" onClick={() => editMaterial(index)}>Edit</Button>
                                                <Button variant="outlined" color="error" onClick={() => deleteMaterial(index)}>Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleSubmit}>
                    {editMaterialIndex !== null ? 'Update' : 'Submit'}
                </Button>
            </Box>

            {/* Material Table */}
            <Box sx={{ mt: 4 }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                
                                <TableCell>Roof Type</TableCell>
                                <TableCell>Materials (Cost)</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.roofType}</TableCell>
                                    <TableCell>
                                    {row.materials.map((material, idx) => (
        <div key={material.id} style={{ display: 'inline-flex', gap: '4px' }}>
            <span>{material.name}</span>
            <span>(${material.cost}), </span>
        </div>
    ))}
                                    </TableCell>
                                    <TableCell style={{ display: 'flex', gap: '8px' }}>
                                        <Button variant="outlined" onClick={() => editTableRow(index)}>Edit</Button>
                                        <Button variant="outlined" color="error" onClick={() => deleteTableRow(index)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default MaterialManagementAdmin;
