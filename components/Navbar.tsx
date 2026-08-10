"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", href: "/", icon: <HomeIcon /> },
    {
      label: "Weekly Schedule",
      href: "/#schedule",
      icon: <CalendarMonthIcon />,
    },
    { label: "Ticket Checker", href: "/search", icon: <SearchIcon /> },
  ];

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        zIndex: 1100,
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo & Brand Name */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                bgcolor: "#0F5A24",
                color: "white",
                p: 0.8,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(15,90,36,0.25)",
              }}
            >
              <ConfirmationNumberIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: "#0F5A24",
                  lineHeight: 1.1,
                  fontSize: { xs: "1.05rem", sm: "1.25rem" },
                }}
              >
                Kerala Lottery Result Today
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Live Results & Weekly Schedule
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation Links */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              component={Link}
              href="/"
              sx={{
                color: pathname === "/" ? "#0F5A24" : "#374151",
                fontWeight: pathname === "/" ? 800 : 600,
                borderRadius: "8px",
                px: 2,
              }}
            >
              Home
            </Button>
            <Button
              component={Link}
              href="/#schedule"
              sx={{
                color: "#374151",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
              }}
            >
              Schedule
            </Button>
            <Button
              component={Link}
              href="/search"
              startIcon={<SearchIcon />}
              sx={{
                color: "#0F5A24",
                fontWeight: 700,
                borderRadius: "8px",
                px: 2,
                bgcolor: pathname === "/search" ? "#E8F5E9" : "transparent",
              }}
            >
              Winning Ticket Checker
            </Button>
          </Box>

          {/* Mobile Menu Toggle Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { md: "none" },
              bgcolor: "#F3F4F6",
              p: 1,
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
            }}
          >
            <MenuIcon sx={{ color: "#0F5A24" }} />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Modern Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: { xs: 290, sm: 320 },
            bgcolor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box>
          {/* Drawer Header with Branding & Close Button */}
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#F9FAFB",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  bgcolor: "#0F5A24",
                  color: "#FFFFFF",
                  p: 0.75,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ConfirmationNumberIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    color: "#0F5A24",
                    lineHeight: 1.1,
                    fontSize: "0.95rem",
                  }}
                >
                  Kerala Lottery
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.7rem" }}
                >
                  Result & Checker
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={handleDrawerToggle}
              size="small"
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                "&:hover": { bgcolor: "#F3F4F6" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider />

          {/* Navigation List */}
          <Box sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#9CA3AF",
                fontWeight: 700,
                px: 1.5,
                mb: 1,
                display: "block",
                letterSpacing: "0.05em",
              }}
            >
              NAVIGATION MENU
            </Typography>
            <List disablePadding>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={handleDrawerToggle}
                      sx={{
                        borderRadius: "12px",
                        py: 1.25,
                        px: 1.5,
                        bgcolor: isActive ? "#E8F5E9" : "transparent",
                        color: isActive ? "#0F5A24" : "#374151",
                        borderLeft: isActive
                          ? "4px solid #0F5A24"
                          : "4px solid transparent",
                        "&:hover": {
                          bgcolor: isActive ? "#E8F5E9" : "#F9FAFB",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? "#0F5A24" : "#6B7280",
                          minWidth: 38,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: isActive ? 800 : 600,
                              fontSize: "0.925rem",
                            },
                          },
                        }}
                      />
                      <ChevronRightIcon
                        fontSize="small"
                        sx={{ color: isActive ? "#0F5A24" : "#D1D5DB" }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>

        {/* Drawer Footer Badge & Quick Action */}
        <Box
          sx={{ p: 2.5, bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}
        >
          <Button
            component={Link}
            href="/search"
            onClick={handleDrawerToggle}
            variant="contained"
            fullWidth
            startIcon={<SearchIcon />}
            sx={{
              bgcolor: "#0F5A24",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "10px",
              py: 1.2,
              fontSize: "0.875rem",
              boxShadow: "0 4px 12px rgba(15,90,36,0.2)",
              "&:hover": { bgcolor: "#15803D" },
            }}
          >
            Check Ticket Result
          </Button>

          <Typography
            variant="caption"
            sx={{
              color: "#9CA3AF",
              textAlign: "center",
              display: "block",
              mt: 2,
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            © {new Date().getFullYear()} Kerala State Lottery Results
          </Typography>
        </Box>
      </Drawer>
    </AppBar>
  );
}
