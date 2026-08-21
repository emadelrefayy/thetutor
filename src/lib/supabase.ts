import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xsfjlzneykogdltuiwno.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_F9TC2g0rL4mwufMz0h0iJw_FSfOhj9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
