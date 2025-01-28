"use client";
import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";  // Import Axios for API requests
import { toast } from "react-toastify";

interface RoofType {
    id: number;
    name: string;
    materialIds: { id: number; name: string }[];
}

interface Material {
    materials: any;
    roofType: string;
    id: number;
    name: string;
    cost: number;
}

const RoofTypesPage: React.FC = () => {
    const [roofTypes, setRoofTypes] = useState<RoofType[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [roofTypeName, setRoofTypeName] = useState<string>("");
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchRoofTypes();
        fetchMaterials();
    }, []);

    const fetchRoofTypes = async () => {
        try {
            const response = await axios.get("/api/roofTypes");  // Fetch roof types from the API
            setRoofTypes(response.data.data || []);
        } catch (error) {
        }
    };

    const fetchMaterials = async () => {
        try {
            const response = await axios.get("/api/materials");  // Fetch materials from the API
            setMaterials(response.data.data);
        } catch (error) {
        }
    };

    const saveRoofTypes = async (updatedRoofTypes: RoofType[]) => {
        setRoofTypes(updatedRoofTypes);
        // Optionally, persist data on the server here as well
    };

    const handleAddOrEditRoofType = async () => {
        if (!roofTypeName.trim()) return;
    
        const existingRoofType = roofTypes.find(
            (rt) => rt.name.toLowerCase() === roofTypeName.toLowerCase()
        );
        if (existingRoofType && existingRoofType.id !== editingId) {
            toast.error("A roof type with this name already exists.");
            return;
        }
    
        if (editingId !== null) {
            // Update existing roof type via API
            try {
                const response = await axios.put("/api/roofTypes", {
                    id: editingId,
                    name: roofTypeName,
                    materialIds: [],  // Add logic to get selected materials if needed
                });
    
                if (response.data.success) {
                    const updatedRoofTypes = roofTypes.map((rt) =>
                        rt.id === editingId ? { ...rt, name: roofTypeName } : rt
                    );
                    saveRoofTypes(updatedRoofTypes);
                    setEditingId(null);  // Clear editing mode
                } else {
                    alert("Error updating roof type: " + response.data.message);
                }
            } catch (error) {
            }
        } else {
            // Create new roof type via API
            try {
                const response = await axios.post("/api/roofTypes", {
                    name: roofTypeName,
                    materialIds: [],  // Add logic to handle material IDs
                });
    
                if (response.data.success) {
                    saveRoofTypes([...roofTypes, response.data.data]);
                } else {
                    alert("Error creating roof type: " + response.data.message);
                }
            } catch (error) {
            }
        }
    
        setRoofTypeName("");  // Clear input after operation
    };
    

    const handleDeleteRoofType = async (id: number) => {
        try {
            const response = await axios.delete("/api/roofTypes", { data: { id } });  // Ensure the id is passed in the request body
            if (response.data.success) {
                const updatedRoofTypes = roofTypes.filter((rt) => rt.id !== id);
                saveRoofTypes(updatedRoofTypes);
            } else {
                alert("Error deleting roof type: " + response.data.message);
            }
        } catch (error) {
        }
    };
    

    const handleEditRoofType = (id: number) => {
        const roofType = roofTypes.find((rt) => rt.id === id);
        if (roofType) {
            setRoofTypeName(roofType.name);
            setEditingId(id);
        }
    };

    return (
        <Container sx={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Roof Types Management
            </Typography>
            <Box display="flex" gap={2} mb={5} mt={2}>
                <TextField
                    label="Roof Type"
                    value={roofTypeName}
                    onChange={(e) => setRoofTypeName(e.target.value)}
                    style={{ width: "80%" }}
                />
                <Button variant="contained" onClick={handleAddOrEditRoofType} style={{ width: "20%" }}>
                    {editingId !== null ? "Update" : "Add"}
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Roof Type</TableCell>
                            <TableCell>Assigned Materials</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
    {roofTypes.map((rt) => {
        // Fetch materials from API or local state that correspond to the roof type
        const roofTypeMaterials = materials
            .filter((mat) => mat.roofType === rt.name)  // Match by roof type name
            .map((mat) => mat.materials)
            .flat();  // Flatten the array of materials to make sure we get the right data

        return (
            <TableRow key={rt.id}>
                <TableCell>{rt.name}</TableCell>
                <TableCell>
                    {roofTypeMaterials.length > 0
                        ? roofTypeMaterials
                              .map(
                                  (mat: Material) =>
                                      `${mat.name}`
                              )
                              .join(", ")
                        : "None"}
                </TableCell>
                {/* <TableCell>
                    <IconButton onClick={() => handleEditRoofType(rt.id)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="secondary"
                        onClick={() => handleDeleteRoofType(rt.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </TableCell> */}
                 <TableCell style={{ display: 'flex', gap: '8px' }}>
                   <Button variant="outlined" onClick={() => handleEditRoofType(rt.id)}>Edit</Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteRoofType(rt.id)}>Delete</Button>
                  </TableCell>
            </TableRow>
        );
    })}
</TableBody>

                </Table>
            </TableContainer>
        </Container>
    );
};

export default RoofTypesPage;
