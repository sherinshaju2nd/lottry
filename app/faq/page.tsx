"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/Help";

export default function FAQPage() {
  const faqs = [
    {
      q: "What is Kerala State Lottery?",
      a: "Kerala State Lottery is the first government-run lottery program in India, established in 1967. It is organized by the Government of Kerala and aims to generate non-tax revenue for state development projects and healthcare programs while providing livelihood options.",
    },
    {
      q: "How often are the draws conducted and at what time?",
      a: "Draws are conducted daily, 365 days a year. The draw event happens live at Gorky Bhavan, Thiruvananthapuram, starting around 3:00 PM IST. Live results are published shortly after.",
    },
    {
      q: "Is it legal to buy Kerala Lottery tickets online?",
      a: "No, online sales are strictly prohibited. The government does not authorize any website, mobile app, or online channel to sell tickets. You must purchase physical paper tickets from authorized agents or retailers located within Kerala.",
    },
    {
      q: "What is the minimum age to participate?",
      a: "You must be 18 years of age or older to buy Kerala lottery tickets or to legally claim any winning prize money.",
    },
    {
      q: "What are the tax deductions and commissions on lottery prizes?",
      a: "A flat 30% income tax deduction applies to any prize amount exceeding ₹10,000. In addition, an agent commission of 10% is deducted from the total winning amount. All prize payouts are made net of these statutory deductions.",
    },
    {
      q: "How long is the prize claim window?",
      a: "Winners must claim their prizes within 30 days of the draw result announcement. Claims submitted after 30 days are generally not accepted. Make sure to keep your winning ticket in good condition, as damaged or torn tickets may be rejected.",
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
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
          Frequently Asked Questions (FAQ)
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#4B5563",
            maxWidth: 600,
            mx: "auto",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Find answers to common questions about Kerala State Lottery rules, draws, ticket purchases, tax deductions, and claim procedures.
        </Typography>
      </Box>

      {/* Accordions Container */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            elevation={0}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "12px !important",
              overflow: "hidden",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#0B3C5D" }} />}
              sx={{
                bgcolor: "#F9FAFB",
                px: 3,
                py: 1,
                "&.Mui-expanded": { bgcolor: "#EBF5FF" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <HelpIcon sx={{ color: "#0B3C5D", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: "#111827" }}>
                  {faq.q}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, py: 2.5, bgcolor: "#FFFFFF" }}>
              <Typography sx={{ color: "#4B5563", lineHeight: 1.7, fontWeight: 500 }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
