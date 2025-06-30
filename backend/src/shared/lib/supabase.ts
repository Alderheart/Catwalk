import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Improperly configured Supabase keys
if (!supabaseUrl || !supabaseAnonKey)
  	throw new Error('Missing Supabase environment variables');

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);