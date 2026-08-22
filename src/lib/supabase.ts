import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xsfjlzneykogdltuiwno.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_yY1fOkYkLPrOXRg2tozipA_osSpJnoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
