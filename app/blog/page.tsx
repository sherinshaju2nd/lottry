import type { Metadata } from "next";
import { getAllBlogs, getFeaturedBlog } from "@/data/blogs";
import BlogListClient from "@/components/BlogListClient";

export const metadata: Metadata = {
  title: "Kerala Lottery Blog & Official Guides | How to Play, Check & Claim",
  description:
    "Official Kerala lottery guides, step-by-step claim instructions, prize money rules, ticket verification process, TDS calculation, and winner safety tips.",
  keywords: [
    "Kerala Lottery Blog",
    "How to claim Kerala lottery",
    "Kerala lottery prize claim guide",
    "Kerala lottery results today blog",
    "Kerala lottery rules and documents",
  ],
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/blog",
  },
  openGraph: {
    title: "Kerala Lottery Blog & Official Guides | How to Claim Prize",
    description:
      "Expert step-by-step guides on claiming Kerala lottery prizes, official document checklists, verification safety, and daily result updates.",
    url: "https://www.keralalotteryresultstoday.in/blog",
    siteName: "Kerala Lottery Results Today",
    type: "website",
  },
};

export default function BlogListPage() {
  const blogs = getAllBlogs();
  const featured = getFeaturedBlog();

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.keralalotteryresultstoday.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://www.keralalotteryresultstoday.in/blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <BlogListClient blogs={blogs} featured={featured} />
    </>
  );
}
