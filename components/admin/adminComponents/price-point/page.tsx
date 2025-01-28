import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormHelperText,
} from "@mui/material";
import axios from "axios";

// Define types for the roof types and price points
interface RoofType {
  id: string;
  name: string;
}

interface PricePoint {
  id: string;
  roofType: string;
  zipCode: string;
  additionalFee: number;
  price: number;
}

const API_BASE_URL = "/api/pricePoints";
const API_BASE_UR = "/api/";


const PricePointManagementAdmin: React.FC = () => {
  const [roofTypes, setRoofTypes] = useState<RoofType[]>([]);
  const [selectedRoofType, setSelectedRoofType] = useState<string>("");
  const [pricePoint, setPricePoint] = useState<PricePoint>({
    id: "",
    roofType: "",
    zipCode: "",
    additionalFee: 0,
    price: 0,
  });
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    roofType: false,
    price: false,
    zipCode: false,
  });

  useEffect(() => {
    fetchRoofTypes();
    fetchPricePoints();
  }, []);

  const fetchRoofTypes = async () => {
    try {
      const response = await axios.get<{ data: RoofType[] }>(
        `${API_BASE_UR}/roofTypes`
      );
      setRoofTypes(response.data.data);
    } catch (error) {
    }
  };

  const fetchPricePoints = async () => {
    try {
      const response = await axios.get<{ data: PricePoint[] }>(API_BASE_URL);
      setPricePoints(response.data.data);
    } catch (error) {
    }
  };

  const addPricePoint = async () => {
    const errorState = { price: false, zipCode: false, roofType: false };
    if (!pricePoint.price || isNaN(pricePoint.price)) errorState.price = true;
    if (!pricePoint.zipCode.trim()) errorState.zipCode = true;
    if (!selectedRoofType.trim()) errorState.roofType = true;

    setErrors(errorState);
    if (errorState.price || errorState.zipCode || errorState.roofType) return;

    try {
      const payload: PricePoint = {
        ...pricePoint,
        roofType: selectedRoofType,
      };

      if (editIndex !== null) {
        await axios.put(API_BASE_URL, payload);
      } else {
        await axios.post(API_BASE_URL, payload);
      }

      setPricePoint({ id: "", roofType: "", zipCode: "", additionalFee: 0, price: 0 });
      setSelectedRoofType("");
      setEditIndex(null);
      fetchPricePoints();
    } catch (error) {
    }
  };

  const editPricePoint = (index: number) => {
    const pointToEdit = pricePoints[index];
    setPricePoint({ ...pointToEdit });
    setSelectedRoofType(pointToEdit.roofType);
    setEditIndex(index);
  };

  const deletePricePoint = async (index: number) => {
    try {
      const pointToDelete = pricePoints[index];
      await axios.delete(API_BASE_URL, { data: { id: pointToDelete.id } });
      fetchPricePoints();
    } catch (error) {
    }
  };

  return (
    <Container sx={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Price Point Management
      </Typography>

      <Box>
        <Typography variant="h6">Select Roof Type</Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 5, mt: 2 }}>
          <Select
            value={selectedRoofType}
            onChange={(e) => {
              setSelectedRoofType(e.target.value);
              setErrors((prev) => ({ ...prev, roofType: false }));
            }}
            displayEmpty
            error={errors.roofType}
          >
            <MenuItem value="">
              <em>Select Roof Type</em>
            </MenuItem>
            {
  Array.isArray(roofTypes) && roofTypes.map((roof) => (
    <MenuItem key={roof.id} value={roof.name}>
      {roof.name}
    </MenuItem>
  ))
}
          </Select>
          {errors.roofType && (
            <FormHelperText>Please select a roof type.</FormHelperText>
          )}
        </Box>
      </Box>

      {selectedRoofType && (
        <Box>
          <Typography variant="h5">Price Point</Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 5, mt: 1 }}>
            <TextField
              label="Zip Code"
              value={pricePoint.zipCode}
              onChange={(e) =>
                setPricePoint({ ...pricePoint, zipCode: e.target.value })
              }
              error={errors.zipCode}
              helperText={errors.zipCode ? "Zip code is required" : ""}
            />
            <TextField
              label="Price"
              type="number"
              value={pricePoint.price}
              onChange={(e) =>
                setPricePoint({ ...pricePoint, price: Number(e.target.value) })
              }
              error={errors.price}
              helperText={
                errors.price ? "Price is required and must be valid" : ""
              }
            />
            <TextField
              label="Additional Fee"
              type="number"
              value={pricePoint.additionalFee}
              onChange={(e) =>
                setPricePoint({
                  ...pricePoint,
                  additionalFee: Number(e.target.value),
                })
              }
            />
            <Button variant="contained" onClick={addPricePoint}>
              {editIndex !== null ? "Update Price Point" : "Add Price Point"}
            </Button>
          </Box>
        </Box>
      )}

      {pricePoints.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roof Type</TableCell>
                <TableCell>Zip Code</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Additional Fee</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pricePoints.map((point, index) => (
                <TableRow key={index}>
                  <TableCell>{point.roofType}</TableCell>
                  <TableCell>{point.zipCode}</TableCell>
                  <TableCell>${point.price}</TableCell>
                  <TableCell>${point.additionalFee}</TableCell>
                  <TableCell>${point.price + point.additionalFee}</TableCell>
                  {/* <TableCell>
                    <Button onClick={() => editPricePoint(index)}>Edit</Button>
                    <Button
                      color="error"
                      onClick={() => deletePricePoint(index)}
                    >
                      Delete
                    </Button>
                  </TableCell> */}
                    <TableCell style={{ display: 'flex', gap: '8px' }}>
<Button variant="outlined" onClick={() => editPricePoint(index)}>Edit</Button>
<Button variant="outlined" color="error" onClick={() => deletePricePoint(index)}>Delete</Button>
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

export default PricePointManagementAdmin;
