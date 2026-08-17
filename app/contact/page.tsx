import React from "react";
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpIcon from "@mui/icons-material/Help";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LanguageIcon from "@mui/icons-material/Language";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us - Helpdesk & Customer Support | Kerala Lottery Result Today",
  description:
    "Get in touch with the Kerala Lottery Result Today support team for app feedback, technical inquiries, or general help. Contact via WhatsApp, Phone, or Email.",
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/contact",
  },
  openGraph: {
    title: "Contact Us - Kerala Lottery Result Today Helpdesk",
    description:
      "Need help or have questions regarding lottery results? Contact our support team via WhatsApp, Phone, or Email.",
    url: "https://www.keralalotteryresultstoday.in/contact",
    siteName: "Kerala Lottery Result Today",
  },
};

const SUPPORT_EMAIL = "keralalotteryresultstoday@gmail.com";
const PHONE_1 = "+91 97785 70477";
const PHONE_1_CLEAN = "919778570477";
const PHONE_2 = "+91 82818 07752";
const PHONE_2_DIAL = "+918281807752";
const CONTACT_PERSON = "Ajo Mon John";

export default function ContactPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 6 },
          borderRadius: { xs: "16px", md: "24px" },
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* Header Badge & Title */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Chip
            label="HELPDESK & SUPPORT"
            size="small"
            sx={{
              bgcolor: "#EBF5FF",
              color: "#0B3C5D",
              fontWeight: 800,
              fontSize: "0.75rem",
              mb: 1.5,
              borderRadius: "6px",
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              color: "#111827",
              fontSize: { xs: "2rem", md: "2.75rem" },
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              color: "#0B3C5D",
              fontWeight: 700,
              fontSize: { xs: "1.1rem", md: "1.25rem" },
              mb: 1.5,
            }}
          >
            ബന്ധപ്പെടുക (Help & Inquiries)
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#4B5563",
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Have feedback, noticed a bug, or need assistance with our lottery
            results platform or mobile app? Reach out to our team directly.
          </Typography>
        </Box>

        {/* Action Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* WhatsApp Card */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "16px",
                border: "2px solid #86EFAC",
                bgcolor: "#F0FDF4",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.15)",
                },
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      bgcolor: "#DCFCE7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <WhatsAppIcon sx={{ color: "#16A34A", fontSize: 28 }} />
                  </Box>
                  <Chip
                    label="Fastest Response"
                    size="small"
                    sx={{
                      bgcolor: "#16A34A",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1F2937", mb: 0.5 }}>
                  WhatsApp Support
                </Typography>
                <Typography variant="body2" sx={{ color: "#4B5563", mb: 1 }}>
                  Contact Person: <strong>{CONTACT_PERSON}</strong>
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#16A34A", mb: 2 }}>
                  {PHONE_1}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                component="a"
                href={`https://wa.me/${PHONE_1_CLEAN}?text=${encodeURIComponent(
                  "Hello, I am contacting you regarding Kerala Lottery Results Today."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
                sx={{
                  bgcolor: "#16A34A",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  py: 1.2,
                  borderRadius: "10px",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#15803D" },
                }}
              >
                Chat on WhatsApp
              </Button>
            </Paper>
          </Grid>

          {/* Email Card */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "16px",
                border: "2px solid #BFDBFE",
                bgcolor: "#EFF6FF",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px -5px rgba(11, 60, 93, 0.15)",
                },
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      bgcolor: "#DBEAFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EmailIcon sx={{ color: "#0B3C5D", fontSize: 28 }} />
                  </Box>
                  <Chip
                    label="Official Email"
                    size="small"
                    sx={{
                      bgcolor: "#0B3C5D",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1F2937", mb: 0.5 }}>
                  Email Support
                </Typography>
                <Typography variant="body2" sx={{ color: "#4B5563", mb: 1 }}>
                  Inquiries, feedback & developer assistance
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: "#0B3C5D",
                    mb: 2,
                    wordBreak: "break-all",
                  }}
                >
                  {SUPPORT_EMAIL}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                component="a"
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  "Kerala Lottery Results Inquiry"
                )}`}
                startIcon={<EmailIcon />}
                sx={{
                  bgcolor: "#0B3C5D",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  py: 1.2,
                  borderRadius: "10px",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#07263C" },
                }}
              >
                Send Email
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Phone Helplines Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            bgcolor: "#F9FAFB",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <PhoneIcon sx={{ color: "#D97706" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
              Direct Phone Helplines
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#111827" }}>
                    {PHONE_1}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                    {CONTACT_PERSON} (Primary Helpline)
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={`tel:${PHONE_1_CLEAN}`}
                  startIcon={<PhoneIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    borderColor: "#0B3C5D",
                    color: "#0B3C5D",
                    "&:hover": { bgcolor: "#F0F9FF" },
                  }}
                >
                  Call
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#111827" }}>
                    {PHONE_2}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                    Secondary Phone Support
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={`tel:${PHONE_2_DIAL}`}
                  startIcon={<PhoneIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    borderColor: "#0B3C5D",
                    color: "#0B3C5D",
                    "&:hover": { bgcolor: "#F0F9FF" },
                  }}
                >
                  Call
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Operating Hours & Website Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            p: 2.5,
            borderRadius: "14px",
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
            <AccessTimeIcon sx={{ color: "#64748B" }} />
            <Box>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                SUPPORT WORKING HOURS
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B" }}>
                Monday – Saturday: 9:00 AM – 7:00 PM IST
              </Typography>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
            <LanguageIcon sx={{ color: "#0B3C5D" }} />
            <Box>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, display: "block" }}>
                OFFICIAL WEBSITE
              </Typography>
              <Link
                href="https://www.keralalotteryresultstoday.in"
                style={{ textDecoration: "none" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: "#0B3C5D",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  keralalotteryresultstoday.in
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>

        {/* Helpful Resources Box */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1F2937", mb: 1.5 }}>
            Helpful Information & Guides:
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Link href="/claim" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<MenuBookIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: "10px",
                    borderColor: "#E5E7EB",
                    color: "#374151",
                    fontWeight: 700,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    "&:hover": { borderColor: "#0B3C5D", bgcolor: "#F0F9FF" },
                  }}
                >
                  Prize Claim Guide
                </Button>
              </Link>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Link href="/faq" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<HelpIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: "10px",
                    borderColor: "#E5E7EB",
                    color: "#374151",
                    fontWeight: 700,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    "&:hover": { borderColor: "#0B3C5D", bgcolor: "#F0F9FF" },
                  }}
                >
                  Frequently Asked FAQ
                </Button>
              </Link>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Link href="/guide" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<MenuBookIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: "10px",
                    borderColor: "#E5E7EB",
                    color: "#374151",
                    fontWeight: 700,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    "&:hover": { borderColor: "#0B3C5D", bgcolor: "#F0F9FF" },
                  }}
                >
                  Lottery Schedule Guide
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>

        {/* Official Disclaimer */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "12px",
            bgcolor: "#FEF3C7",
            border: "1px solid #FCD34D",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <WarningAmberIcon sx={{ color: "#B45309", mt: 0.2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#92400E", mb: 0.5 }}>
                Disclaimer & Support Notice (ഔദ്യോഗിക അറിയിപ്പ്)
              </Typography>
              <Typography variant="body2" sx={{ color: "#78350F", fontSize: "0.825rem", lineHeight: 1.6 }}>
                Kerala Lottery Result Today is an independent informational utility and is NOT affiliated with, endorsed by, or connected to the Kerala State Lottery Department or Government of Kerala. All results are sourced from official government gazettes. We do not sell lottery tickets or process prize payouts. Ticket holders must verify results in the official Government Gazette.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Paper>
    </Container>
  );
}
