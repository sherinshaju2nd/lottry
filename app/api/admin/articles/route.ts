import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { FOUNDER } from "@/lib/siteAuthor";
import {
  Article,
  ArticleFaq,
  estimateReadingMinutes,
  getArticlePath,
  isArticleCategory,
  isSafeHttpUrl,
  isValidSlug,
  normalizeArticle,
  slugify,
} from "@/lib/articles";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json(
    { success: false, error: "Unauthorized: Admin session required" },
    { status: 401 },
  );

const badRequest = (error: string) =>
  NextResponse.json({ success: false, error }, { status: 400 });

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error
    ? err.message
    : String((err as { message?: string })?.message ?? fallback);

const str = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const optionalUrl = (value: unknown): string | null => {
  const url = str(value, 1000);
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return isSafeHttpUrl(url) ? url : null;
};

type ArticleInput = Omit<
  Article,
  "id" | "created_at" | "updated_at" | "view_count"
>;

/** Validates & normalises the editor payload. Returns an error string or the clean row. */
const parseArticleInput = (
  body: Record<string, unknown>,
): { error: string } | { value: ArticleInput } => {
  const title = str(body?.title, 200);
  if (title.length < 3)
    return { error: "Title must be at least 3 characters." };

  const slug = slugify(str(body?.slug, 200) || title);
  if (!isValidSlug(slug))
    return {
      error: "Slug may only contain lowercase letters, numbers and dashes.",
    };

  const category = body?.category;
  if (!isArticleCategory(category)) return { error: "Invalid category." };

  const status = body?.status === "published" ? "published" : "draft";
  const content =
    typeof body?.content === "string" ? body.content.slice(0, 200_000) : "";

  let publishedAt: string | null = null;
  if (typeof body?.published_at === "string" && body.published_at) {
    const parsed = new Date(body.published_at);
    if (Number.isNaN(parsed.getTime()))
      return { error: "Invalid publish date." };
    publishedAt = parsed.toISOString();
  }
  if (status === "published" && !publishedAt)
    publishedAt = new Date().toISOString();

  const coverImageUrl = optionalUrl(body?.cover_image_url);
  if (str(body?.cover_image_url, 1000) && !coverImageUrl)
    return { error: "Cover image must be an http(s) URL." };
  const canonicalUrl = optionalUrl(body?.canonical_url);
  if (str(body?.canonical_url, 1000) && !canonicalUrl)
    return { error: "Canonical URL must be an http(s) URL." };

  const tags = Array.isArray(body?.tags)
    ? [...new Set(body.tags.map((t) => str(t, 40)).filter(Boolean))].slice(
        0,
        15,
      )
    : [];

  const faqs: ArticleFaq[] = Array.isArray(body?.faqs)
    ? body.faqs
        .map((f: unknown) => ({
          question: str((f as ArticleFaq)?.question, 300),
          answer: str((f as ArticleFaq)?.answer, 2000),
        }))
        .filter(({ question, answer }) => question && answer)
        .slice(0, 20)
    : [];

  return {
    value: {
      slug,
      title,
      excerpt: str(body?.excerpt, 500),
      content,
      cover_image_url: coverImageUrl,
      cover_image_alt: str(body?.cover_image_alt, 200) || null,
      category,
      tags,
      author_name:
        str(body?.author_name, 80) || FOUNDER.name,
      status,
      is_featured: body?.is_featured === true,
      published_at: publishedAt,
      reading_minutes: estimateReadingMinutes(content),
      meta_title: str(body?.meta_title, 120) || null,
      meta_description: str(body?.meta_description, 320) || null,
      focus_keyword: str(body?.focus_keyword, 100) || null,
      canonical_url: canonicalUrl,
      og_image_url: optionalUrl(body?.og_image_url),
      noindex: body?.noindex === true,
      faqs,
    },
  };
};

/** Refresh every page that lists or renders the article. */
const revalidateArticlePages = (...slugs: (string | null | undefined)[]) => {
  try {
    revalidatePath("/blog"); // merged Articles & News listing
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
    revalidatePath("/");
    [...new Set(slugs.filter(Boolean))].forEach((slug) =>
      revalidatePath(getArticlePath(slug as string)),
    );
  } catch (err: unknown) {
    console.error(
      "[admin/articles] revalidate failed:",
      errorMessage(err, "revalidate error"),
    );
  }
};

/** GET: every article incl. drafts & scheduled (admin only). */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) return unauthorized();
  try {
    const { data, error } = await supabaseServer
      .from("articles")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return NextResponse.json({
      success: true,
      articles: (data ?? []).map(normalizeArticle),
    });
  } catch (err: unknown) {
    const message = errorMessage(err, "Failed to load articles");
    console.error("[admin/articles] GET failed:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

/** POST: create (no id) or update (with id). */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be JSON.");
  }

  const parsed = parseArticleInput(body ?? {});
  if ("error" in parsed) return badRequest(parsed.error);
  const { value } = parsed;
  const id = typeof body?.id === "string" && body.id ? body.id : null;

  try {
    // Only one featured article at a time keeps the feed hero predictable.
    if (value.is_featured) {
      const unfeature = supabaseServer
        .from("articles")
        .update({ is_featured: false })
        .eq("is_featured", true);
      const { error: unfeatureError } = id
        ? await unfeature.neq("id", id)
        : await unfeature;
      if (unfeatureError) throw unfeatureError;
    }

    let previousSlug: string | null = null;
    if (id) {
      const { data: existing, error: existingError } = await supabaseServer
        .from("articles")
        .select("slug")
        .eq("id", id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (!existing)
        return NextResponse.json(
          { success: false, error: "Article not found." },
          { status: 404 },
        );
      previousSlug = existing.slug;
    }

    const query = id
      ? supabaseServer.from("articles").update(value).eq("id", id)
      : supabaseServer.from("articles").insert(value);
    const { data, error } = await query.select("*").single();

    if (error) {
      if (error.code === "23505")
        return badRequest(
          `The slug “${value.slug}” is already used by another article.`,
        );
      throw error;
    }

    revalidateArticlePages(previousSlug, value.slug);
    return NextResponse.json({
      success: true,
      message: id ? "Article updated." : "Article created.",
      article: normalizeArticle(data),
    });
  } catch (err: unknown) {
    const message = errorMessage(err, "Failed to save article");
    console.error("[admin/articles] POST failed:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

/** DELETE ?id=<uuid> */
export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id))
    return badRequest("Missing or invalid id parameter.");

  try {
    const { data, error } = await supabaseServer
      .from("articles")
      .delete()
      .eq("id", id)
      .select("slug")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json(
        { success: false, error: "Article not found." },
        { status: 404 },
      );

    revalidateArticlePages(data.slug);
    return NextResponse.json({ success: true, message: "Article deleted." });
  } catch (err: unknown) {
    const message = errorMessage(err, "Failed to delete article");
    console.error("[admin/articles] DELETE failed:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
