import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import axios from "axios";
import { toast } from "react-toastify";

const DynamicDiscountComponent: React.FC = () => {
  const [roofTypes, setRoofTypes] = useState<{ id: string; name: string }[]>([]);
  const [selectedRoofType, setSelectedRoofType] = useState<string>("");
  const [wasteTier, setWasteTier] = useState<number | string>("");
  const [wasteTiers, setWasteTiers] = useState<{ id: string; roofType: string; wasteTier: number }[]>([]);

  // Fetch roof types and waste tiers on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch roof types
        const roofTypesResponse = await axios.get("/api/roofTypes");
        if (roofTypesResponse.data.success && roofTypesResponse.data.data) {
          setRoofTypes(roofTypesResponse.data.data);
        } else {
          console.error("Failed to fetch roof types");
        }

        // Fetch waste tiers
        const wasteTiersResponse = await axios.get("/api/waste-tiers");
        if (wasteTiersResponse.data.success && wasteTiersResponse.data.data) {
          setWasteTiers(wasteTiersResponse.data.data);
        } else {
          console.error("Failed to fetch waste tiers");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleRoofTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedRoofType(event.target.value);
  };

  const handleWasteTierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWasteTier(event.target.value);
  };

  const handleAddWasteTier = async () => {
    if (!selectedRoofType || !wasteTier) {
      toast.error("Please select a roof type and enter a valid waste tier");
      return;
    }
  
    const newWasteTier = {
      roofType: selectedRoofType,
      wasteTier: Number(wasteTier),
    };
  
    try {
      const response = await axios.post("/api/waste-tiers", newWasteTier);
      if (response.data.success) {
        // Fetch the updated list of waste tiers after adding
        const updatedWasteTiersResponse = await axios.get("/api/waste-tiers");
        if (updatedWasteTiersResponse.data.success) {
          setWasteTiers(updatedWasteTiersResponse.data.data);
        } else {
          toast.error("Failed to fetch updated waste tiers");
        }
        setWasteTier(""); // Reset waste tier input
      } else {
        toast.error("Failed to add waste tier");
      }
    } catch (error) {
      console.error("Error adding waste tier:", error);
      toast.error("An error occurred while adding the waste tier.");
    }
  };
  

  const handleDeleteWasteTier = async (id: string) => {
    try {
      const response = await axios.delete("/api/waste-tiers", {
        data: { id },
      });

      if (response.data.success) {
        setWasteTiers((prev) => prev.filter((tier) => tier.id !== id));
      } else {
        alert("Failed to delete waste tier");
      }
    } catch (error) {
      console.error("Error deleting waste tier:", error);
      toast.error("An error occurred while deleting the waste tier.");
    }
  };

  return (
    <Container sx={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Waste Tiers
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Roof Type</InputLabel>
          <Select value={selectedRoofType} onChange={handleRoofTypeChange} label="Roof Type">
            {roofTypes.map((roofType) => (
              <MenuItem key={roofType.id} value={roofType.id}>
                {roofType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedRoofType && (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            type="number"
            label="Waste Tier %"
            value={wasteTier}
            onChange={handleWasteTierChange}
          />
          <Button variant="contained" color="primary" onClick={handleAddWasteTier}>
            Add
          </Button>
        </Box>
      )}

      {wasteTiers.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roof Type</TableCell>
                <TableCell>Waste Tier %</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wasteTiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell>
                    {roofTypes.find((roofType) => roofType.id === tier.roofType)?.name || tier.roofType}
                  </TableCell>
                  <TableCell>{tier.wasteTier} %</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteWasteTier(tier.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default DynamicDiscountComponent;
