-- ==============================================================================
-- UPDATE WEBSITE DOMAIN URL FOR SUPABASE PG_CRON
-- ==============================================================================
-- `app_url` is stored in public.app_config.
-- Supabase pg_cron uses this URL to automatically trigger the lottery sync at:
-- [app_url]/api/cron
-- ==============================================================================

-- 1. Update the domain URL to your production domain:
UPDATE public.app_config 
SET value = 'https://www.keralalotteryresultstoday.in' 
WHERE key = 'app_url';

-- 2. Verify your updated domain URL:
SELECT * FROM public.app_config WHERE key = 'app_url';

-- 3. Test triggering the lottery sync immediately from Supabase:
SELECT public.trigger_lottery_sync();

-- 4. Check the HTTP response status log:
SELECT id, status_code, content, created FROM net._http_response ORDER BY created DESC LIMIT 5;
