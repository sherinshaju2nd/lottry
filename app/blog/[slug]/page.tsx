import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBlogs, getBlogBySlug } from "@/data/blogs";
import BlogPostClient from "@/components/BlogPostClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Kerala Lottery",
    };
  }

  const url = `https://www.keralalotteryresultstoday.in/blog/${post.slug}`;

  return {
    title: `${post.metaTitle} | Kerala Lottery Official Guide`,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | Kerala Lottery`,
      description: post.description,
      url,
      siteName: "Kerala Lottery Results Today",
      type: "article",
      publishedTime: post.publishedDate,
      modifiedTime: post.updatedDate,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const pageUrl = `https://www.keralalotteryresultstoday.in/blog/${post.slug}`;

  // 1. Article / BlogPosting Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: pageUrl,
    datePublished: `${post.publishedDate}T09:00:00+05:30`,
    dateModified: `${post.updatedDate}T12:00:00+05:30`,
    author: {
      "@type": "Organization",
      name: post.author.name,
      url: "https://www.keralalotteryresultstoday.in",
    },
    publisher: {
      "@type": "Organization",
      name: "Kerala Lottery Results Today",
      url: "https://www.keralalotteryresultstoday.in",
      logo: {
        "@type": "ImageObject",
        url: "https://www.keralalotteryresultstoday.in/logo-master-1024.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    keywords: post.tags.join(", "),
  };

  // 2. Breadcrumbs Schema
  const breadcrumbSchema = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  // 3. FAQPage Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}
