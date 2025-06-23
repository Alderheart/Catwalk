-- Add missing DELETE policies for expedition tables
-- This fixes the issue where expedition cleanup was silently failing due to missing RLS DELETE policies

-- First, create the missing expedition_minigames table
CREATE TABLE IF NOT EXISTS public.expedition_minigames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
    card_position INTEGER NOT NULL CHECK (card_position >= 0),
    tarot_card_name TEXT NOT NULL,
    orientation TEXT NOT NULL CHECK (orientation IN ('upright', 'reversed')) DEFAULT 'upright',
    minigame_type TEXT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    score INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique card position per expedition
    UNIQUE(expedition_id, card_position)
);

-- Fix expedition_cards table to use tarot cards instead of playing cards
ALTER TABLE public.expedition_cards DROP CONSTRAINT IF EXISTS expedition_cards_card_value_check;
ALTER TABLE public.expedition_cards DROP CONSTRAINT IF EXISTS expedition_cards_card_suit_check;
ALTER TABLE public.expedition_cards DROP COLUMN IF EXISTS card_value;
ALTER TABLE public.expedition_cards DROP COLUMN IF EXISTS card_suit;
ALTER TABLE public.expedition_cards ADD COLUMN IF NOT EXISTS tarot_card_name TEXT NOT NULL DEFAULT 'The Fool';

-- Enable RLS on expedition_minigames
ALTER TABLE public.expedition_minigames ENABLE ROW LEVEL SECURITY;

-- Create index for expedition_minigames
CREATE INDEX IF NOT EXISTS idx_expedition_minigames_expedition_id ON public.expedition_minigames(expedition_id);

-- Create RLS policies for expedition_minigames
CREATE POLICY "Users can view expedition minigames for their expeditions"
    ON public.expedition_minigames FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

CREATE POLICY "Users can create expedition minigames for their expeditions"
    ON public.expedition_minigames FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

CREATE POLICY "Users can update expedition minigames for their expeditions"
    ON public.expedition_minigames FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

-- Now add the missing DELETE policies

-- Allow users to delete expedition cats for their own expeditions
CREATE POLICY "Users can delete expedition cats for their expeditions"
    ON public.expedition_cats FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

-- Allow users to delete expedition cards for their own expeditions  
CREATE POLICY "Users can delete expedition cards for their expeditions"
    ON public.expedition_cards FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

-- Allow users to delete expedition minigames for their own expeditions
CREATE POLICY "Users can delete expedition minigames for their expeditions"
    ON public.expedition_minigames FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

-- Allow users to delete expedition results for their own expeditions (optional - usually kept for history)
CREATE POLICY "Users can delete expedition results for their expeditions"
    ON public.expedition_results FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

-- Allow users to delete their own expeditions (optional - usually kept for history)
CREATE POLICY "Users can delete their own expeditions"
    ON public.expeditions FOR DELETE
    USING (auth.uid() = user_id);