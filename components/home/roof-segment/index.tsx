"use client";
import { Box, Card, CardContent, Typography } from "@mui/material";

const RoofSegmentCard = ({ pitch, areaInSqFt, percentage }: any) => {
  return (
    <Card
      sx={{
        width: 200,
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#d1ecf1", // light blue background
          color: "#000", // black text
          padding: "8px 0",
        }}
      >
        <Typography fontWeight="bold">{pitch}</Typography>
      </Box>
      <CardContent>
        <Typography variant="body1" color="textPrimary" fontWeight="bold">
          {areaInSqFt} sq ft
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {percentage}%
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RoofSegmentCard;
