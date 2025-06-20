-- Add breed column to cats table
ALTER TABLE public.cats ADD COLUMN breed TEXT;

-- Add constraint for breed values (optional, allows NULL for existing cats)
ALTER TABLE public.cats ADD CONSTRAINT cats_breed_length CHECK (breed IS NULL OR char_length(breed) BETWEEN 1 AND 20);

-- Create index for breed column for better query performance
CREATE INDEX idx_cats_breed ON public.cats(breed);