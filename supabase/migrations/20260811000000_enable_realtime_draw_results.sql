-- Enable Realtime for draw_results table in Supabase
-- This allows Web & Mobile apps to listen to instant postgres_changes when cron job updates results

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'draw_results'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE draw_results;
  END IF;
END $$;
