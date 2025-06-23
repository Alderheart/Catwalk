-- Add missing DELETE policies for expedition tables
-- This fixes the issue where expedition cleanup was silently failing due to missing RLS DELETE policies

-- Only add DELETE policies that don't already exist

-- Allow users to delete expedition cats for their own expeditions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'expedition_cats' 
        AND policyname = 'Users can delete expedition cats for their expeditions'
        AND cmd = 'DELETE'
    ) THEN
        CREATE POLICY "Users can delete expedition cats for their expeditions"
            ON public.expedition_cats FOR DELETE
            USING (EXISTS (
                SELECT 1 FROM public.expeditions e 
                WHERE e.id = expedition_id AND e.user_id = auth.uid()
            ));
    END IF;
END $$;

-- Allow users to delete expedition cards for their own expeditions  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'expedition_cards' 
        AND policyname = 'Users can delete expedition cards for their expeditions'
        AND cmd = 'DELETE'
    ) THEN
        CREATE POLICY "Users can delete expedition cards for their expeditions"
            ON public.expedition_cards FOR DELETE
            USING (EXISTS (
                SELECT 1 FROM public.expeditions e 
                WHERE e.id = expedition_id AND e.user_id = auth.uid()
            ));
    END IF;
END $$;

-- Allow users to delete expedition minigames for their own expeditions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'expedition_minigames' 
        AND policyname = 'Users can delete expedition minigames for their expeditions'
        AND cmd = 'DELETE'
    ) THEN
        CREATE POLICY "Users can delete expedition minigames for their expeditions"
            ON public.expedition_minigames FOR DELETE
            USING (EXISTS (
                SELECT 1 FROM public.expeditions e 
                WHERE e.id = expedition_id AND e.user_id = auth.uid()
            ));
    END IF;
END $$;