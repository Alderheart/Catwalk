import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addBreedColumn() {
  try {
    console.log('Adding breed column to cats table...');
    
    // Add breed column
    const { error: addColumnError } = await supabase
      .from('cats')
      .select('breed')
      .limit(1);
    
    if (addColumnError && addColumnError.message.includes('column "breed" does not exist')) {
      console.log('Column does not exist, need to run SQL manually.');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log(`
-- Add breed column to cats table
ALTER TABLE public.cats ADD COLUMN breed TEXT;

-- Add constraint for breed values (optional, allows NULL for existing cats)
ALTER TABLE public.cats ADD CONSTRAINT cats_breed_length CHECK (breed IS NULL OR char_length(breed) BETWEEN 1 AND 20);

-- Create index for breed column for better query performance
CREATE INDEX idx_cats_breed ON public.cats(breed);
      `);
      return;
    }
    
    console.log('Breed column already exists or query succeeded!');
    
    // Test the column
    const { data, error } = await supabase
      .from('cats')
      .select('id, name, breed')
      .limit(1);
    
    if (error) {
      console.error('Error testing breed column:', error);
    } else {
      console.log('Breed column is working! Sample data:', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addBreedColumn();