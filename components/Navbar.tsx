"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import PaidIcon from "@mui/icons-material/Paid";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HelpIcon from "@mui/icons-material/Help";
import PhoneIcon from "@mui/icons-material/Phone";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  ALL_LOTTERIES,
  getLotteryUrl,
  supabase,
} from "@/lib/supabase";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [lotteriesList, setLotteriesList] = useState(ALL_LOTTERIES);

  const isLotteryPage =
    ALL_LOTTERIES.some((l) => pathname.startsWith(getLotteryUrl(l.code))) ||
    pathname.startsWith("/lottery/");

  React.useEffect(() => {
    async function loadNavbarLotteries() {
      try {
        const { data, error } = await supabase
          .from("lotteries")
          .select("*")
          .order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            day: d.day,
            name: d.name,
            nameMl: d.name_ml || d.name,
            code: d.code,
            drawTime: d.draw_time || "3:00 PM",
            is_bumper: d.is_bumper ?? false,
          }));
          setLotteriesList(mapped);
        }
      } catch (e) {
        console.warn("Navbar loading error:", e);
      }
    }
    loadNavbarLotteries();
  }, []);

  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLotterySelect = (code: string) => {
    handleMenuClose();
    setMobileOpen(false);
    router.push(getLotteryUrl(code));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              component="img"
              src="/logo-round-192.png"
              alt="Kerala Lottery Logo"
              sx={{
                width: 73,
                height: 75,
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(15,90,36,0.3)",
                objectFit: "contain",
              }}
            />
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
              startIcon={<HomeIcon />}
              sx={{
                color: pathname === "/" ? "#0B3C5D" : "#374151",
                fontWeight: pathname === "/" ? 800 : 600,
                borderRadius: "8px",
                px: 2,
              }}
            >
              Home
            </Button>

            {/* Submenu Dropdown Button for Kerala Lotteries */}
            <Button
              onClick={handleMenuClick}
              endIcon={<KeyboardArrowDownIcon />}
              startIcon={<LocalActivityIcon />}
              sx={{
                color: isLotteryPage ? "#0B3C5D" : "#374151",
                fontWeight: isLotteryPage ? 800 : 700,
                borderRadius: "8px",
                px: 2,
                bgcolor: isMenuOpen || isLotteryPage ? "#EBF5FF" : "transparent",
              }}
            >
              Kerala Lotteries
            </Button>

            {/* Desktop Popover Menu for Lotteries */}
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: "14px",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    border: "1px solid #E5E7EB",
                    minWidth: 320,
                    maxWidth: 380,
                    p: 1,
                    maxHeight: 520,
                  },
                },
              }}
            >
              {/* 1. Weekly Lotteries */}
              <Box sx={{ px: 1.5, py: 0.75, borderBottom: "1px solid #F3F4F6", mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "#0B3C5D", fontWeight: 800, letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                  WEEKLY DRAWS (DAILY 3:00 PM)
                </Typography>
              </Box>

              {WEEKLY_LOTTERIES.map((lottery) => {
                const targetUrl = getLotteryUrl(lottery.code);
                const isActive = pathname === targetUrl || pathname.startsWith(targetUrl + "/");
                return (
                  <MenuItem
                    key={lottery.code}
                    component={Link}
                    href={targetUrl}
                    onClick={handleMenuClose}
                    sx={{
                      borderRadius: "8px",
                      py: 0.75,
                      px: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textDecoration: "none",
                      color: "inherit",
                      bgcolor: isActive ? "#EBF5FF" : "transparent",
                      "&:hover": { bgcolor: "#F0F7FF" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={lottery.code}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: isActive ? "#0B3C5D" : "#E0F2FE",
                          color: isActive ? "#FFFFFF" : "#0369A1",
                          fontSize: "0.725rem",
                          height: 20,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: isActive ? 800 : 700, color: "#111827" }}>
                        {lottery.name}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                      {lottery.day}
                    </Typography>
                  </MenuItem>
                );
              })}

              {/* 2. Bumper Lotteries */}
              <Box sx={{ px: 1.5, py: 0.75, borderBottom: "1px solid #E5E7EB", bgcolor: "#F9FAFB", borderRadius: "8px", mt: 1, mb: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "#374151", fontWeight: 800, letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                  BUMPER LOTTERIES (ANNUAL)
                </Typography>
                <AutoAwesomeIcon sx={{ fontSize: 14, color: "#0B3C5D" }} />
              </Box>

              {BUMPER_LOTTERIES.map((bumper) => {
                const targetUrl = getLotteryUrl(bumper.code);
                const isActive = pathname === targetUrl || pathname.startsWith(targetUrl + "/");
                return (
                  <MenuItem
                    key={bumper.code}
                    component={Link}
                    href={targetUrl}
                    onClick={handleMenuClose}
                    sx={{
                      borderRadius: "8px",
                      py: 0.75,
                      px: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textDecoration: "none",
                      color: "inherit",
                      bgcolor: isActive ? "#EBF5FF" : "transparent",
                      "&:hover": { bgcolor: "#F0F7FF" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={bumper.code}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: isActive ? "#0B3C5D" : "#E0F2FE",
                          color: isActive ? "#FFFFFF" : "#0369A1",
                          fontSize: "0.725rem",
                          height: 20,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: isActive ? 800 : 700, color: "#111827" }}>
                        {bumper.name}
                      </Typography>
                    </Box>

                    <Chip
                      label={bumper.jackpot}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: "#EBF5FF",
                        color: "#0B3C5D",
                        fontSize: "0.68rem",
                        height: 18,
                      }}
                    />
                  </MenuItem>
                );
              })}
            </Menu>

            <Button
              component={Link}
              href="/claim"
              startIcon={<PaidIcon />}
              sx={{
                color: pathname === "/claim" ? "#0B3C5D" : "#374151",
                fontWeight: pathname === "/claim" ? 800 : 600,
                borderRadius: "8px",
                px: 2,
                bgcolor: pathname === "/claim" ? "#EBF5FF" : "transparent",
              }}
            >
              Claim
            </Button>

            <Button
              component={Link}
              href="/guide"
              startIcon={<MenuBookIcon />}
              sx={{
                color: pathname === "/guide" ? "#0B3C5D" : "#374151",
                fontWeight: pathname === "/guide" ? 800 : 600,
                borderRadius: "8px",
                px: 2,
                bgcolor: pathname === "/guide" ? "#EBF5FF" : "transparent",
              }}
            >
              Guide
            </Button>

            <Button
              component={Link}
              href="/faq"
              startIcon={<HelpIcon />}
              sx={{
                color: pathname === "/faq" ? "#0B3C5D" : "#374151",
                fontWeight: pathname === "/faq" ? 800 : 600,
                borderRadius: "8px",
                px: 2,
                bgcolor: pathname === "/faq" ? "#EBF5FF" : "transparent",
              }}
            >
              FAQ
            </Button>

            <Button
              component={Link}
              href="/contact"
              startIcon={<PhoneIcon />}
              sx={{
                color: pathname === "/contact" ? "#0B3C5D" : "#374151",
                fontWeight: pathname === "/contact" ? 800 : 600,
                borderRadius: "8px",
                px: 2,
                bgcolor: pathname === "/contact" ? "#EBF5FF" : "transparent",
              }}
            >
              Contact
            </Button>

            <Button
              component={Link}
              href="/search"
              startIcon={<SearchIcon />}
              sx={{
                color: "#0B3C5D",
                fontWeight: 700,
                borderRadius: "8px",
                px: 2,
                bgcolor: pathname === "/search" ? "#EBF5FF" : "transparent",
              }}
            >
              Winning Ticket Checker
            </Button>
          </Box>

          {/* Mobile Right Controls: Mobile Drawer Toggle */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                bgcolor: "#F3F4F6",
                p: 1,
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
              }}
            >
              <MenuIcon sx={{ color: "#0B3C5D" }} />
            </IconButton>
          </Box>
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src="/logo-round-192.png"
                alt="Kerala Lottery Logo"
                sx={{
                  width: 73,
                  height: 75,
                  borderRadius: "50%",
                  objectFit: "contain",
                }}
              />
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
              {/* Home */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href="/"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: "12px",
                    py: 1.25,
                    px: 1.5,
                    bgcolor: pathname === "/" ? "#EBF5FF" : "transparent",
                    color: pathname === "/" ? "#0B3C5D" : "#374151",
                  }}
                >
                  <ListItemIcon sx={{ color: pathname === "/" ? "#0B3C5D" : "#6B7280", minWidth: 38 }}>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Home" slotProps={{ primary: { sx: { fontWeight: pathname === "/" ? 800 : 600 } } }} />
                </ListItemButton>
              </ListItem>

              {/* Expandable Kerala Lotteries Submenu */}
              <ListItem disablePadding sx={{ mb: 1, flexDirection: "column", alignItems: "stretch" }}>
                <ListItemButton
                  onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                  sx={{
                    borderRadius: "12px",
                    py: 1.25,
                    px: 1.5,
                    bgcolor: isLotteryPage ? "#EBF5FF" : "#F9FAFB",
                    color: isLotteryPage ? "#0B3C5D" : "#374151",
                  }}
                >
                  <ListItemIcon sx={{ color: "#0B3C5D", minWidth: 38 }}>
                    <LocalActivityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Kerala Lotteries" slotProps={{ primary: { sx: { fontWeight: 800, fontSize: "0.925rem" } } }} />
                  {mobileSubmenuOpen ? <ExpandLess sx={{ color: "#0B3C5D" }} /> : <ExpandMore sx={{ color: "#6B7280" }} />}
                </ListItemButton>

                <Collapse in={mobileSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 1, pr: 1, pt: 1 }}>
                    <Typography variant="caption" sx={{ px: 1, color: "#0B3C5D", fontWeight: 800, fontSize: "0.68rem" }}>
                       WEEKLY LOTTERIES
                    </Typography>
                    {WEEKLY_LOTTERIES.map((lottery) => {
                      const targetUrl = getLotteryUrl(lottery.code);
                      const isActive = pathname === targetUrl || pathname.startsWith(targetUrl + "/");
                      return (
                        <ListItemButton
                          key={lottery.code}
                          onClick={() => handleLotterySelect(lottery.code)}
                          sx={{
                            borderRadius: "8px",
                            py: 0.75,
                            mb: 0.5,
                            px: 1.5,
                            bgcolor: isActive ? "#EBF5FF" : "transparent",
                          }}
                        >
                          <Chip
                            label={lottery.code}
                            size="small"
                            sx={{
                              mr: 1.5,
                              fontWeight: 800,
                              bgcolor: isActive ? "#0B3C5D" : "#E0F2FE",
                              color: isActive ? "#FFFFFF" : "#0369A1",
                              height: 20,
                              fontSize: "0.7rem",
                            }}
                          />
                          <ListItemText
                            primary={lottery.name}
                            secondary={lottery.day}
                            slotProps={{
                              primary: { sx: { fontWeight: isActive ? 800 : 600, fontSize: "0.85rem", color: isActive ? "#0B3C5D" : "#111827" } },
                              secondary: { sx: { fontSize: "0.7rem" } },
                            }}
                          />
                        </ListItemButton>
                      );
                    })}

                    <Box sx={{ mt: 1, mb: 0.5, px: 1, py: 0.5, bgcolor: "#F3F4F6", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#374151", fontWeight: 800, fontSize: "0.68rem" }}>
                        BUMPER LOTTERIES
                      </Typography>
                      <AutoAwesomeIcon sx={{ fontSize: 12, color: "#0B3C5D" }} />
                    </Box>

                    {BUMPER_LOTTERIES.map((bumper) => {
                      const targetUrl = getLotteryUrl(bumper.code);
                      const isActive = pathname === targetUrl || pathname.startsWith(targetUrl + "/");
                      return (
                        <ListItemButton
                          key={bumper.code}
                          onClick={() => handleLotterySelect(bumper.code)}
                          sx={{
                            borderRadius: "8px",
                            py: 0.75,
                            mb: 0.5,
                            px: 1.5,
                            bgcolor: isActive ? "#EBF5FF" : "transparent",
                          }}
                        >
                          <Chip
                            label={bumper.code}
                            size="small"
                            sx={{
                              mr: 1.5,
                              fontWeight: 800,
                              bgcolor: isActive ? "#0B3C5D" : "#E0F2FE",
                              color: isActive ? "#FFFFFF" : "#0369A1",
                              height: 20,
                              fontSize: "0.7rem",
                            }}
                          />
                          <ListItemText
                            primary={bumper.name}
                            secondary={`${bumper.jackpot} • ${bumper.draw_season}`}
                            slotProps={{
                              primary: { sx: { fontWeight: isActive ? 800 : 600, fontSize: "0.85rem", color: isActive ? "#0B3C5D" : "#111827" } },
                              secondary: { sx: { fontSize: "0.7rem", color: "#6B7280", fontWeight: 600 } },
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </ListItem>

              {/* Claim */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href="/claim"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: "12px",
                    py: 1.25,
                    px: 1.5,
                    bgcolor: pathname === "/claim" ? "#EBF5FF" : "transparent",
                    color: pathname === "/claim" ? "#0B3C5D" : "#374151",
                  }}
                >
                  <ListItemIcon sx={{ color: pathname === "/claim" ? "#0B3C5D" : "#6B7280", minWidth: 38 }}>
                    <PaidIcon />
                  </ListItemIcon>
                  <ListItemText primary="Claim" slotProps={{ primary: { sx: { fontWeight: pathname === "/claim" ? 800 : 600 } } }} />
                </ListItemButton>
              </ListItem>

              {/* Guide */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href="/guide"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: "12px",
                    py: 1.25,
                    px: 1.5,
                    bgcolor: pathname === "/guide" ? "#EBF5FF" : "transparent",
                    color: pathname === "/guide" ? "#0B3C5D" : "#374151",
                  }}
                >
                  <ListItemIcon sx={{ color: pathname === "/guide" ? "#0B3C5D" : "#6B7280", minWidth: 38 }}>
                    <MenuBookIcon />
                  </ListItemIcon>
                  <ListItemText primary="Guide" slotProps={{ primary: { sx: { fontWeight: pathname === "/guide" ? 800 : 600 } } }} />
                </ListItemButton>
              </ListItem>

              {/* FAQ */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href="/faq"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: "12px",
                    py: 1.25,
                    px: 1.5,
                    bgcolor: pathname === "/faq" ? "#EBF5FF" : "transparent",
                    color: pathname === "/faq" ? "#0B3C5D" : "#374151",
                  }}
                >
                  <ListItemIcon sx={{ color: pathname === "/faq" ? "#0B3C5D" : "#6B7280", minWidth: 38 }}>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary="FAQ" slotProps={{ primary: { sx: { fontWeight: pathname === "/faq" ? 800 : 600 } } }} />
                </ListItemButton>
              </ListItem>

              {/* Contact */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href="/contact"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: "12px",
                    py: 1.25,
                    px: 1.5,
                    bgcolor: pathname === "/contact" ? "#EBF5FF" : "transparent",
                    color: pathname === "/contact" ? "#0B3C5D" : "#374151",
                  }}
                >
                  <ListItemIcon sx={{ color: pathname === "/contact" ? "#0B3C5D" : "#6B7280", minWidth: 38 }}>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Contact Us" slotProps={{ primary: { sx: { fontWeight: pathname === "/contact" ? 800 : 600 } } }} />
                </ListItemButton>
              </ListItem>

              {/* Ticket Checker */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href="/search"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: "12px",
                    py: 1.25,
                    px: 1.5,
                    bgcolor: pathname === "/search" ? "#EBF5FF" : "transparent",
                    color: pathname === "/search" ? "#0B3C5D" : "#374151",
                  }}
                >
                  <ListItemIcon sx={{ color: pathname === "/search" ? "#0B3C5D" : "#6B7280", minWidth: 38 }}>
                    <SearchIcon />
                  </ListItemIcon>
                  <ListItemText primary="Ticket Checker" slotProps={{ primary: { sx: { fontWeight: pathname === "/search" ? 800 : 600 } } }} />
                </ListItemButton>
              </ListItem>
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
              bgcolor: "#0B3C5D",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "10px",
              py: 1.2,
              fontSize: "0.875rem",
              boxShadow: "0 4px 12px rgba(11,60,93,0.2)",
              "&:hover": { bgcolor: "#0F2C59" },
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
