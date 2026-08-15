-- ==============================================================================
-- PRODUCTION SUPABASE PG_CRON & PG_NET SETUP FOR KERALA LOTTERY
-- ==============================================================================
-- Features:
-- 1. Automated 1-minute cron ping (08:00 to 13:00 UTC = 1:30 PM to 6:30 PM IST).
-- 2. Fully dynamic: reads app_url, secret, and timing parameters from app_config.
-- 3. Idempotent: can be executed repeatedly in Supabase SQL Editor with 0 errors.
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

-- Enable RLS and grant full read/write access for admin operations
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'app_config' AND policyname = 'Allow public full access on app_config'
    ) THEN
        CREATE POLICY "Allow public full access on app_config" ON public.app_config FOR ALL USING (true);
    END IF;
END $$;

-- Seed default configuration keys into app_config
INSERT INTO public.app_config (key, value)
VALUES 
    ('app_url', 'https://www.keralalotteryresultstoday.in'),
    ('cron_secret', 'kerala_lottery_cron_secret_2026'),
    ('cron_enabled', 'true'),
    ('cron_start_time', '15:00'),
    ('cron_phase1_end_time', '16:00'),
    ('cron_end_time', '17:00'),
    ('cron_frequency_mins', '1'),
    ('cron_phase2_frequency_mins', '5'),
    ('cron_bumper_start_time', '14:00'),
    ('cron_bumper_phase1_end_time', '16:00'),
    ('cron_bumper_end_time', '18:00'),
    ('cron_bumper_frequency_mins', '1'),
    ('cron_bumper_phase2_frequency_mins', '5')
ON CONFLICT (key) DO NOTHING;

-- 3. Clean up existing lottery sync cron jobs (prevents duplicate job errors)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT jobname FROM cron.job WHERE jobname LIKE 'lottery_sync%' OR jobname LIKE 'kerala_lottery%' LOOP
        PERFORM cron.unschedule(r.jobname);
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron job cleanup notice: %', SQLERRM;
END $$;

-- 4. Create stored function to trigger Next.js API /api/cron route via pg_net
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
    -- Fetch app_url dynamically from app_config
    IF target_app_url IS NULL OR target_app_url = '' THEN
        SELECT value INTO final_app_url FROM public.app_config WHERE key = 'app_url';
    ELSE
        final_app_url := target_app_url;
    END IF;

    -- Fetch cron_secret dynamically from app_config
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

    -- Send non-blocking HTTP GET request to /api/cron
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

-- 5. Schedule continuous 1-minute cron job (08:00 to 13:00 UTC = 1:30 PM to 6:30 PM IST daily)
SELECT cron.schedule(
    'lottery_sync_master_daily',
    '* 8-13 * * *',
    $$SELECT public.trigger_lottery_sync();$$
);
