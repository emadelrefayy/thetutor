import { createClient } from '@supabase/supabase-js';

// استخراج بيانات الاتصال من متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// إنشاء وتصدير العميل الخفي لـ Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
