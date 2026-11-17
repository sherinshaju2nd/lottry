"use client";

import React from "react";
import type { BlogPost, BlogDrawContext, BlogRecentDraw } from "@/data/blogs";
import { renderBlogContent } from "@/components/blog/blogContentRegistry";
import PostDetailLayout from "@/components/posts/PostDetailLayout";
import { formatArticleDate } from "@/lib/articles";
import { guideToPostCard } from "@/lib/posts";

interface Props {
  post: BlogPost;
  /** Draw details from the database (lotteries.draw_date) for posts with a drawLotteryCode. */
  draw?: BlogDrawContext | null;
  /** Latest published draws for posts with showRecentDraws. */
  recentDraws?: BlogRecentDraw[];
}

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
    >
      {renderBlogContent(post.slug, { draw, recentDraws })}
    </PostDetailLayout>
  );
}
