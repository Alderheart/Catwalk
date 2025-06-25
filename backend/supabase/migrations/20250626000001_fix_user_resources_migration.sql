-- This migration fixes the partial application of the user_resources refactor
-- It handles the case where the table was created but the migration didn't complete

-- Only migrate data if it hasn't been migrated yet
INSERT INTO public.user_resources (user_id, coins, daily_energy, max_daily_energy, energy_regen_rate_minutes, last_energy_update)
SELECT 
    id,
    coins,
    daily_energy,
    max_daily_energy,
    energy_regen_rate_minutes,
    last_energy_update
FROM public.users
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'coins'
)
AND NOT EXISTS (
    SELECT 1 FROM public.user_resources 
    WHERE user_resources.user_id = users.id
);

-- Only drop columns if they still exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'coins') THEN
        ALTER TABLE public.users DROP COLUMN coins;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'daily_energy') THEN
        ALTER TABLE public.users DROP COLUMN daily_energy;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'max_daily_energy') THEN
        ALTER TABLE public.users DROP COLUMN max_daily_energy;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'energy_regen_rate_minutes') THEN
        ALTER TABLE public.users DROP COLUMN energy_regen_rate_minutes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_energy_update') THEN
        ALTER TABLE public.users DROP COLUMN last_energy_update;
    END IF;
END $$;