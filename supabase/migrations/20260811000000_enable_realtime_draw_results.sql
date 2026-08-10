-- Safely ensure draw_results is in supabase_realtime publication
-- Catches duplicate_object exception (42710) if already added

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE draw_results;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Already member of publication "supabase_realtime"
      RAISE NOTICE 'Table draw_results is already in supabase_realtime publication';
  END;
END $$;
