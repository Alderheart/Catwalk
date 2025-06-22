-- Update expedition_cards table to use Major Arcana tarot cards instead of playing cards
-- Drop the old columns and add new tarot card column
ALTER TABLE public.expedition_cards 
DROP COLUMN IF EXISTS card_value,
DROP COLUMN IF EXISTS card_suit,
ADD COLUMN tarot_card_name TEXT NOT NULL DEFAULT 'The Fool' CHECK (
    tarot_card_name IN (
        'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
        'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
        'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
        'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
        'Judgement', 'The World'
    )
);

-- Remove the default after adding the column
ALTER TABLE public.expedition_cards ALTER COLUMN tarot_card_name DROP DEFAULT;

-- Add expedition status for multi-step flow
ALTER TABLE public.expeditions 
DROP CONSTRAINT IF EXISTS expeditions_status_check,
ADD CONSTRAINT expeditions_status_check CHECK (status IN ('active', 'cards_drawn', 'completed'));

-- Create expedition_minigames table to track minigame progress
CREATE TABLE IF NOT EXISTS public.expedition_minigames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
    card_position INTEGER NOT NULL CHECK (card_position >= 0),
    tarot_card_name TEXT NOT NULL,
    orientation TEXT NOT NULL CHECK (orientation IN ('upright', 'reversed')),
    minigame_type TEXT NULL, -- Will be set when minigames are implemented
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    score INTEGER NULL, -- Minigame score (0-100)
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique card position per expedition
    UNIQUE(expedition_id, card_position)
);

-- Create indexes for performance
CREATE INDEX idx_expedition_minigames_expedition_id ON public.expedition_minigames(expedition_id);
CREATE INDEX idx_expedition_minigames_status ON public.expedition_minigames(status);

-- Enable Row Level Security
ALTER TABLE public.expedition_minigames ENABLE ROW LEVEL SECURITY;

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