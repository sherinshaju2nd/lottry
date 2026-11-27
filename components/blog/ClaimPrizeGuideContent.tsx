import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SecurityIcon from "@mui/icons-material/Security";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScheduleIcon from "@mui/icons-material/Schedule";

const ClaimPrizeGuideContent = () => (
  <>
    {/* Introduction */}
    <Typography
      variant="body1"
      sx={{
        fontSize: { xs: "1.05rem", sm: "1.12rem" },
        color: "#1E293B",
        mb: 3,
        lineHeight: 1.8,
      }}
    >
      Winning a Kerala lottery can be an exciting experience, but knowing what to do after winning is just as important as checking your ticket. Whether you have won a small prize or a major amount, you need to follow the correct procedure to receive your prize safely. This guide explains how to claim Kerala lottery, what documents you may need, where to submit your winning ticket, and what you should know about the claim deadline.
    </Typography>

    <Typography
      variant="body1"
      sx={{
        fontSize: { xs: "1rem", sm: "1.05rem" },
        color: "#334155",
        mb: 4,
        lineHeight: 1.8,
      }}
    >
      Before starting the claim process, make sure your ticket details match the official draw results. If you regularly check{" "}
      <Link href="/" style={{ color: "#0B3C5D", fontWeight: 700, textDecoration: "underline" }}>
        Kerala lottery results today
      </Link>
      , always compare your ticket number with the official result information before taking further steps.
    </Typography>

    {/* Section 1: What to Do After Winning */}
    <Box id="what-to-do-after-winning" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        What to Do After Winning a Kerala Lottery
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2.5 }}>
        The first step after discovering a winning ticket is to keep the original ticket safe. Avoid folding, damaging, writing unnecessary information on it, or exposing it to moisture. The physical ticket is important when making a claim.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "14px",
          bgcolor: "#F8FAFC",
          border: "1.5px solid #E2E8F0",
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A", mb: 1.5 }}>
          🔍 Check the following ticket details carefully:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <li><strong>Lottery name and draw number:</strong> Ensure it matches today&apos;s draw notification.</li>
          <li><strong>Date of the draw:</strong> Verify the exact printed date on the ticket front.</li>
          <li><strong>Ticket number:</strong> Full alphabetical series and six-digit number.</li>
          <li><strong>Prize category:</strong> 1st Prize, 2nd, 3rd, Consolation, etc.</li>
          <li><strong>Serial or series details:</strong> Security code and barcode area.</li>
          <li><strong>Printed information on the ticket:</strong> Unaltered official Government stamp.</li>
        </Box>
      </Paper>

      <Typography variant="body1" sx={{ color: "#334155" }}>
        You should also verify the winning number against the official result notification. If you found your number through Kerala lottery results today, verify it through an official source before assuming that the ticket has won.
      </Typography>
    </Box>

    {/* Section 2: How to Claim Kerala Lottery (General process) */}
    <Box id="how-to-claim-general" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        How to Claim Kerala Lottery
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 3 }}>
        Understanding how to claim Kerala lottery prizes depends on the value and category of the prize. Smaller prizes may have a simpler claim procedure, while larger prizes require additional verification and documentation.
      </Typography>

      {/* Step-by-Step Visual Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        {[
          { step: "1", title: "Verify the winning ticket", desc: "Compare against official Gazette publication." },
          { step: "2", title: "Keep the original ticket safely", desc: "Do not fold, staple, or smudge barcode/ink." },
          { step: "3", title: "Prepare the required documents", desc: "PAN, Aadhaar/ID, bank passbook, photos." },
          { step: "4", title: "Complete the necessary claim forms", desc: "Fill official Form VIII / claim receipt." },
          { step: "5", title: "Submit to the appropriate authority", desc: "Agency, District Lottery Office, or Directorate." },
          { step: "6", title: "Complete identity and ticket verification", desc: "Forensic and serial checks." },
          { step: "7", title: "Wait for prize amount processing", desc: "Direct bank transfer after TDS deduction." },
        ].map((item) => (
          <Box
            key={item.step}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              p: 2,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "#0B3C5D",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {item.step}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                {item.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "12px",
          bgcolor: "#EFF6FF",
          border: "1px solid #BFDBFE",
        }}
      >
        <Typography variant="body2" sx={{ color: "#1E40AF", fontWeight: 600 }}>
          💡 Always follow the latest instructions issued by the Kerala State Lotteries authorities because claim procedures and requirements can change.
        </Typography>
      </Paper>
    </Box>

    {/* Section 3: Prize Claim Process */}
    <Box id="prize-claim-process" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        Kerala Lottery Prize Claim Process
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        The kerala lottery prize claim process generally begins with confirming that the ticket is genuine and belongs to the person submitting the claim. The original winning ticket may need to be presented along with identification and other required documents.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        For higher-value prizes, additional verification may be required before the prize is released. Therefore, winners should avoid handing their original ticket to unknown individuals or unofficial agents.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        The kerala lottery prize claim process may also involve completing a claim application and providing bank-related information where required. Make sure that the name and other details on your documents are accurate and consistent.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155" }}>
        If you are unsure about any part of the kerala lottery prize claim process, contact the relevant official lottery office or authority rather than relying only on information from unofficial websites.
      </Typography>
    </Box>

    {/* Section 4: Claim Documents */}
    <Box id="claim-documents" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        Kerala Lottery Claim Documents
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2.5 }}>
        One of the most important parts of claiming a prize is preparing the correct kerala lottery claim documents. The exact documents can depend on the prize amount and current rules.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Original Winning Ticket", desc: "Signed with your name and address on the reverse side." },
          { label: "Valid Identity Proof", desc: "Aadhaar Card, Voter ID, Passport, or Driving License." },
          { label: "PAN Card", desc: "Mandatory for tax deduction (TDS) under Section 194B." },
          { label: "Bank Account Details", desc: "Cancelled cheque or copy of front page of bank passbook." },
          { label: "Passport-Size Photographs", desc: "2 attested photographs (by Gazetted Officer or Notary)." },
          { label: "Completed Claim Form", desc: "Available at district lottery offices and online." },
        ].map((doc, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                height: "100%",
                display: "flex",
                gap: 1.5,
              }}
            >
              <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 22, mt: 0.3 }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                  {doc.label}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>
                  {doc.desc}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="body1" sx={{ color: "#334155" }}>
        Make sure your documents are clear and valid. Before submitting anything, check the latest official instructions because requirements can vary depending on the prize category.
      </Typography>
    </Box>

    {/* Section 5: How to Claim Prize Money */}
    <Box id="claim-prize-money" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        How to Claim Kerala Lottery Prize Money
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        Many winners want to know how to claim Kerala lottery prize money without making mistakes. The most important thing is to follow the official procedure and submit your documents within the applicable period.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        For larger prizes, the winning ticket and supporting documents may undergo verification before payment is approved. The prize may then be transferred through the prescribed payment method (direct RTGS/NEFT to the winner&apos;s verified bank account).
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: "14px",
          bgcolor: "#FEF2F2",
          border: "1.5px solid #FECACA",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <WarningAmberIcon sx={{ color: "#DC2626" }} />
          <Typography sx={{ fontWeight: 800, color: "#991B1B" }}>
            Security Warning
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#7F1D1D" }}>
          Do not share sensitive information such as bank details, OTPs, passwords, or copies of identity documents with unknown people claiming that they can process your prize. Lottery winners should deal only with authorized channels.
        </Typography>
      </Paper>
    </Box>

    {/* Section 6: Where to Claim */}
    <Box id="where-to-claim" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        Where to Claim Kerala Lottery Prize
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2.5 }}>
        Knowing where to claim Kerala lottery prize is essential because different prize categories may have different submission procedures.
      </Typography>

      {/* Location Matrix */}
      <Paper variant="outlined" sx={{ borderRadius: "14px", overflow: "hidden", mb: 3 }}>
        <Box sx={{ bgcolor: "#0B3C5D", color: "#FFFFFF", p: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
            Authorized Submission Centers by Prize Amount
          </Typography>
        </Box>
        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <LocationOnIcon sx={{ color: "#16A34A", mt: 0.3 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
                Prizes up to ₹5,000
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Any authorized Kerala Lottery retail agent or agency ticket stall across the state.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <LocationOnIcon sx={{ color: "#2563EB", mt: 0.3 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
                Prizes from ₹5,001 up to ₹1,00,000
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                District Lottery Offices (DLO) or Sub-Treasuries across the 14 districts of Kerala.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <AccountBalanceIcon sx={{ color: "#9333EA", mt: 0.3 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
                Prizes above ₹1,00,000 &amp; Bumper 1st Prizes
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Directorate of Kerala State Lotteries, Vikas Bhavan, Thiruvananthapuram, or submitted via authorized Nationalized/Scheduled Banks.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Typography variant="body1" sx={{ color: "#334155" }}>
        Before travelling to an office, check the current official instructions regarding claim location, office working hours, required documents, claim forms, verification requirements, and submission deadline.
      </Typography>
    </Box>

    {/* Section 7: Claim Deadline */}
    <Box id="claim-deadline" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        Kerala Lottery Prize Claim Deadline
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        Winners should pay close attention to the kerala lottery prize claim deadline. A winning ticket should not simply be kept aside for an extended period after the draw.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "14px",
          bgcolor: "#FFFBEB",
          border: "1.5px solid #FDE68A",
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <ScheduleIcon sx={{ color: "#D97706", fontSize: 24 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#92400E" }}>
            Official 30-Day Limit
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#78350F", lineHeight: 1.7 }}>
          Winning tickets must normally be surrendered within <strong>30 days</strong> from the date of draw. Delaying past the deadline risks forfeiture or requires discretionary condonation petitions with medical or valid justification.
        </Typography>
      </Paper>

      <Typography variant="body1" sx={{ color: "#334155" }}>
        Keep your winning ticket safely from the day of the draw and begin the claim process as soon as possible. Waiting until the last moment can create unnecessary problems if you need additional documents or verification.
      </Typography>
    </Box>

    {/* Section 8: How to Claim Safely */}
    <Box id="claim-safely" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        How to Claim Kerala Lottery Safely
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2.5 }}>
        When learning how to claim Kerala lottery, safety should be one of your priorities. Lottery winners can sometimes become targets for scams, fake agents, or people asking for advance payments.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "14px",
          bgcolor: "#F8FAFC",
          border: "1.5px solid #E2E8F0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SecurityIcon sx={{ color: "#0B3C5D" }} />
          <Typography sx={{ fontWeight: 800, color: "#0B3C5D" }}>
            Safety Rules to Follow:
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1.2 }}>
          <li><strong>Never pay an unknown person</strong> to &quot;release&quot; your prize. Official TDS is automatically deducted.</li>
          <li><strong>Do not share OTPs</strong> or online banking passwords with anyone.</li>
          <li><strong>Do not send your original ticket</strong> to an unofficial person or courier service.</li>
          <li><strong>Verify lottery information</strong> through official sources and Kerala Government Gazette.</li>
          <li><strong>Keep copies of important documents</strong> submitted during the claim.</li>
          <li><strong>Ask the lottery authority</strong> directly if you are uncertain about any requirement.</li>
        </Box>
      </Paper>
    </Box>

    {/* Section 9: Ticket Verification */}
    <Box id="ticket-verification" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        What Happens During Ticket Verification?
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        Ticket verification is an important part of the claim procedure. The lottery authority may check the ticket details against official draw records and verify whether the ticket is genuine.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        The ticket may be examined for details such as the lottery name, draw number, series, ticket number, and other printed information. Identity and supporting documents may also be checked.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155" }}>
        This is why winners should protect the original ticket and avoid making unnecessary changes to it.
      </Typography>
    </Box>

    {/* Section 10: Procedure by Prize Categories */}
    <Box id="prize-categories" sx={{ scrollMarginTop: 100, mb: 5 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        How to Claim Kerala Lottery for Different Prize Categories
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        The process can vary according to the prize category. A small prize may have a simpler procedure than a major prize. Higher-value winnings generally involve additional documentation and verification.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        Regardless of the prize amount, winners should start by confirming their ticket and checking the applicable official instructions.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155" }}>
        If you are researching how to claim Kerala lottery, remember that information found on third-party websites may become outdated. Always verify important requirements, deadlines, and submission instructions with the responsible authority.
      </Typography>
    </Box>

    {/* Section 11: Final Checklist */}
    <Box id="final-checklist" sx={{ scrollMarginTop: 100, mb: 6 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0B3C5D", mb: 2 }}>
        Final Checklist Before Claiming Your Prize
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155", mb: 2.5 }}>
        Before submitting your claim, make sure you have:
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "14px",
          bgcolor: "#F0FDF4",
          border: "1.5px solid #BBF7D0",
          mb: 3,
        }}
      >
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <li><strong>Original winning ticket</strong> with back signature and address</li>
          <li><strong>Valid identification documents</strong> (Aadhaar / Voter ID / Passport)</li>
          <li><strong>PAN card</strong> (copy for TDS records)</li>
          <li><strong>Required bank details</strong> (IFSC &amp; Account Number verification)</li>
          <li><strong>Completed claim form</strong> (duly signed)</li>
          <li><strong>Supporting documents</strong> requested by the authority</li>
          <li><strong>Verified the current claim deadline</strong> (within 30 days)</li>
          <li><strong>Confirmed the correct claim location</strong> for your prize amount</li>
        </Box>
      </Paper>

      <Typography variant="body1" sx={{ color: "#334155", mb: 2 }}>
        Knowing how to claim Kerala lottery correctly can make the process easier and help you avoid unnecessary delays. Most importantly, rely on official instructions when dealing with your winning ticket, documents, deadlines, and prize payment.
      </Typography>
      <Typography variant="body1" sx={{ color: "#334155" }}>
        If you regularly check{" "}
        <Link href="/" style={{ color: "#0B3C5D", fontWeight: 700, textDecoration: "underline" }}>
          Kerala lottery results today
        </Link>
        , remember that finding a winning number is only the first step. After confirming the result, protect your ticket and follow the appropriate official claim procedure to receive your prize.
      </Typography>
    </Box>
  </>
);

export default ClaimPrizeGuideContent;
