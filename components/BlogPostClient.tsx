"use client";

import React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { BlogPost, BlogDrawContext, BlogRecentDraw } from "@/data/blogs";
import { renderBlogContent } from "@/components/blog/blogContentRegistry";
import PostDetailLayout from "@/components/posts/PostDetailLayout";
import RelatedBlogPosts from "@/components/blog/RelatedBlogPosts";
import { formatArticleDate } from "@/lib/articles";
import { guideToPostCard } from "@/lib/posts";

interface Props {
  post: BlogPost;
  /** Draw details from the database (lotteries.draw_date) for posts with a drawLotteryCode. */
  draw?: BlogDrawContext | null;
  /** Latest published draws for posts with showRecentDraws. */
  recentDraws?: BlogRecentDraw[];
}

/** Post details (author, dates, read time, category, tags) shown at the top of every guide body. */
const GuideDetails = ({ post, readMinutes }: { post: BlogPost; readMinutes: number }) => {
  const { author, category, publishedDate, updatedDate, tags = [] } = post;
  const details = [
    `By ${author.name}`,
    `Published ${formatArticleDate(publishedDate)}`,
    ...(updatedDate !== publishedDate ? [`Updated ${formatArticleDate(updatedDate)}`] : []),
    `${readMinutes} min read`,
    category,
  ];

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, pb: 2.5, mb: 4, borderBottom: "1px solid #F1F5F9" }}>
      <Typography component="p" sx={{ width: "100%", fontSize: "0.85rem", color: "#475569", fontWeight: 600, mb: 0.5 }}>
        {details.join(" · ")}
      </Typography>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" sx={{ bgcolor: "#EFF6FF", color: "#0B3C5D", fontWeight: 700, fontSize: "0.72rem" }} />
      ))}
    </Box>
  );
};

/** Editorial guide page: guide content rendered in the shared Articles & News detail layout. */
export default function BlogPostClient({ post, draw = null, recentDraws = [] }: Props) {
  const { publishedAt, readMinutes } = guideToPostCard(post);

  return (
    <PostDetailLayout
      title={post.title}
      description={post.description}
      categoryLabel={post.category}
      readMinutes={readMinutes}
      publishedLabel={formatArticleDate(publishedAt)}
      publishedIso={publishedAt}
      author={post.author}
      toc={post.tableOfContents.map(({ id, title }) => ({ id, title }))}
      faqs={post.faqs}
      cta={post.primaryCta}
      authorBioLabel="Written by"
      reviewedDate={post.updatedDate}
      kindLabel="Guide"
      footer={<RelatedBlogPosts slug={post.slug} />}
    >
      <GuideDetails post={post} readMinutes={readMinutes} />
      {renderBlogContent(post.slug, { draw, recentDraws })}
    </PostDetailLayout>
  );
}
