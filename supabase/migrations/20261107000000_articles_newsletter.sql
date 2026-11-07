-- Migration: 20261107000000_articles_newsletter.sql
--
-- Articles / newsletter feed managed from /admin and shown on the website (/news) and the
-- mobile app (News screen).
--
-- Security model (same as 20261104000000_lock_down_public_writes.sql):
--   * anon / authenticated: SELECT published articles only (status = 'published' AND
--     published_at <= now()). Drafts and scheduled posts are invisible to the public key.
--   * All writes go through the Next.js admin API using SUPABASE_SERVICE_ROLE_KEY
--     (service_role bypasses RLS). No public write policy exists.
--   * newsletter_subscribers has NO public policy at all (server-only).
--   * increment_article_view() is the only public "write": a SECURITY DEFINER function that
--     can do nothing except bump the view counter of a published article.
--
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

BEGIN;

-- 1. Articles -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE
                    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 120),
  title             text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  excerpt           text NOT NULL DEFAULT '' CHECK (char_length(excerpt) <= 500),
  content           text NOT NULL DEFAULT '',            -- Markdown
  cover_image_url   text,
  cover_image_alt   text,
  category          text NOT NULL DEFAULT 'news'
                    CHECK (category IN ('news', 'newsletter', 'guide', 'tips', 'announcement', 'bumper')),
  tags              text[] NOT NULL DEFAULT '{}',
  author_name       text NOT NULL DEFAULT 'Kerala Lottery Desk',
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured       boolean NOT NULL DEFAULT false,
  published_at      timestamptz,                          -- future date = scheduled
  reading_minutes   integer NOT NULL DEFAULT 1 CHECK (reading_minutes >= 1),
  view_count        integer NOT NULL DEFAULT 0,
  -- SEO
  meta_title        text CHECK (char_length(meta_title) <= 120),
  meta_description  text CHECK (char_length(meta_description) <= 320),
  focus_keyword     text,
  canonical_url     text,
  og_image_url      text,
  noindex           boolean NOT NULL DEFAULT false,
  faqs              jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(faqs) = 'array'),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Feed query: published, newest first (optionally by category)
CREATE INDEX IF NOT EXISTS idx_articles_published_feed
  ON public.articles (published_at DESC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_category_published
  ON public.articles (category, published_at DESC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING gin (tags);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  -- view-counter bumps must not change updated_at (it feeds sitemap lastmod / dateModified)
  WHEN ((to_jsonb(OLD) - 'view_count' - 'updated_at') IS DISTINCT FROM (to_jsonb(NEW) - 'view_count' - 'updated_at'))
  EXECUTE FUNCTION public.set_articles_updated_at();

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_published_articles" ON public.articles;
CREATE POLICY "public_read_published_articles" ON public.articles
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.articles FROM anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;

-- 2. View counter (public, but can only increment a published article) --------------------
CREATE OR REPLACE FUNCTION public.increment_article_view(p_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles
     SET view_count = view_count + 1
   WHERE slug = p_slug
     AND status = 'published'
     AND published_at <= now();
$$;

REVOKE ALL ON FUNCTION public.increment_article_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_article_view(text) TO anon, authenticated;

-- 3. Newsletter subscribers (server-only) -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         text NOT NULL UNIQUE CHECK (char_length(email) <= 254),
  source        text NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'mobile')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;

-- 4. Storage bucket for article images (public read; uploads via service role only) -------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images', 'article-images', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
