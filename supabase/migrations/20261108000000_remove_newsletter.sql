-- Migration: 20261108000000_remove_newsletter.sql
--
-- Removes the newsletter feature (sign-ups were collected but no email was ever sent).
--   1. Articles in the old "newsletter" category move to "news".
--   2. The category is no longer allowed.
--   3. The newsletter_subscribers table is DROPPED — this permanently deletes every
--      stored subscriber email. Export it first if you want to keep a copy:
--        SELECT email, source, created_at FROM public.newsletter_subscribers;
--
-- Run in the Supabase SQL editor. Safe to re-run (idempotent).

BEGIN;

UPDATE public.articles SET category = 'news' WHERE category = 'newsletter';

ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles
  ADD CONSTRAINT articles_category_check
  CHECK (category IN ('news', 'guide', 'tips', 'announcement', 'bumper'));

DROP TABLE IF EXISTS public.newsletter_subscribers;

COMMIT;
