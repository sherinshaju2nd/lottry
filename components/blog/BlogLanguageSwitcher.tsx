import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TranslateIcon from "@mui/icons-material/Translate";
import { BLOG_LANGUAGES, type BlogLanguage } from "@/data/blogTranslations/types";

export interface BlogLanguageLink {
  language: BlogLanguage;
  href: string;
}

interface Props {
  current: BlogLanguage;
  links: BlogLanguageLink[];
  label?: string;
}

/** "Read this guide in: English · മലയാളം · हिन्दी · தமிழ் · తెలుగు" — links between translations of one guide. */
const BlogLanguageSwitcher = ({ current, links, label = "Read this guide in:" }: Props) => {
  if (links.length < 2) return null;

  return (
    <Box
      component="nav"
      aria-label={label}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        p: 1.75,
        mb: 4,
        borderRadius: "12px",
        bgcolor: "#F8FAFC",
        border: "1px solid #E2E8F0",
      }}
    >
      <TranslateIcon sx={{ color: "#0B3C5D", fontSize: 20 }} />
      <Typography component="span" sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#334155", mr: 0.5 }}>
        {label}
      </Typography>
      {links.map(({ language, href }) => {
        const { nativeName, englishName, hreflang } = BLOG_LANGUAGES[language];
        const isCurrent = language === current;
        return (
          <Box
            key={language}
            component={isCurrent ? "span" : Link}
            {...(isCurrent ? { "aria-current": "page" as const } : { href, hrefLang: hreflang })}
            lang={hreflang}
            title={englishName}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid",
              borderColor: isCurrent ? "#0B3C5D" : "#CBD5E1",
              bgcolor: isCurrent ? "#0B3C5D" : "#FFFFFF",
              color: isCurrent ? "#FFFFFF" : "#0B3C5D",
              "&:hover": isCurrent ? undefined : { bgcolor: "#EFF6FF", borderColor: "#0B3C5D" },
            }}
          >
            {nativeName}
          </Box>
        );
      })}
    </Box>
  );
};

export default BlogLanguageSwitcher;
