-- Complete Supabase Realtime Setup for Live Draw Updates
-- Ensures tables are in supabase_realtime publication with REPLICA IDENTITY FULL

-- 1. Set REPLICA IDENTITY FULL so UPDATE/DELETE events contain complete payload
ALTER TABLE IF EXISTS draw_results REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS lotteries REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS postponed_draws REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS app_config REPLICA IDENTITY FULL;

-- 2. Safely add tables to supabase_realtime publication
DO $$
BEGIN
  -- draw_results
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE draw_results;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table draw_results is already in supabase_realtime';
  END;

  -- lotteries
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE lotteries;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table lotteries is already in supabase_realtime';
  END;

  -- postponed_draws
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE postponed_draws;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table postponed_draws is already in supabase_realtime';
  END;

  -- app_config
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE app_config;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table app_config is already in supabase_realtime';
  END;
END $$;
