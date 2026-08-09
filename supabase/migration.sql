-- Migration Script for Kerala Lottery Supabase Database

-- 1. Create Lotteries Table
CREATE TABLE IF NOT EXISTS public.lotteries (
    id SERIAL PRIMARY KEY,
    day VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    draw_time VARCHAR(20) DEFAULT '3:00 PM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Draw Results Table
CREATE TABLE IF NOT EXISTS public.draw_results (
    id SERIAL PRIMARY KEY,
    draw_date DATE NOT NULL,
    draw_name VARCHAR(100) NOT NULL,
    draw_code VARCHAR(50) NOT NULL,
    lottery_code VARCHAR(20) NOT NULL,
    first_prize JSONB NOT NULL DEFAULT '{}'::jsonb,
    prizes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_date_lottery UNIQUE (draw_date, lottery_code)
);

-- 3. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Seed Weekly Lotteries Master Data
INSERT INTO public.lotteries (day, name, code, draw_time) VALUES
('Monday', 'Bhagyathara', 'BT', '3:00 PM'),
('Tuesday', 'Sthree Sakthi', 'SS', '3:00 PM'),
('Wednesday', 'Dhanalekshmi', 'DL', '3:00 PM'),
('Thursday', 'Karunya Plus', 'KN', '3:00 PM'),
('Friday', 'Suvarna Keralam', 'SK', '3:00 PM'),
('Saturday', 'Karunya', 'KR', '3:00 PM'),
('Sunday', 'Samrudhi', 'SM', '3:00 PM')
ON CONFLICT (code) DO UPDATE SET
    day = EXCLUDED.day,
    name = EXCLUDED.name,
    draw_time = EXCLUDED.draw_time;

-- 5. Seed Default Admin
INSERT INTO public.admin_users (username, password) VALUES
('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;
