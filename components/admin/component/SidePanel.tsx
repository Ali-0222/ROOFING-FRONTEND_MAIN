"use client";

import * as React from "react";
import { extendTheme } from "@mui/material/styles";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LayersIcon from "@mui/icons-material/Layers";
import ArticleIcon from "@mui/icons-material/Article";
import LogoutIcon from "@mui/icons-material/Logout";
import { AppProvider, NavigationItem } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PrivateAdminRoute from "@/components/common/private-route/AdminPrivateRoute";

const NAVIGATION: NavigationItem[] = [
  {
    kind: "page",
    title: "Roof Types",
    segment: "admin/roof-types",
    icon: <CategoryIcon /> as React.ReactNode,
  },
  {
    kind: "page",
    title: "Materials",
    segment: "admin/materials",
    icon: <ArticleIcon /> as React.ReactNode,
  },
  {
    kind: "page",
    title: "Price Points",
    segment: "admin/price-point",
    icon: <AttachMoneyIcon /> as React.ReactNode,
  },
  {
    kind: "page",
    title: "Waste Tiers",
    segment: "admin/waste-tiers",
    icon: <LayersIcon /> as React.ReactNode,
  },
  {
    kind: "page",
    title: "User Management",
    segment: "admin/reports",
    icon: <ArticleIcon /> as React.ReactNode,
  },
];

const demoTheme = extendTheme({
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: "class",
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter() {
  const router = useRouter();
  const pathname = usePathname(); 

  return {
    pathname,
    searchParams: new URLSearchParams(),
    navigate: async (url: string | URL) => {
      if (typeof url === "string") {
        router.push(url);
        return true;
      }
      return false;
    },
  };
}

function SidebarFooter() {
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('email'); 
    window.location.href = '/login';
  };

  return (
    <Box
      sx={{
        mt: "auto",
        textAlign: "center",
        py: 2,
        bgcolor: "background.default",
      }}
    >
      <Divider sx={{ my: 2 }} />
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Log Out" />
      </ListItemButton>
    </Box>
  );
}

export default function DashboardLayoutBasic({ children }: { children: React.ReactNode }) {
  const router = useDemoRouter(); 

  return (
    <PrivateAdminRoute>
    <AppProvider
      navigation={NAVIGATION}
      branding={{
        title: "RoofingAI",
      }}
      router={router}
      theme={demoTheme}
      window={undefined}
    >
      <DashboardLayout
        slots={{
          sidebarFooter: SidebarFooter,
        }}
      >
        {children}
      </DashboardLayout>
    </AppProvider>
    </PrivateAdminRoute>
  );
}
