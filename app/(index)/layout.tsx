"use client";
import { Box } from "@mui/material";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Box className="bg-theme bg-fixed" sx={{ display: "flex", width: "100%" }}>
        {children}
    </Box>
  );
}
