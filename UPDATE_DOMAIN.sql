-- ==============================================================================
-- UPDATE WEBSITE DOMAIN URL FOR SUPABASE PG_CRON
-- ==============================================================================
-- WHAT IS app_url?
-- `app_url` is the public web address (URL) where your website is hosted 
-- (e.g., https://lottry-fawn.vercel.app or https://your-custom-domain.com).
-- Supabase pg_cron uses this URL to automatically trigger the lottery sync at:
-- [app_url]/api/cron
--
-- Whenever your website domain changes in the future:
-- 1. Open Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard)
-- 2. Update the domain URL below and click RUN.
-- ==============================================================================

-- 1. Update the domain URL (Replace 'https://lottry-fawn.vercel.app' with your new domain):
UPDATE public.app_config 
SET value = 'https://lottry-fawn.vercel.app' 
WHERE key = 'app_url';

-- 2. Verify your updated domain URL:
SELECT * FROM public.app_config WHERE key = 'app_url';

-- 3. Test triggering the lottery sync immediately:
SELECT public.trigger_lottery_sync();

-- 4. Check the HTTP response status:
SELECT id, status_code, content, created FROM net._http_response ORDER BY created DESC LIMIT 1;
