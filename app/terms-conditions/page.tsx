import React from "react";
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the Terms and Conditions for Kerala Lottery Result Today, including informational service disclaimers, user eligibility, and usage guidelines.",
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/terms-conditions",
  },
};

export default function TermsConditionsPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: "24px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 900, mb: 1, color: "#111827", fontSize: { xs: "2rem", md: "3rem" } }}
        >
          Terms & Conditions
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4, fontWeight: 500 }}>
          Last Updated: August 14, 2026
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: "#374151", lineHeight: 1.7 }}>
          Welcome to Kerala Lottery Result Today (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our website and mobile application (the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              1. Informational Purpose Only
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              Our Service is provided solely for informational and educational purposes. We display Kerala state lottery draw results, schedule, and ticket lookup verification. We do not sell lottery tickets, facilitate ticket purchases, accept bets, or pay out prize claims.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              2. Unofficial Service Disclaimer
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              Kerala Lottery Result Today is <strong>not</strong> affiliated with, endorsed by, or associated with the Government of Kerala, the Kerala State Lotteries Department, or any official government agency. All brand names, lottery names, and trademarks mentioned on this website belong to their respective owners.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              3. Data Accuracy and Disclaimers
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mb: 2 }}>
              While we strive to publish draw results as quickly and accurately as possible, all results are subject to server issues, synchronization delays, typographical errors, or API feed outages. 
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, fontWeight: 700, bgcolor: "#FFFBEB", p: 2, borderRadius: "12px", border: "1px solid #FEF3C7" }}>
              ⚠️ IMPORTANT: The results displayed on this Service must not be treated as final. You MUST verify winning tickets with the official Government Gazette published by the Kerala State Lotteries Department before discarding or claiming any prize. We assume no liability for errors or losses arising from incorrect data.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              4. User Eligibility (Age Restrictions)
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              You must be at least 18 years of age (or the legal minimum age in your jurisdiction) to use our Service. If you are under 18, you are strictly prohibited from using the Service.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              5. Intellectual Property
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              The software, design, logos, layout, and custom checker code on our Service belong to us or our licensors and are protected by copyright, trademark, and other laws. You may use the Service only for personal, non-commercial use.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              6. Limitation of Liability
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              To the maximum extent permitted by law, Kerala Lottery Result Today, its team, and developers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Service, including any decisions made based on the displayed draw results.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              7. Third-Party Links
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              The Service may contain links or ads to third-party websites or services. We do not monitor, endorse, or have control over these third parties, and we are not responsible for their content, terms, or privacy practices.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              8. Changes to Terms
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              We reserve the right to modify these Terms at any time. Any changes will be posted on this page with an updated &quot;Last Updated&quot; date. Your continued use of the Service after changes are posted constitutes your acceptance of the new Terms.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              9. Contact Us
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              If you have any questions about these Terms and Conditions, please contact us at:
              <br />
              Email: <strong>support@keralalotteryresultstoday.in</strong>
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mt: 5, color: "#374151", fontWeight: 700, textAlign: "center" }}>
          By using Kerala Lottery Result Today, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
        </Typography>
      </Paper>
    </Container>
  );
}
