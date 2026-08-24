import { createClient } from '@supabase/supabase-js';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_URL) ||
  'https://xsfjlzneykogdltuiwno.supabase.co';

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_ANON_KEY) ||
  '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
