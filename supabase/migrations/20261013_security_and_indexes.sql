-- Migration: 20261013_security_and_indexes.sql
-- 1. Performance Composite Indexes
-- Speeds up queries for lottery code + date sorting and cron execution inspection
CREATE INDEX IF NOT EXISTS idx_draw_results_code_date
  ON public.draw_results (lottery_code, draw_date DESC);

CREATE INDEX IF NOT EXISTS idx_cron_logs_execution_time
  ON public.cron_logs (execution_time DESC);

-- 2. Security Hardening (RLS Policies)
-- IMPORTANT PREREQUISITE:
-- Ensure SUPABASE_SERVICE_ROLE_KEY is configured in your Vercel environment variables
-- before executing the RLS hardening block below.
-- The Next.js backend uses supabaseServer (service role) to run sync and admin operations,
-- which bypasses RLS automatically. Anonymous visitors and mobile users only need SELECT.

/*
-- Drop overly-permissive anonymous write policies:
DROP POLICY IF EXISTS "Allow public insert/update on draw_results" ON public.draw_results;
DROP POLICY IF EXISTS "Allow public insert/update on lotteries" ON public.lotteries;
DROP POLICY IF EXISTS "Allow public insert/update on ai_pattern_predictions" ON public.ai_pattern_predictions;

-- Verify public read (SELECT) remains active:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'draw_results' AND policyname = 'Allow public read access on draw_results'
  ) THEN
    CREATE POLICY "Allow public read access on draw_results" ON public.draw_results FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lotteries' AND policyname = 'Allow public read access on lotteries'
  ) THEN
    CREATE POLICY "Allow public read access on lotteries" ON public.lotteries FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_pattern_predictions' AND policyname = 'Allow public read on ai_pattern_predictions'
  ) THEN
    CREATE POLICY "Allow public read on ai_pattern_predictions" ON public.ai_pattern_predictions FOR SELECT USING (true);
  END IF;
END $$;
*/
