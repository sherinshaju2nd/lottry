-- Migration: 20261104000000_lock_down_public_writes.sql
--
-- Blocks all writes with the public (anon / publishable) key. The website and the mobile
-- app keep read-only access; every write now goes through the Next.js server using
-- SUPABASE_SERVICE_ROLE_KEY (service_role bypasses RLS).
--
-- !! DEPLOY ORDER (otherwise syncing and admin saves stop working) !!
--   1. Set SUPABASE_SERVICE_ROLE_KEY in Vercel (Project → Settings → Environment Variables)
--      and redeploy the frontend that contains this change.
--   2. Run this file in the Supabase SQL editor.
--   3. Rotate the cron secret and the admin password: the old values were publicly
--      readable, so treat them as leaked. Set the SAME new value in both places:
--        - Vercel env CRON_SECRET
--        - UPDATE public.app_config SET value = '<new secret>' WHERE key = 'cron_secret';
--      (pg_cron sends the app_config value; /api/cron checks it against CRON_SECRET.)
--
-- Safe to re-run (idempotent).

BEGIN;

-- 1. Enable RLS and remove EVERY existing policy on the app tables (the old ones were
--    FOR ALL USING (true), i.e. public insert/update/delete).
DO $$
DECLARE
  t   text;
  pol record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'draw_results', 'lotteries', 'ai_pattern_predictions',
    'postponed_draws', 'app_config', 'cron_logs'
  ]
  LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- 2. Public tables: read-only for everyone (website, mobile app, realtime).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['draw_results', 'lotteries', 'ai_pattern_predictions', 'postponed_draws']
  LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format(
        'CREATE POLICY "public_read_%s" ON public.%I FOR SELECT TO anon, authenticated USING (true)',
        t, t
      );
    END IF;
  END LOOP;
END $$;

-- 3. app_config holds secrets (cron_secret, broadcast state, URLs). Only the mobile
--    AI-prediction cache rows (ai_pred_*) stay publicly readable. cron_secret stays in the
--    table because pg_cron's SECURITY DEFINER trigger_lottery_sync() reads it, but anon can
--    no longer see it. cron_logs gets no public policy at all (server-only).
DO $$
BEGIN
  IF to_regclass('public.app_config') IS NOT NULL THEN
    CREATE POLICY "public_read_ai_prediction_cache" ON public.app_config
      FOR SELECT TO anon, authenticated
      USING (key LIKE 'ai\_pred\_%');
  END IF;
END $$;

-- 4. Belt and braces: remove table-level write grants from the public roles.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'draw_results', 'lotteries', 'ai_pattern_predictions',
    'postponed_draws', 'app_config', 'cron_logs'
  ]
  LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.%I FROM anon, authenticated', t);
    END IF;
  END LOOP;
END $$;

-- 5. The SECURITY DEFINER cron trigger must not be callable through the public REST API
--    (anon could point it at any URL and receive the Bearer secret).
DO $$
DECLARE
  fn regprocedure;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'trigger_lottery_sync'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- 6. Legacy plaintext admin credentials table (migration.sql) — unused by the app.
DROP TABLE IF EXISTS public.admin_users;

-- 7. Stop broadcasting config/log changes (secrets) over realtime.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_config'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.app_config;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cron_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.cron_logs;
  END IF;
END $$;

COMMIT;
