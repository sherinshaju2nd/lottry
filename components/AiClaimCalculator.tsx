"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CalculateIcon from "@mui/icons-material/Calculate";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const PRESET_AMOUNTS = [
  { label: "₹25 Crore (Onam Bumper)", value: 250000000 },
  { label: "₹20 Crore (Xmas Bumper)", value: 200000000 },
  { label: "₹1 Crore (Dhanalekshmi)", value: 10000000 },
  { label: "₹80 Lakhs (Karunya / BT)", value: 8000000 },
  { label: "₹75 Lakhs (Sthree Sakthi)", value: 7500000 },
  { label: "₹10 Lakhs (2nd Prize)", value: 1000000 },
  { label: "₹1 Lakh (3rd Prize)", value: 100000 },
  { label: "₹5,000 (4th Prize)", value: 5000 },
];

export default function AiClaimCalculator() {
  const [amount, setAmount] = useState<number>(8000000);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    ticket: true,
    pan: false,
    aadhaar: false,
    photo: false,
    stamp: false,
    bank: false,
  });

  const grossPrize = Math.max(0, amount || 0);

  // Tax calculation under Section 194B
  // Winnings <= 10,000 have 0% TDS. Winnings > 10,000 have 30% TDS
  const isTaxable = grossPrize > 10000;
  const taxRate = isTaxable ? 0.30 : 0;
  const tdsAmount = grossPrize * taxRate;

  // Agent commission (10% on prizes)
  const agentCommission = grossPrize > 10000 ? grossPrize * 0.10 : 0;

  // Net In-Hand
  const netInHand = Math.max(0, grossPrize - tdsAmount - agentCommission);

  // Where to claim
  let claimOffice = "Local Authorized Retail Agent / Vendor";
  let claimDesc = "You can exchange and collect prize money directly at any authorized retail lottery shop in Kerala.";
  if (grossPrize > 100000) {
    claimOffice = "Directorate of State Lotteries, Thiruvananthapuram";
    claimDesc = "Submit winning ticket, KYC forms, and ID proofs to the Directorate or through Nationalized Banks.";
  } else if (grossPrize > 5000) {
    claimOffice = "District Lottery Office (DLO)";
    claimDesc = "Claim at your nearest District Lottery Office (located in all 14 Kerala district headquarters).";
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toggleDoc = (key: string) => {
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "20px",
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        mb: 4,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <CalculateIcon sx={{ color: "#0B3C5D", fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0B3C5D" }}>
            Prize Claim & Tax (TDS) Calculator
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Calculate exact net take-home cash, statutory deductions (Section 194B), and claim office guidelines.
          </Typography>
        </Box>
      </Box>

      {/* Preset Quick Chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {PRESET_AMOUNTS.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            onClick={() => setAmount(p.value)}
            color={amount === p.value ? "primary" : "default"}
            variant={amount === p.value ? "filled" : "outlined"}
            sx={{ fontWeight: 700, cursor: "pointer" }}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Input & Breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Total Winning Prize Amount (₹)"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1E293B", mb: 2 }}>
              Statutory Deduction Breakdown
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#64748B" }}>Gross Winning Amount:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B" }}>{formatINR(grossPrize)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#DC2626" }}>Income Tax TDS (30% u/s 194B):</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#DC2626" }}>- {formatINR(tdsAmount)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#D97706" }}>Agent Commission (10%):</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#D97706" }}>- {formatINR(agentCommission)}</Typography>
            </Box>

            <Box sx={{ pt: 2, borderTop: "2px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#065F46" }}>
                Net Take-Home Cash:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: "#059669" }}>
                {formatINR(netInHand)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Claim Destination & Document Checklist */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Claim Destination Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "14px",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocationOnIcon sx={{ color: "#2563EB" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1E40AF" }}>
                Where to Surrender & Claim:
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 0.5 }}>
              {claimOffice}
            </Typography>
            <Typography variant="caption" sx={{ color: "#3B82F6", display: "block" }}>
              {claimDesc}
            </Typography>
          </Paper>

          {/* KYC Document Checklist */}
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <AssignmentTurnedInIcon sx={{ color: "#059669" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1E293B" }}>
                Mandatory KYC Claim Checklist (30 Days)
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <FormControlLabel
                control={<Checkbox checked={checkedDocs.ticket} onChange={() => toggleDoc("ticket")} size="small" />}
                label={<Typography variant="body2">Original Winning Ticket (Signed on reverse)</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={checkedDocs.pan} onChange={() => toggleDoc("pan")} size="small" />}
                label={<Typography variant="body2">Self-attested PAN Card copy</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={checkedDocs.aadhaar} onChange={() => toggleDoc("aadhaar")} size="small" />}
                label={<Typography variant="body2">Aadhaar / Voter ID / Passport address proof</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={checkedDocs.photo} onChange={() => toggleDoc("photo")} size="small" />}
                label={<Typography variant="body2">2 Passport-size Photos (Attested by Gazetted Officer)</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={checkedDocs.stamp} onChange={() => toggleDoc("stamp")} size="small" />}
                label={<Typography variant="body2">Claim Receipt Form with ₹1 Revenue Stamp</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={checkedDocs.bank} onChange={() => toggleDoc("bank")} size="small" />}
                label={<Typography variant="body2">Bank Passbook / Cancelled Cheque for direct NEFT</Typography>}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
