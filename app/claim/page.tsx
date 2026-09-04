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
import StorefrontIcon from "@mui/icons-material/Storefront";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import AiClaimCalculator from "@/components/AiClaimCalculator";

export default function ClaimPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      {/* Title Header */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            color: "#0B3C5D",
            mb: 2,
            fontSize: { xs: "1.85rem", sm: "2.5rem", md: "2.75rem" },
          }}
        >
          How to Claim Kerala Lottery Prize
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#4B5563",
            maxWidth: 750,
            mx: "auto",
            fontWeight: 500,
            lineHeight: 1.6,
            fontSize: { xs: "0.95rem", sm: "1.1rem" },
          }}
        >
          Official step-by-step procedure for verifying tickets, calculating TDS taxes, and claiming weekly and bumper prize winnings from the Directorate of Kerala State Lotteries.
        </Typography>
      </Box>

      {/* Kerala Lottery Ticket Purchasing Guidelines & Anti-Fraud Notice */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 5,
          borderRadius: "16px",
          bgcolor: "#FEF2F2",
          border: "1px solid #FECACA",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <SecurityIcon sx={{ color: "#DC2626", fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#991B1B" }}>
            Kerala Lottery Ticket Purchasing Guidelines
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#7F1D1D", mb: 2, fontWeight: 500 }}>
          Important safety rules regarding purchasing authentic paper lottery tickets:
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", bgcolor: "#FFFFFF", border: "1px solid #FCA5A5", height: "100%" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#991B1B", mb: 0.5 }}>
                🚫 No Online Sales
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", lineHeight: 1.6 }}>
                The Government of Kerala strictly does <strong>NOT</strong> sell lottery tickets online.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", bgcolor: "#FFFFFF", border: "1px solid #FCA5A5", height: "100%" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#991B1B", mb: 0.5 }}>
                ⚠️ Beware of Frauds
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", lineHeight: 1.6 }}>
                Websites or mobile apps offering digital sales of Kerala lotteries or &quot;Dear Lottery&quot; charts are unauthorized financial scams.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", bgcolor: "#FFFFFF", border: "1px solid #FCA5A5", height: "100%" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#991B1B", mb: 0.5 }}>
                🎟️ Buy Offline Only
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", lineHeight: 1.6 }}>
                Always purchase physical paper tickets from government-authorized offline retail agents. The official ticket price is ₹50 per weekly draw ticket.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Interactive AI Tax & Prize Claim Calculator */}
      <AiClaimCalculator />

      {/* Main Grid Content */}
      <Grid container spacing={4}>
        {/* Left Side: Claim Process by Prize Amount */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 3.5,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#0B3C5D",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <GavelIcon sx={{ color: "#0B3C5D" }} /> How to Claim Your Prize Money
              </Typography>
              <Typography variant="body2" sx={{ color: "#4B5563", lineHeight: 1.65 }}>
                Winnings must be officially claimed within <strong>90 days</strong> from the draw date. Sign the reverse of your winning physical ticket immediately upon checking results.
              </Typography>
            </Box>

            {/* Prizes Up to 5000 */}
            <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 2.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#059669",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <AccountBalanceWalletIcon sx={{ fontSize: 22 }} /> Up to ₹5,000
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", lineHeight: 1.65 }}>
                Can be claimed directly in cash from any local authorized lottery shop or retail agent across Kerala by surrendering the winning ticket.
              </Typography>
            </Box>

            {/* Prizes Between 5001 and 1 Lakh */}
            <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 2.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#0B3C5D",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <ReceiptLongIcon sx={{ fontSize: 22 }} /> ₹5,001 to ₹1,00,000
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", lineHeight: 1.65 }}>
                Must be submitted and processed at any <strong>District Lottery Office (DLO)</strong> along with standard identity verification documents.
              </Typography>
            </Box>

            {/* Prizes Above 1 Lakh */}
            <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 2.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#D97706",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <StorefrontIcon sx={{ color: "#D97706", fontSize: 22 }} /> Above ₹1,00,000
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", lineHeight: 1.65 }}>
                Must be submitted directly to the <strong>Directorate of Kerala State Lotteries</strong> office (Vikas Bhavan P.O., Thiruvananthapuram) or through Nationalised / Scheduled banks.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Documents Required & Tax/Reminders */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* Documents Required for Prize Verification */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
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
                <FeedIcon sx={{ color: "#0B3C5D" }} /> Documents Required for Prize Verification
              </Typography>
              <List>
                {[
                  "Original Winning Ticket (signed on the back).",
                  "Kerala Lottery Prize Claim Form and official declaration form.",
                  "Valid Photo Identity Proof (Aadhaar Card, PAN Card, Voter ID, or Passport).",
                  "Bank Account Passbook Copy with IFSC / cancelled cheque for direct electronic fund transfer.",
                  "Two passport size photos of the winner attested by a Gazetted Officer or Notary.",
                  "Receipt for the prize money with a revenue stamp affixed.",
                ].map((item, index) => (
                  <ListItem key={index} disableGutters sx={{ alignItems: "flex-start", py: 0.6 }}>
                    <ListItemIcon sx={{ minWidth: 30, mt: 0.25 }}>
                      <CheckCircleIcon sx={{ color: "#0B3C5D", fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      slotProps={{ primary: { sx: { fontWeight: 600, color: "#374151", fontSize: "0.9rem" } } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Tax Deductions (TDS) */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                bgcolor: "#F9FAFB",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#1F2937",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <InfoIcon sx={{ color: "#4B5563" }} /> Taxation (TDS) & Deductions
              </Typography>
              <List>
                {[
                  "All prize payouts exceeding ₹10,000 attract a mandatory flat 30% Tax Deduction at Source (TDS) under Indian income tax regulations. A PAN card is required.",
                  "An authorized 10% agent commission is deducted from the total gross prize pool.",
                  "The net prize amount is disbursed directly via electronic bank transfer to the winner's account.",
                ].map((item, index) => (
                  <ListItem key={index} disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                      <CheckCircleIcon sx={{ color: "#4B5563", fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      slotProps={{ primary: { sx: { fontWeight: 500, color: "#4B5563", fontSize: "0.875rem" } } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Important Reminders */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "16px",
                border: "1px solid #FEE2E2",
                bgcolor: "#FEF2F2",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#DC2626",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <WarningIcon sx={{ fontSize: 20 }} /> Important Verification Reminders
              </Typography>
              <List>
                {[
                  "Cross-verify your numbers against the official Kerala Government Gazette publication before presenting your claim.",
                  "Keep your original winning ticket safe, dry, and undamaged. Torn or altered tickets are disqualified.",
                  "Claims must be presented within 90 days from the official draw announcement date.",
                ].map((item, index) => (
                  <ListItem key={index} disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                      <CheckCircleIcon sx={{ color: "#DC2626", fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      slotProps={{ primary: { sx: { fontWeight: 500, color: "#991B1B", fontSize: "0.875rem" } } }}
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
