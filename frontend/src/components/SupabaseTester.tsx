import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
export default function SupabaseTester() {
  const [status, setStatus] = useState<string>('لم يبدأ الاختبار بعد');
  const [loading, setLoading] = useState(false);
  const testConnection = async () => {
    setLoading(true);
    setStatus('جاري الاتصال بالسيرفر...');
    try {
      // اختبار استعلام بسيط
      const { data, error } = await supabase.from('courses').select('id').limit(1);
      if (error) {
        setStatus(`🚨 خطأ في الاتصال: ${error.message} (رمز: ${error.code})`);
      } else {
        setStatus(`✅ الاتصال ناجح ومستقر! عدد السجلات المسترجعة: ${data.length}`);
      }
    } catch (err: any) {
      setStatus(`❌ فشل الاتصال بالشبكة: ${err.message || 'Check URL and Keys'}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-right mt-6">
      <h3 className="text-xl font-bold text-amber-400 mb-4">🧪 أداة فحص ربط Supabase</h3>
      <p className="text-sm text-slate-300 mb-4">
        الرابط الحالي: <code className="bg-slate-800 px-2 py-1 rounded text-amber-300">{(import.meta as any).env.VITE_SUPABASE_URL || 'افتراضي'}</code>
      </p>
      <button
        onClick={testConnection}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg"
      >
        {loading ? 'جاري الفحص...' : 'فحص الاتصال الآن'}
      </button>
      <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 dir-ltr">
        {status}
      </div>
    </div>
  );
}
