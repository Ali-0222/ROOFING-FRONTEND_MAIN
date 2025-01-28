import { useState, useEffect } from "react";
import { 
    Container, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper 
} from "@mui/material";
import axios from "axios";

const Reports: React.FC = () => {
    const [activeUsers, setActiveUsers] = useState<
        { email: string; subscriptionDate: string; subscriptionStatus: string }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const response = await axios.get("/api/active-users");
                setActiveUsers(response.data.activeUsers);
            } catch (err) {
                setError("No User Found.");
            } finally {
                setLoading(false);
            }
        };
        fetchActiveUsers();
    }, []);

    return (
        <Container sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Active Users
            </Typography>
            {loading && <Typography>Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && Array.isArray(activeUsers) && activeUsers.length > 0 && (
    <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Subscription Date</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {activeUsers.map((user, index) => (
                    <TableRow key={index}>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>
                            {user.subscriptionDate
                                ? new Date(user.subscriptionDate).toLocaleString()
                                : "N/A"}
                        </TableCell>
                        <TableCell>{user.subscriptionStatus || "Unknown"}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)}

{!loading && !error && Array.isArray(activeUsers) && activeUsers.length === 0 && (
    <Typography>No active users found.</Typography>
)}
        </Container>
    );
};

export default Reports;
