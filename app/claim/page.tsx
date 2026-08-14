"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningIcon from "@mui/icons-material/Warning";
import FeedIcon from "@mui/icons-material/Feed";

export default function ClaimPage() {
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
          How to Claim Kerala Lottery Prize
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
          Detailed guide on claiming prize money for weekly and bumper Kerala State lotteries depending on the winning amount.
        </Typography>
      </Box>

      {/* Main Grid Content */}
      <Grid container spacing={4}>
        {/* Left Side: Claim Process by Prize Amount */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {/* Prizes Less than 5000 */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#059669",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <AccountBalanceWalletIcon /> Prize Less than ₹5,000
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#374151", pl: 4, lineHeight: 1.6 }}>
                Prize winner can directly collect the prize amount from any authorized lottery agency or retailer in Kerala.
              </Typography>
            </Box>

            {/* Prizes Between 5000 and 1 Lakh */}
            <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 3.5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#0B3C5D",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <ReceiptLongIcon /> Prize Between ₹5,000 and ₹1 Lakh
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#374151", pl: 4, lineHeight: 1.6 }}>
                Prize winner shall surrender the winning ticket within a month (30 days) of the draw before the District Lottery Officer.
              </Typography>
            </Box>

            {/* Prizes Above 1 Lakh */}
            <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 3.5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#D97706",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <InfoIcon sx={{ color: "#D97706" }} /> Prize Above ₹1 Lakh
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#374151", pl: 4, lineHeight: 1.6 }}>
                Winner should surrender the winning ticket with all necessary documents before the Director of State Lotteries or Nationalised / Scheduled banks within 30 days of the draw.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Documents Required & Tax/Reminders */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Documents Required */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#1F2937",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <FeedIcon sx={{ color: "#0B3C5D" }} /> Documents Required
              </Typography>
              <List>
                {[
                  "Claim Application form",
                  "Self-attested photostat copy of the winning ticket (both sides)",
                  "Two passport size photos of the winner attested by a Gazetted Officer or Notary",
                  "A receipt for the prize money with a revenue stamp affixed",
                  "Self-attested copy of the PAN Card",
                  "Attested identity proof document (Ration Card / Driving License / Passport / Election ID Card)",
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

            {/* Tax Deductions */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                bgcolor: "#F9FAFB",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#1F2937",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <InfoIcon sx={{ color: "#4B5563" }} /> Tax Deductions & Commissions
              </Typography>
              <List>
                {[
                  "30% flat income tax deduction on the total prize amount (for winnings above ₹10,000)",
                  "10% agent commission is deducted from the total prize amount",
                  "The net prize amount will be paid to the winner after these mandatory deductions",
                ].map((item, index) => (
                  <ListItem key={index} disableGutters sx={{ alignItems: "flex-start", py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                      <CheckCircleIcon sx={{ color: "#4B5563", fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      slotProps={{ primary: { sx: { fontWeight: 600, color: "#4B5563" } } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Important Reminders */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "16px",
                border: "1px solid #FEE2E2",
                bgcolor: "#FEF2F2",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#DC2626",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <WarningIcon /> Important Reminders
              </Typography>
              <List>
                {[
                  "Always verify your ticket with the official Kerala Lottery website",
                  "Keep your winning ticket safe and in good condition",
                  "Damaged or torn tickets may not be accepted for claim processing",
                  "Claim prizes only from authorized sources and official offices",
                ].map((item, index) => (
                  <ListItem key={index} disableGutters sx={{ alignItems: "flex-start", py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                      <CheckCircleIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      slotProps={{ primary: { sx: { fontWeight: 600, color: "#991B1B" } } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
