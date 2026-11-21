"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getRelatedBlogs } from "@/data/blogs";
import PostCard from "@/components/posts/PostCard";
import { POSTS_PATH, guideToPostCard } from "@/lib/posts";

const RELATED_LIMIT = 3;

/** "More guides" grid at the bottom of every editorial guide: 3 related posts + a "View all" button. */
const RelatedBlogPosts = ({ slug }: { slug: string }) => {
  const related = getRelatedBlogs(slug, RELATED_LIMIT).map(guideToPostCard);

  return (
    <Box component="section" aria-labelledby="related-guides-heading" sx={{ mt: { xs: 6, md: 8 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
        <Typography
          id="related-guides-heading"
          component="h2"
          sx={{ fontWeight: 900, color: "#0B3C5D", fontSize: { xs: "1.3rem", md: "1.55rem" } }}
        >
          More Kerala lottery guides
        </Typography>
        <Button
          component={Link}
          href={POSTS_PATH}
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", color: "#0B3C5D", bgcolor: "#EBF5FF", px: 2, flexShrink: 0, "&:hover": { bgcolor: "#DBEAFE" } }}
        >
          View all
        </Button>
      </Box>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          p: 0,
          m: 0,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
          "& > li": { display: "flex" },
          "& > li > *": { flex: 1 },
        }}
      >
        {related.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </Box>
    </Box>
  );
};

export default RelatedBlogPosts;
