"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Weekly Schedule", href: "/#schedule" },
    { label: "Search Ticket", href: "/search" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: "1px solid #E5E7EB", bgcolor: "#FFFFFF" }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo & Title */}
          <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none", color: "inherit" }}>
            <Box
              sx={{
                bgcolor: "#2E7D32",
                color: "white",
                p: 0.8,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ConfirmationNumberIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#1B5E20", lineHeight: 1.1 }}>
                Kerala Lottery
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, fontSize: "0.7rem" }}>
                Official Results & Schedule
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Button component={Link} href="/" sx={{ color: "#374151", fontWeight: 600, borderRadius: "4px" }}>
              Home
            </Button>
            <Button component={Link} href="/#schedule" sx={{ color: "#374151", fontWeight: 600, borderRadius: "4px" }}>
              Schedule
            </Button>
            <Button
              component={Link}
              href="/search"
              startIcon={<SearchIcon />}
              sx={{ color: "#2E7D32", fontWeight: 700, borderRadius: "4px" }}
            >
              Advanced Search
            </Button>
            <Button
              component={Link}
              href="/admin"
              variant="outlined"
              color="primary"
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ ml: 1, borderRadius: "4px" }}
            >
              Admin
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#2E7D32", mb: 2 }}>
            Kerala Lottery
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton component={Link} href={item.href} sx={{ textAlign: "center" }}>
                  <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
