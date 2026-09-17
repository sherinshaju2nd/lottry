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
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import Tooltip from "@mui/material/Tooltip";
import MicIcon from "@mui/icons-material/Mic";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import PhoneIcon from "@mui/icons-material/Phone";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InsightsIcon from "@mui/icons-material/Insights";
import GetAppIcon from "@mui/icons-material/GetApp";
import GridViewIcon from "@mui/icons-material/GridView";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CheckIcon from "@mui/icons-material/Check";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import ShareIcon from "@mui/icons-material/Share";
import DescriptionIcon from "@mui/icons-material/Description";
import AiSocialDigestModal from "@/components/AiSocialDigestModal";
import {
  WEEKLY_LOTTERIES,
  BUMPER_LOTTERIES,
  ALL_LOTTERIES,
  getLotteryUrl,
  supabase,
} from "@/lib/supabase";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [digestOpen, setDigestOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [lotteriesList, setLotteriesList] = useState(ALL_LOTTERIES);
  const [uiMode, setUiMode] = useState<"normal" | "modern">("normal");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("kerala_lottery_ui_mode");
      if (saved === "normal" || saved === "modern") {
        setUiMode(saved as "normal" | "modern");
      }
    } catch {}

    const handleUiModeChange = (e: any) => {
      const mode = e?.detail?.mode || localStorage.getItem("kerala_lottery_ui_mode");
      if (mode === "normal" || mode === "modern") {
        setUiMode(mode as "normal" | "modern");
      }
    };
    window.addEventListener("kerala_ui_mode_changed", handleUiModeChange);
    return () => {
      window.removeEventListener("kerala_ui_mode_changed", handleUiModeChange);
    };
  }, []);

  const handleSelectUiMode = (mode: "normal" | "modern") => {
    setUiMode(mode);
    try {
      localStorage.setItem("kerala_lottery_ui_mode", mode);
      window.dispatchEvent(
        new CustomEvent("kerala_ui_mode_changed", { detail: { mode } })
      );
    } catch {}
  };

  const handleShareApp = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Kerala State Lottery Results Today",
          text: "Check official Kerala Lottery Live Results, archives, ticket prize checker, and winner statistics.",
          url: "https://www.keralalotteryresultstoday.in",
        });
      } catch {}
    } else {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          "Check official Kerala Lottery Live Results: https://www.keralalotteryresultstoday.in"
        )}`,
        "_blank"
      );
    }
  };

  const isLotteryPage =
    pathname === "/lotteries" ||
    pathname === "/lottery" ||
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
              alt="kerala-lottery-results-logo"
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
                bgcolor:
                  isMenuOpen || isLotteryPage ? "#EBF5FF" : "transparent",
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
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: "1px solid #F3F4F6",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#0B3C5D",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    fontSize: "0.7rem",
                  }}
                >
                  WEEKLY DRAWS (DAILY 3:00 PM)
                </Typography>
              </Box>

              {WEEKLY_LOTTERIES.map((lottery) => {
                const targetUrl = getLotteryUrl(lottery.code);
                const isActive =
                  pathname === targetUrl ||
                  pathname.startsWith(targetUrl + "/");
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
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 800 : 700,
                          color: "#111827",
                        }}
                      >
                        {lottery.name}
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", fontWeight: 600 }}
                    >
                      {lottery.day}
                    </Typography>
                  </MenuItem>
                );
              })}

              {/* 2. Bumper Lotteries */}
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: "1px solid #E5E7EB",
                  bgcolor: "#F9FAFB",
                  borderRadius: "8px",
                  mt: 1,
                  mb: 0.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#374151",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    fontSize: "0.7rem",
                  }}
                >
                  BUMPER LOTTERIES (ANNUAL)
                </Typography>
                <AutoAwesomeIcon sx={{ fontSize: 14, color: "#0B3C5D" }} />
              </Box>

              {BUMPER_LOTTERIES.map((bumper) => {
                const targetUrl = getLotteryUrl(bumper.code);
                const isActive =
                  pathname === targetUrl ||
                  pathname.startsWith(targetUrl + "/");
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
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 800 : 700,
                          color: "#111827",
                        }}
                      >
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

            {/* <Button
              onClick={() => setDigestOpen(true)}
              startIcon={<WhatsAppIcon sx={{ color: "#25D366" }} />}
              sx={{
                color: "#0B3C5D",
                fontWeight: 700,
                borderRadius: "8px",
                px: 1.8,
                bgcolor: digestOpen ? "#EBF5FF" : "transparent",
                "&:hover": { bgcolor: "#EBF5FF" },
              }}
            >
              AI Daily Status
            </Button> */}

            <Button
              component={Link}
              href="/analytics"
              startIcon={<InsightsIcon />}
              sx={{
                color: pathname === "/analytics" ? "#0B3C5D" : "#374151",
                fontWeight: pathname === "/analytics" ? 800 : 700,
                borderRadius: "8px",
                px: 2,
                bgcolor: pathname === "/analytics" ? "#EBF5FF" : "transparent",
              }}
            >
              Analytics
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
              Ticket Price Checker
            </Button>

            {/* Download App Desktop Button */}
            <Button
              component={Link}
              href="/app"
              startIcon={<GetAppIcon sx={{ fontSize: 18 }} />}
              sx={{
                background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                color: "#065F46",
                fontWeight: 800,
                fontSize: "0.85rem",
                borderRadius: "10px",
                px: 2,
                py: 0.8,
                border: "1px solid #A7F3D0",
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.15)",
                textTransform: "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                },
              }}
            >
              Install App
            </Button>

            {/* Direct Voice Search Mic */}
            <Tooltip title="Direct Voice Search (സംസാരിച്ച് പരിശോധിക്കുക)">
              <IconButton
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-ai-voice-assistant", {
                      detail: { startListening: true },
                    }),
                  );
                }}
                sx={{
                  color: "#DC2626",
                  bgcolor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  p: 1,
                  borderRadius: "10px",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "#FEE2E2", transform: "scale(1.08)" },
                }}
              >
                <MicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Mobile Right Controls: App Button & Drawer Toggle */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Button
              component={Link}
              href="/app"
              size="small"
              startIcon={<GetAppIcon sx={{ fontSize: 16 }} />}
              sx={{
                background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                color: "#065F46",
                fontWeight: 800,
                fontSize: { xs: "0.75rem", sm: "0.825rem" },
                borderRadius: "8px",
                px: { xs: 1.2, sm: 1.8 },
                py: 0.6,
                border: "1px solid #A7F3D0",
                boxShadow: "0 2px 5px rgba(16, 185, 129, 0.12)",
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
                },
              }}
            >
              Install App
            </Button>

            <IconButton
              color="inherit"
              aria-label="open navigation menu"
              onClick={handleDrawerToggle}
              sx={{
                bgcolor: "#F3F4F6",
                p: 0.9,
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                "&:hover": { bgcolor: "#E5E7EB" },
              }}
            >
              <MenuIcon sx={{ color: "#0B3C5D", fontSize: 22 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile App Style Drawer */}
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
            width: { xs: "82vw", sm: 330 },
            maxWidth: 330,
            bgcolor: "#F8FAFC",
            display: "flex",
            flexDirection: "column",
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#FAFAFA",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              component="img"
              src="/logo-round-192.png"
              alt="Kerala Lottery Logo"
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                objectFit: "contain",
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "#0B3C5D",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Kerala Lottery
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "#64748B",
                  mt: 0.2,
                }}
              >
                Official Results &amp; Live Draws
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={handleDrawerToggle}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "#F1F5F9",
              color: "#64748B",
              "&:hover": { bgcolor: "#E2E8F0", color: "#0F172A" },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Drawer Scrollable Content */}
        <Box sx={{ p: 1.75, pb: 4, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Section 1: UI Theme & Layout */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #F1F5F9",
              p: 1.5,
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#94A3B8",
                letterSpacing: "0.08em",
                display: "block",
                mb: 1,
              }}
            >
              APP UI THEME &amp; LAYOUT
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              {/* Normal UI */}
              <Box
                onClick={() => handleSelectUiMode("normal")}
                sx={{
                  p: 1.2,
                  borderRadius: "12px",
                  border: "1.5px solid",
                  borderColor: uiMode === "normal" ? "#0B3C5D" : "#E2E8F0",
                  bgcolor: uiMode === "normal" ? "#EFF6FF" : "#F8FAFC",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": { bgcolor: "#EFF6FF" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.6 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      bgcolor: uiMode === "normal" ? "#DBEAFE" : "#FFFFFF",
                      border: "1px solid",
                      borderColor: uiMode === "normal" ? "#BFDBFE" : "#E2E8F0",
                      color: uiMode === "normal" ? "#0B3C5D" : "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GridViewIcon sx={{ fontSize: 15 }} />
                  </Box>
                  {uiMode === "normal" && (
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "#0B3C5D",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 12, strokeWidth: 2 }} />
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: uiMode === "normal" ? 800 : 700,
                    color: uiMode === "normal" ? "#0B3C5D" : "#334155",
                  }}
                >
                  Normal UI
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B", mt: 0.2 }}>
                  2-Column Grid
                </Typography>
              </Box>

              {/* Modern UI */}
              <Box
                onClick={() => handleSelectUiMode("modern")}
                sx={{
                  p: 1.2,
                  borderRadius: "12px",
                  border: "1.5px solid",
                  borderColor: uiMode === "modern" ? "#0B3C5D" : "#E2E8F0",
                  bgcolor: uiMode === "modern" ? "#EFF6FF" : "#F8FAFC",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": { bgcolor: "#EFF6FF" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.6 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      bgcolor: uiMode === "modern" ? "#DBEAFE" : "#FFFFFF",
                      border: "1px solid",
                      borderColor: uiMode === "modern" ? "#BFDBFE" : "#E2E8F0",
                      color: uiMode === "modern" ? "#0B3C5D" : "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DashboardIcon sx={{ fontSize: 15 }} />
                  </Box>
                  {uiMode === "modern" && (
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "#0B3C5D",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 12, strokeWidth: 2 }} />
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: uiMode === "modern" ? 800 : 700,
                    color: uiMode === "modern" ? "#0B3C5D" : "#334155",
                  }}
                >
                  Modern UI
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B", mt: 0.2 }}>
                  Live Dashboard
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Section 2: Navigation Menu */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #F1F5F9",
              p: 1,
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#94A3B8",
                letterSpacing: "0.08em",
                display: "block",
                px: 1,
                pt: 0.5,
                mb: 0.5,
              }}
            >
              NAVIGATION MENU
            </Typography>

            {/* Home */}
            <Box
              component={Link}
              href="/"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: "#0B3C5D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HomeIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: pathname === "/" ? 800 : 700, color: pathname === "/" ? "#0B3C5D" : "#0F172A" }}>
                  Home
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Today&apos;s results &amp; updates
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* Lotteries */}
            <Box
              component={Link}
              href="/lotteries"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/lotteries" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ConfirmationNumberIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: pathname === "/lotteries" ? 800 : 700, color: pathname === "/lotteries" ? "#0B3C5D" : "#0F172A" }}>
                  Kerala Lotteries
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Weekly &amp; Bumper schedules
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* Ticket Checker */}
            <Box
              component={Link}
              href="/search"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/search" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SearchIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: pathname === "/search" ? 800 : 700, color: pathname === "/search" ? "#0B3C5D" : "#0F172A" }}>
                  Ticket Checker
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Instant winner search &amp; scan
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* Analytics */}
            <Box
              component={Link}
              href="/analytics"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/analytics" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#FAF5FF",
                  border: "1px solid #E9D5FF",
                  color: "#9333EA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InsightsIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: pathname === "/analytics" ? 800 : 700, color: pathname === "/analytics" ? "#0B3C5D" : "#0F172A" }}>
                  Analytics &amp; Trends
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  District leaderboard &amp; statistics
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>
          </Box>

          {/* Section 3: Guides & Resources */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #F1F5F9",
              p: 1,
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#94A3B8",
                letterSpacing: "0.08em",
                display: "block",
                px: 1,
                pt: 0.5,
                mb: 0.5,
              }}
            >
              GUIDES &amp; RESOURCES
            </Typography>

            {/* Prize Claim */}
            <Box
              component={Link}
              href="/claim"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/claim" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                  Prize Claim Guide
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Claim procedure &amp; required documents
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* Lottery Guide */}
            <Box
              component={Link}
              href="/guide"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/guide" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#FAF5FF",
                  border: "1px solid #E9D5FF",
                  color: "#9333EA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MenuBookIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                  Lottery Guide
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Draw rules, timings &amp; verification
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* FAQ */}
            <Box
              component={Link}
              href="/faq"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/faq" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HelpOutlineIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                  FAQ (പതിവ് ചോദ്യങ്ങൾ)
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Frequently asked questions &amp; answers
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>
          </Box>

          {/* Section 4: Support & Legal */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #F1F5F9",
              p: 1,
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#94A3B8",
                letterSpacing: "0.08em",
                display: "block",
                px: 1,
                pt: 0.5,
                mb: 0.5,
              }}
            >
              SUPPORT &amp; LEGAL
            </Typography>

            {/* Contact */}
            <Box
              component={Link}
              href="/contact"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/contact" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#ECFEFF",
                  border: "1px solid #A5F3FC",
                  color: "#0891B2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PhoneIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                  Contact Us
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Official Directorate helpline contacts
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* Terms */}
            <Box
              component={Link}
              href="/terms-conditions"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/terms-conditions" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DescriptionIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                  Terms &amp; Conditions
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Terms of use &amp; policies
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* Privacy */}
            <Box
              component={Link}
              href="/privacy-policy"
              onClick={handleDrawerToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                textDecoration: "none",
                bgcolor: pathname === "/privacy-policy" ? "#EFF6FF" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SecurityIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                  Privacy Policy
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Privacy policy &amp; security
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>

            {/* Share Web App */}
            <Box
              onClick={() => {
                handleDrawerToggle();
                handleShareApp();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShareIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                  Share App
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                  Share with friends &amp; family
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
            </Box>
          </Box>

          {/* Drawer Footer */}
          <Box sx={{ px: 1, py: 1.5, textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mb: 0.5 }}>
              <SecurityIcon sx={{ fontSize: 14, color: "#64748B" }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>
                Kerala Lottery Results
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", lineHeight: 1.4 }}>
              Data computed purely from official past draw records. 100% independent.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* AI Daily WhatsApp Status & Telegram Digest Modal */}
      <AiSocialDigestModal
        open={digestOpen}
        onClose={() => setDigestOpen(false)}
      />
    </AppBar>
  );
}
