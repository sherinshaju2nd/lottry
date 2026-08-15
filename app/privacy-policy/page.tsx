import React from "react";
import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the official Privacy Policy for Kerala Lottery Result Today to understand how user information and cookies are handled on our website and app.",
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4, fontWeight: 500 }}>
          Last Updated: August 14, 2026
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: "#374151", lineHeight: 1.7 }}>
          This Privacy Policy explains how Kerala Lottery Result Today (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects information when you use our website and/or application (the &quot;Service&quot;). By using the Service, you agree to the practices described in this policy.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              1. Purpose of the Service
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              Kerala Lottery Result Today exists solely to display lottery results to users for informational purposes. We are not an official lottery operator, and this policy applies only to the limited data handling involved in operating a result-display Service.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              2. Information We Collect
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mb: 2 }}>
              Depending on how you use the Service, we may collect:
            </Typography>
            <ul style={{ paddingLeft: "20px", color: "#374151", lineHeight: 1.8 }}>
              <li>
                <strong>Automatically collected data:</strong> IP address, device type, browser type, operating system, app version, and usage data (such as pages viewed or results checked), collected through cookies, log files, or SDKs.
              </li>
              <li>
                <strong>Information you provide voluntarily:</strong> such as your name or email address, if you contact us, subscribe to notifications, or sign up for an account/alerts (if such features exist).
              </li>
              <li>
                <strong>Advertising and analytics data:</strong> if the Service displays ads or uses analytics tools, third-party providers (e.g., Google AdMob, Google Analytics) may collect data as described in Section 5.
              </li>
            </ul>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mt: 2 }}>
              We do not knowingly collect sensitive personal information, payment details, or lottery ticket purchase data, as the Service does not facilitate ticket purchases or claims.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              3. How We Use Your Information
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mb: 1.5 }}>
              We may use collected information to:
            </Typography>
            <ul style={{ paddingLeft: "20px", color: "#374151", lineHeight: 1.8 }}>
              <li>Operate, maintain, and improve the Service</li>
              <li>Display relevant lottery results and notifications</li>
              <li>Analyze usage trends to improve performance</li>
              <li>Display advertisements (if applicable)</li>
              <li>Respond to user inquiries or support requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              4. Server Issues and Data Accuracy Disclaimer
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              Please note that the results and data displayed through the Service are subject to server issues, technical errors, or synchronization delays. This Privacy Policy governs how we handle your personal data, and does not constitute a guarantee regarding the accuracy of lottery results — please refer to our Terms and Conditions for disclaimers relating to result accuracy and liability.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              5. Third-Party Services
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mb: 1.5 }}>
              We may use third-party services such as:
            </Typography>
            <ul style={{ paddingLeft: "20px", color: "#374151", lineHeight: 1.8 }}>
              <li>Analytics providers (e.g., Google Analytics, Firebase) to understand usage patterns</li>
              <li>Advertising networks (e.g., Google AdMob, Facebook Audience Network) to display ads</li>
              <li>Hosting/server providers to run the Service</li>
            </ul>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mt: 1.5 }}>
              These third parties may collect information in accordance with their own privacy policies. We encourage you to review those policies. We are not responsible for the data practices of third-party services.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              6. Cookies
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              The Service may use cookies or similar tracking technologies to enhance user experience, remember preferences, and gather analytics. You can control or disable cookies through your browser or device settings, though this may affect functionality.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              7. Data Sharing and Disclosure
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mb: 1.5 }}>
              We do not sell your personal information. We may share information only:
            </Typography>
            <ul style={{ paddingLeft: "20px", color: "#374151", lineHeight: 1.8 }}>
              <li>With service providers who help us operate the Service (analytics, hosting, advertising)</li>
              <li>If required by law, regulation, or legal process</li>
              <li>To protect our rights, users, or the public in cases of fraud, security issues, or misuse</li>
              <li>In connection with a business transfer (e.g., merger or acquisition), with notice to users where required</li>
            </ul>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              8. Data Retention
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              We retain collected data only as long as necessary to fulfill the purposes described in this policy, or as required by applicable law.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              9. Data Security
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              We take reasonable technical and organizational measures to protect your information. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              10. Children&apos;s Privacy
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              The Service is not intended for use by individuals under the age of 18 (or the legal minimum age for lottery-related content in your jurisdiction). We do not knowingly collect personal information from minors. If you believe a minor has provided us with information, please contact us to have it removed.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              11. Your Rights
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mb: 1.5 }}>
              Depending on your jurisdiction, you may have rights to:
            </Typography>
            <ul style={{ paddingLeft: "20px", color: "#374151", lineHeight: 1.8 }}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent to data collection (e.g., by disabling cookies or analytics)</li>
              <li>Object to certain processing activities</li>
            </ul>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7, mt: 1.5 }}>
              To exercise these rights, contact us using the details below.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              12. Changes to This Privacy Policy
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              We may update this Privacy Policy periodically. Changes will be posted on this page with a revised &quot;Last Updated&quot; date. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#0B3C5D" }}>
              13. Contact Us
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151", lineHeight: 1.7 }}>
              If you have questions or concerns about this Privacy Policy, please contact us at:
              <br />
              Email: <strong>support@keralalotteryresultstoday.in</strong>
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mt: 5, color: "#374151", fontWeight: 700, textAlign: "center" }}>
          By using Kerala Lottery Result Today, you acknowledge that you have read and understood this Privacy Policy.
        </Typography>
      </Paper>
    </Container>
  );
}
