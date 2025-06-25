-- Create atomic energy consumption function to prevent race conditions
-- This function handles energy regeneration and consumption in a single atomic operation

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
  -- Lock the user row to prevent concurrent modifications
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
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
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
      UPDATE users 
      SET 
        daily_energy = v_regenerated_energy,
        last_energy_update = p_current_time
      WHERE id = p_user_id;
    END IF;
    
    RAISE EXCEPTION 'Insufficient energy. Required: %, Available: %', p_amount, v_regenerated_energy;
  END IF;

  -- Consume energy
  v_final_energy := v_regenerated_energy - p_amount;
  
  -- Update user's energy and last update time
  UPDATE users 
  SET 
    daily_energy = v_final_energy,
    last_energy_update = p_current_time
  WHERE id = p_user_id;

  -- Return the result
  RETURN QUERY SELECT v_final_energy, v_max_daily_energy, TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION consume_energy_atomic TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION consume_energy_atomic IS 'Atomically consumes user energy with automatic regeneration calculation to prevent race conditions';