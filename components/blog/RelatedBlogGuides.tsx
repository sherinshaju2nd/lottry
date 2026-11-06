import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getBlogPath, getBlogsForLottery } from "@/data/blogs";

interface Props {
  lotteryCode: string;
  lotteryName: string;
}

/** Internal-link block from a lottery draw page to its related blog guides. */
const RelatedBlogGuides = ({ lotteryCode, lotteryName }: Props) => {
  const guides = getBlogsForLottery(lotteryCode);
  if (guides.length === 0) return null;

  return (
    <Paper
      component="aside"
      aria-label={`${lotteryName} guides`}
      elevation={0}
      sx={{
        mt: 4,
        p: { xs: 2.5, sm: 3 },
        borderRadius: "16px",
        border: "1.5px solid #FED7AA",
        bgcolor: "#FFF7ED",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ fontWeight: 900, color: "#7C2D12", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
      >
        <MenuBookIcon sx={{ color: "#EA580C" }} /> {lotteryName} Guide
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
        {guides.map(({ slug, title, description }) => (
          <Box
            key={slug}
            component={Link}
            href={getBlogPath(slug)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              p: 2,
              borderRadius: "12px",
              bgcolor: "#FFFFFF",
              border: "1px solid #FFEDD5",
              textDecoration: "none",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: "#EA580C", boxShadow: "0 4px 14px rgba(234,88,12,0.12)" },
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.98rem" }}>{title}</Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mt: 0.3 }}>{description}</Typography>
            </Box>
            <ArrowForwardIcon sx={{ color: "#EA580C", flexShrink: 0 }} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default RelatedBlogGuides;
