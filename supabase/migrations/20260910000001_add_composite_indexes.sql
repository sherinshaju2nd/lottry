-- High-Performance Composite Indexes for Kerala Lottery Platform
-- Speeds up date-based lookups, lottery history filtering, and postpone checks

-- 1. Index on draw_results for instant date + code filtering & sorting
CREATE INDEX IF NOT EXISTS idx_draw_results_date_code 
  ON public.draw_results (draw_date DESC, lottery_code);

CREATE INDEX IF NOT EXISTS idx_draw_results_created 
  ON public.draw_results (created_at DESC);

-- 2. Index on postponed_draws for fast date checks
CREATE INDEX IF NOT EXISTS idx_postponed_draws_date_code 
  ON public.postponed_draws (draw_date, lottery_code);

-- 3. Index on lotteries for scheduled draw dates
CREATE INDEX IF NOT EXISTS idx_lotteries_draw_date 
  ON public.lotteries (draw_date);

CREATE INDEX IF NOT EXISTS idx_lotteries_code 
  ON public.lotteries (code);
