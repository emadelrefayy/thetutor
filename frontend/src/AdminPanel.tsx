import { supabase } from "./lib/supabase";
import React, { useState, useEffect } from 'react';


const supabaseUrl = 'https://xsfjlzneykogdltuiwno.supabase.co';
const supabaseAnonKey = 'sb_publishable_F9TC2g0rL4mwufMz0h0iJw_FSfOhj9-';



const AdminPanel: React.FC = () => {
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkSeed = async () => {
    setLoading(true);
    setStatusMsg('جاري ضخ الشجرة الكاملة...');
    try {
      let { data: gradeData } = await supabase.from('grades').insert([{ title: 'الصف الأول الابتدائي', level_code: 1 }]).select().single();
      if (!gradeData) {
        const { data: existingGrades } = await supabase.from('grades').select('*').limit(1);
        gradeData = existingGrades?.[0];
      }

      if (gradeData) {
        let { data: subjectData } = await supabase.from('subjects').insert([{ grade_id: gradeData.id, title: 'الرياضيات', code: 'MATH1' }]).select().single();
        if (!subjectData) {
          const { data: existingSubjects } = await supabase.from('subjects').select('*').eq('grade_id', gradeData.id).limit(1);
          subjectData = existingSubjects?.[0];
        }

        if (subjectData) {
          await supabase.from('lessons').insert([{
            subject_id: subjectData.id,
            term: 1,
            unit_title: 'الوحدة الأولى: الأعداد',
            lesson_title: 'الدرس الأول: الأعداد حتى 10',
            youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            content_markdown: 'شرح مبسط للأعداد.',
            order_index: 1
          }]);
        }
      }

      setStatusMsg('🎉 تم ضخ البيانات وتأسيس الشجرة بنجاح!');
    } catch (err: any) {
      setStatusMsg(`❌ خطأ: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 dir-rtl font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-amber-400">لوحة إدارة المحتوى Super Admin 🛠️</h1>
            <p className="text-xs text-slate-400 mt-1">المظهر والتحكم الجديد</p>
          </div>
          <button
            onClick={handleBulkSeed}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-xl text-xs shadow-lg"
          >
            {loading ? 'جاري الضخ...' : '⚡ ضخ حزمة كاملة تلقائياً'}
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 bg-slate-800 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold text-center">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
