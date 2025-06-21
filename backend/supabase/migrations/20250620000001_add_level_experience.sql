-- Add level, experience, and max_level columns to cats table
ALTER TABLE public.cats ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.cats ADD COLUMN experience INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.cats ADD COLUMN max_level INTEGER NOT NULL DEFAULT 20;

-- Add constraints for level values
ALTER TABLE public.cats ADD CONSTRAINT cats_level_min CHECK (level >= 1);
ALTER TABLE public.cats ADD CONSTRAINT cats_level_max CHECK (level <= max_level);

-- Add constraints for experience values
ALTER TABLE public.cats ADD CONSTRAINT cats_experience_min CHECK (experience >= 0);

-- Add constraint for max_level values
ALTER TABLE public.cats ADD CONSTRAINT cats_max_level_min CHECK (max_level >= 1);

-- Create indexes for better query performance
CREATE INDEX idx_cats_level ON public.cats(level);
CREATE INDEX idx_cats_experience ON public.cats(experience);