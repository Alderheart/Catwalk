-- Add energy system fields to users table
ALTER TABLE public.users 
ADD COLUMN daily_energy INTEGER NOT NULL DEFAULT 5,
ADD COLUMN max_daily_energy INTEGER NOT NULL DEFAULT 5,
ADD COLUMN energy_regen_rate_minutes INTEGER NOT NULL DEFAULT 15,
ADD COLUMN last_energy_update TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add constraints for energy values
ALTER TABLE public.users 
ADD CONSTRAINT users_daily_energy_min CHECK (daily_energy >= 0),
ADD CONSTRAINT users_daily_energy_max CHECK (daily_energy <= max_daily_energy),
ADD CONSTRAINT users_max_daily_energy_min CHECK (max_daily_energy >= 1),
ADD CONSTRAINT users_energy_regen_rate_min CHECK (energy_regen_rate_minutes >= 1);

-- Create indexes for better query performance
CREATE INDEX idx_users_daily_energy ON public.users(daily_energy);
CREATE INDEX idx_users_last_energy_update ON public.users(last_energy_update);

-- Add comment explaining the energy system
COMMENT ON COLUMN public.users.daily_energy IS 'Current daily energy/plays remaining';
COMMENT ON COLUMN public.users.max_daily_energy IS 'Maximum daily energy (upgradeable)';
COMMENT ON COLUMN public.users.energy_regen_rate_minutes IS 'Minutes required to regenerate 1 energy point';
COMMENT ON COLUMN public.users.last_energy_update IS 'Timestamp of last energy calculation for regeneration';