-- Fix database constraints that may not have been applied correctly

-- Ensure gender constraint is properly applied
ALTER TABLE public.cats DROP CONSTRAINT IF EXISTS cats_gender_check;
ALTER TABLE public.cats ADD CONSTRAINT cats_gender_check CHECK (gender IN ('male', 'female'));

-- Ensure moons constraint is properly applied  
ALTER TABLE public.cats DROP CONSTRAINT IF EXISTS cats_moons_check;
ALTER TABLE public.cats ADD CONSTRAINT cats_moons_check CHECK (moons >= 0);

-- Add name length constraint for security
ALTER TABLE public.cats ADD CONSTRAINT cats_name_length CHECK (char_length(name) BETWEEN 1 AND 50);

-- Add skill and trait constraints for data integrity
ALTER TABLE public.cats ADD CONSTRAINT cats_skill_length CHECK (char_length(skill) BETWEEN 1 AND 30);
ALTER TABLE public.cats ADD CONSTRAINT cats_trait_length CHECK (char_length(trait) BETWEEN 1 AND 30);

-- Add username constraints for users table
ALTER TABLE public.users ADD CONSTRAINT users_username_length CHECK (char_length(username) BETWEEN 3 AND 30);
ALTER TABLE public.users ADD CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9_]+$');