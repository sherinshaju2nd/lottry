-- ==============================================================================
-- SUPABASE PG_CRON & PG_NET SETUP FOR KERALA LOTTERY SYNC
-- ==============================================================================
-- Target Domain: https://lottry-fawn.vercel.app
--
-- How it works:
-- 1. Website domain and CRON_SECRET are stored dynamically in `public.app_config`.
-- 2. If your website domain changes in the future, you only need to run:
--    UPDATE public.app_config SET value = 'https://new-domain.com' WHERE key = 'app_url';
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create Dynamic Configuration Table
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for app_config table
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'app_config' AND policyname = 'Allow public read access on app_config'
    ) THEN
        CREATE POLICY "Allow public read access on app_config" ON public.app_config FOR SELECT USING (true);
    END IF;
END $$;

-- Seed initial App URL & Cron Secret
INSERT INTO public.app_config (key, value)
VALUES 
    ('app_url', 'https://www.keralalotteryresultstoday.in'),
    ('cron_secret', 'kerala_lottery_cron_secret_2026')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- 3. Clean up existing lottery sync cron jobs (prevents duplicates)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT jobname FROM cron.job WHERE jobname LIKE 'lottery_sync_%' LOOP
        PERFORM cron.unschedule(r.jobname);
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron job cleanup notice: %', SQLERRM;
END $$;

-- 4. Create stored function to trigger Next.js API /api/cron route via pg_net (GET method)
CREATE OR REPLACE FUNCTION public.trigger_lottery_sync(
    target_app_url TEXT DEFAULT NULL,
    target_secret TEXT DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, pg_temp
AS $$
DECLARE
    req_id bigint;
    final_app_url text;
    final_secret text;
    target_endpoint text;
    req_headers jsonb;
BEGIN
    -- Fetch app_url dynamically from app_config if not passed explicitly
    IF target_app_url IS NULL OR target_app_url = '' THEN
        SELECT value INTO final_app_url FROM public.app_config WHERE key = 'app_url';
    ELSE
        final_app_url := target_app_url;
    END IF;

    -- Fetch cron_secret dynamically from app_config if not passed explicitly
    IF target_secret IS NULL OR target_secret = '' THEN
        SELECT value INTO final_secret FROM public.app_config WHERE key = 'cron_secret';
    ELSE
        final_secret := target_secret;
    END IF;

    -- Fallback default if app_config row is missing
    IF final_app_url IS NULL OR final_app_url = '' THEN
        final_app_url := 'https://www.keralalotteryresultstoday.in';
    END IF;

    target_endpoint := rtrim(final_app_url, '/') || '/api/cron';

    IF final_secret IS NOT NULL AND final_secret != '' THEN
        req_headers := jsonb_build_object(
            'Authorization', 'Bearer ' || final_secret,
            'User-Agent', 'Supabase-pg_cron/1.0'
        );
    ELSE
        req_headers := jsonb_build_object(
            'User-Agent', 'Supabase-pg_cron/1.0'
        );
    END IF;

    -- Send non-blocking HTTP GET request (compatible with live Vercel deployment & future builds)
    SELECT net.http_get(
        url := target_endpoint,
        headers := req_headers
    ) INTO req_id;

    RETURN req_id;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in trigger_lottery_sync: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- ==============================================================================
-- 5. Schedule Cron Jobs (Times converted from Indian Standard Time IST to UTC)
--
-- IST is UTC + 05:30. pg_cron runs on UTC clock.
-- ------------------------------------------------------------------------------
--  3:00 PM - 3:57 PM IST | 09:30 AM - 09:57 AM UTC | every 3 min | lottery_sync_3pm_to_357pm_ist
--  4:00 PM - 4:30 PM IST | 10:00 AM - 10:30 AM UTC | every 3 min | lottery_sync_4pm_ist
-- ==============================================================================

SELECT cron.schedule(
    'lottery_sync_3pm_to_357pm_ist',
    '30,33,36,39,42,45,48,51,54,57 9 * * *',
    $$SELECT public.trigger_lottery_sync();$$
);

SELECT cron.schedule(
    'lottery_sync_4pm_ist',
    '0,3,6,9,12,15,18,21,24,27,30 10 * * *',
    $$SELECT public.trigger_lottery_sync();$$
);

SELECT cron.schedule(
    'lottery_sync_4_15_pm_ist',
    '45 10 * * *',
    $$SELECT public.trigger_lottery_sync();$$
);

SELECT cron.schedule(
    'lottery_sync_4_30_pm_ist',
    '0 11 * * *',
    $$SELECT public.trigger_lottery_sync();$$
);

SELECT cron.schedule(
    'lottery_sync_5_00_pm_ist',
    '30 11 * * *',
    $$SELECT public.trigger_lottery_sync();$$
);

-- ==============================================================================
-- 6. HOW TO TEST OR UPDATE URL IN THE FUTURE:
-- ==============================================================================
-- A) To test immediately in Supabase SQL Editor:
-- SELECT public.trigger_lottery_sync();

-- B) To update your website URL if domain changes in future:
-- UPDATE public.app_config SET value = 'https://your-new-domain.com' WHERE key = 'app_url';

-- C) View scheduled jobs & logs:
-- SELECT * FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
-- D) View HTTP response status from pg_net:
-- SELECT id, status_code, content, created FROM net._http_response ORDER BY created DESC LIMIT 10;
