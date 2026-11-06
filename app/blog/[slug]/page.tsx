import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBlogs, getBlogBySlug, getBlogUrl, resolveBlogPost } from "@/data/blogs";
import BlogPostClient from "@/components/BlogPostClient";
import { getBlogDrawContext } from "@/lib/blogDraw";

// Draw dates come from the DB (lotteries.draw_date) — refresh hourly
export const revalidate = 3600;
// Unknown slugs get a real 404 instead of a streamed notFound()
export const dynamicParams = false;

/** Loads a post with its {{drawDate}} tokens filled from the database. */
const loadPost = async (slug: string) => {
  const post = getBlogBySlug(slug);
  if (!post) return null;
  const draw = post.drawLotteryCode ? await getBlogDrawContext(post.drawLotteryCode) : null;
  return { post: resolveBlogPost(post, draw), draw };
};

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
  const loaded = await loadPost(slug);

  if (!loaded) {
    return {
      title: "Article Not Found | Kerala Lottery",
    };
  }

  const { post } = loaded;
  const url = getBlogUrl(post.slug);

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
      ...(post.coverImage && {
        images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const loaded = await loadPost(slug);

  if (!loaded) {
    notFound();
  }
  const { post, draw } = loaded;
  const aboutUrl = draw ? `https://www.keralalotteryresultstoday.in${draw.url}` : undefined;

  const pageUrl = getBlogUrl(post.slug);

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
    inLanguage: "en-IN",
    image: `https://www.keralalotteryresultstoday.in${post.coverImage ?? "/logo-master-1024.png"}`,
    // AEO: point voice assistants / answer engines at the summary blocks
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#quick-answer", "#faqs"],
    },
    ...(aboutUrl && {
      about: { "@type": "WebPage", "@id": aboutUrl, url: aboutUrl },
      mentions: [{ "@type": "WebPage", url: aboutUrl }],
    }),
  };

  // 4. HowTo Schema (optional, per post)
  const howToSchema = post.howTo && {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.howTo.name,
    step: post.howTo.steps.map((text, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: text,
      text,
    })),
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
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <BlogPostClient post={post} draw={draw} />
    </>
  );
}
