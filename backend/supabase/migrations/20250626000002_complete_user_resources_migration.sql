-- Complete the user_resources migration safely
-- This handles the case where columns were already dropped but data wasn't migrated

-- Check if we need to create default user_resources records for existing users
INSERT INTO public.user_resources (user_id, coins, daily_energy, max_daily_energy, energy_regen_rate_minutes, last_energy_update)
SELECT 
    u.id,
    100,  -- default coins
    5,    -- default daily_energy
    5,    -- default max_daily_energy
    15,   -- default energy_regen_rate_minutes
    NOW() -- default last_energy_update
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_resources ur 
    WHERE ur.user_id = u.id
);

-- Ensure the consume_energy_atomic function is updated to use user_resources
CREATE OR REPLACE FUNCTION consume_energy_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_current_time TIMESTAMPTZ
)
RETURNS TABLE (
  new_energy INTEGER,
  max_energy INTEGER,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_energy INTEGER;
  v_max_daily_energy INTEGER;
  v_regen_rate_minutes INTEGER;
  v_last_update TIMESTAMPTZ;
  v_minutes_passed INTEGER;
  v_energy_to_add INTEGER;
  v_regenerated_energy INTEGER;
  v_final_energy INTEGER;
BEGIN
  -- Lock the user_resources row to prevent concurrent modifications
  SELECT 
    daily_energy,
    max_daily_energy,
    energy_regen_rate_minutes,
    last_energy_update
  INTO 
    v_current_energy,
    v_max_daily_energy,
    v_regen_rate_minutes,
    v_last_update
  FROM user_resources
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user resources exist
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, FALSE;
    RETURN;
  END IF;

  -- Calculate energy regeneration
  v_minutes_passed := EXTRACT(EPOCH FROM (p_current_time - v_last_update)) / 60;
  
  IF v_minutes_passed >= v_regen_rate_minutes AND v_current_energy < v_max_daily_energy THEN
    v_energy_to_add := FLOOR(v_minutes_passed / v_regen_rate_minutes);
    v_regenerated_energy := LEAST(v_current_energy + v_energy_to_add, v_max_daily_energy);
  ELSE
    v_regenerated_energy := v_current_energy;
  END IF;

  -- Check if user has enough energy after regeneration
  IF v_regenerated_energy < p_amount THEN
    -- Update energy with regeneration even if consumption fails
    IF v_regenerated_energy > v_current_energy THEN
      UPDATE user_resources 
      SET 
        daily_energy = v_regenerated_energy,
        last_energy_update = p_current_time
      WHERE user_id = p_user_id;
    END IF;
    
    RAISE EXCEPTION 'Insufficient energy. Required: %, Available: %', p_amount, v_regenerated_energy;
  END IF;

  -- Consume energy
  v_final_energy := v_regenerated_energy - p_amount;
  
  -- Update user's energy and last update time
  UPDATE user_resources 
  SET 
    daily_energy = v_final_energy,
    last_energy_update = p_current_time
  WHERE user_id = p_user_id;

  -- Return the result
  RETURN QUERY SELECT v_final_energy, v_max_daily_energy, TRUE;
END;
$$;

-- Update the handle_new_user function to create user_resources for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
    );
    
    -- Create user resources with default values
    INSERT INTO public.user_resources (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;