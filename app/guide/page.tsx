"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoIcon from "@mui/icons-material/Info";
import { WEEKLY_LOTTERIES, supabase } from "@/lib/supabase";

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

export default function GuidePage() {
  const [lotteriesList, setLotteriesList] = useState(WEEKLY_LOTTERIES);

  useEffect(() => {
    async function loadGuideLotteries() {
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
          })).sort((a: any, b: any) => {
            const orderA = DAY_ORDER[a.day.toLowerCase()] || 99;
            const orderB = DAY_ORDER[b.day.toLowerCase()] || 99;
            return orderA - orderB;
          });
          setLotteriesList(mapped);
        }
      } catch (e) {
        console.warn("Guide page loading error:", e);
      }
    }
    loadGuideLotteries();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Title Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            color: "#0B3C5D",
            mb: 2,
            fontSize: { xs: "2rem", md: "2.75rem" },
          }}
        >
          Complete Kerala Lottery Guide
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#4B5563",
            maxWidth: 700,
            mx: "auto",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Your comprehensive guide to rules, schedule, prizes, verification tips, and strategies for Kerala State Lotteries.
        </Typography>
      </Box>

      {/* Grid Content */}
      <Grid container spacing={4}>
        {/* Basic Rules & Info Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              height: "100%",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#0B3C5D",
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <MenuBookIcon /> Understanding Kerala Lotteries
            </Typography>

            <Typography variant="body1" sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}>
              Established in 1967 by the Finance Department of Kerala, it is India's first and most trusted government-run lottery system. Designed to generate non-tax revenue for state development projects and provide employment to thousands of lottery agents.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1F2937", mb: 1 }}>
              Key Rules & Information:
            </Typography>
            <List>
              {[
                "Age Requirement: Participants must be 18 years of age or older.",
                "Physical Tickets: Sales are strictly physical within the state of Kerala.",
                "No Online Sales: Any online sale or digital representation is illegal and unauthorized.",
                "Non-transferable: Tickets cannot be transferred, and the original physical ticket must be produced to claim a prize.",
                "Result Gazette: The official government Gazette published by the State Lotteries Department is the final authority.",
              ].map((item, index) => (
                <ListItem key={index} disableGutters sx={{ alignItems: "flex-start", py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                    <CheckCircleIcon sx={{ color: "#0B3C5D", fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    slotProps={{ primary: { sx: { fontWeight: 600, color: "#374151" } } }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Weekly Schedule Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              height: "100%",
              bgcolor: "#F9FAFB",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#1F2937",
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <CalendarMonthIcon sx={{ color: "#0B3C5D" }} /> Weekly Lottery Schedule
            </Typography>

            <Typography variant="body1" sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}>
              A unique lottery draw takes place every day of the week. Draws are conducted live at Gorky Bhavan in Thiruvananthapuram starting around 3:00 PM.
            </Typography>

            <Grid container spacing={2}>
              {lotteriesList.map((item, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "8px",
                      bgcolor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 800 }}>
                      {item.day}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: "#111827" }}>
                      {item.name} ({item.code})
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Disclaimer Box */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 4,
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          bgcolor: "#F9FAFB",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#4B5563", mb: 1 }}>
          Disclaimer:
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6, fontStyle: "italic" }}>
          Ponkudam App does not represent any government entity. We are not affiliated with any government organization and do not facilitate government services through this app. Our source of information is publicly available data, including official government websites. Users are advised to cross-check all information, including potential winnings, with the official government gazette for confirmation. Please note, this app does not sell lottery tickets and only displays lottery-related data.
        </Typography>
      </Paper>
    </Container>
  );
}
