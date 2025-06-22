-- Create expeditions table
CREATE TABLE IF NOT EXISTS public.expeditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed')) DEFAULT 'active',
    spread_type TEXT NOT NULL CHECK (spread_type IN ('three-card', 'horseshoe', 'four-directions')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
);

-- Create expedition_cats table (tracks which cats participated)
CREATE TABLE IF NOT EXISTS public.expedition_cats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
    cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0 AND position <= 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique cat per expedition and unique position per expedition
    UNIQUE(expedition_id, cat_id),
    UNIQUE(expedition_id, position)
);

-- Create expedition_cards table (tracks cards drawn for each position)
CREATE TABLE IF NOT EXISTS public.expedition_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
    card_position INTEGER NOT NULL CHECK (card_position >= 0),
    card_value TEXT NOT NULL CHECK (card_value IN ('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K')),
    card_suit TEXT NOT NULL CHECK (card_suit IN ('♠', '♥', '♦', '♣')),
    orientation TEXT NOT NULL CHECK (orientation IN ('upright', 'reversed')) DEFAULT 'upright',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique card position per expedition
    UNIQUE(expedition_id, card_position)
);

-- Create expedition_results table (stores rewards and narrative)
CREATE TABLE IF NOT EXISTS public.expedition_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
    rewards_json JSONB NOT NULL DEFAULT '{}',
    narrative_text TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- One result per expedition  
    UNIQUE(expedition_id)
);

-- Create indexes for performance
CREATE INDEX idx_expeditions_user_id ON public.expeditions(user_id);
CREATE INDEX idx_expeditions_status ON public.expeditions(status);
CREATE INDEX idx_expeditions_created_at ON public.expeditions(created_at DESC);
CREATE INDEX idx_expedition_cats_expedition_id ON public.expedition_cats(expedition_id);
CREATE INDEX idx_expedition_cards_expedition_id ON public.expedition_cards(expedition_id);
CREATE INDEX idx_expedition_results_expedition_id ON public.expedition_results(expedition_id);

-- Enable Row Level Security
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expeditions
CREATE POLICY "Users can view their own expeditions"
    ON public.expeditions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expeditions"
    ON public.expeditions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expeditions"
    ON public.expeditions FOR UPDATE
    USING (auth.uid() = user_id);

-- Create RLS policies for expedition_cats
CREATE POLICY "Users can view expedition cats for their expeditions"
    ON public.expedition_cats FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

CREATE POLICY "Users can create expedition cats for their expeditions"
    ON public.expedition_cats FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

-- Create RLS policies for expedition_cards
CREATE POLICY "Users can view expedition cards for their expeditions"
    ON public.expedition_cards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

CREATE POLICY "Users can create expedition cards for their expeditions"
    ON public.expedition_cards FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

-- Create RLS policies for expedition_results
CREATE POLICY "Users can view expedition results for their expeditions"
    ON public.expedition_results FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));

CREATE POLICY "Users can create expedition results for their expeditions"
    ON public.expedition_results FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.expeditions e 
        WHERE e.id = expedition_id AND e.user_id = auth.uid()
    ));