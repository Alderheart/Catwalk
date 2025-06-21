-- Add coins column to users table
ALTER TABLE public.users ADD COLUMN coins INTEGER NOT NULL DEFAULT 100;

-- Add constraint for coins values (cannot be negative)
ALTER TABLE public.users ADD CONSTRAINT users_coins_min CHECK (coins >= 0);

-- Create index for better query performance
CREATE INDEX idx_users_coins ON public.users(coins);