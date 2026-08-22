import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

interface Grade { id: number; name: string; }
interface Subject { id: number; name: string; grade_id: number; }
interface Lesson { id: number; subject_id: number; term: number; unit_title: string; lesson_title: string; }

const CurriculumCatalog: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<string>('جاري التوصيل بـ Supabase...');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: gData, error: gErr } = await supabase.from('grades').select('*');
      if (gErr) throw gErr;
      setGrades(gData || []);

      const { data: sData, error: sErr } = await supabase.from('subjects').select('*');
      if (sErr) throw sErr;
      setSubjects(sData || []);

      const { data: lData, error: lErr } = await supabase.from('lessons').select('*');
      if (lErr) throw lErr;
      setLessons(lData || []);

      setDbStatus(`✅ اتصال ناجح! الصفوف: ${gData?.length || 0} | المواد: ${sData?.length || 0} | الدروس: ${lData?.length || 0}`);
    } catch (err: any) {
      console.error('Supabase Error:', err);
      setDbStatus(`❌ خطأ اتصال: ${err.message || 'تعذر جلب البيانات'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = selectedGrade ? subjects.filter(s => s.grade_id === selectedGrade) : subjects;
  const filteredLessons = selectedSubject ? lessons.filter(l => l.subject_id === selectedSubject) : lessons;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs text-amber-400 font-bold uppercase block">حالة الاتصال المباشر بـ Supabase</span>
          <p className="text-sm font-mono text-slate-200 mt-1">{dbStatus}</p>
        </div>
        <button onClick={fetchData} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs transition">
          🔄 تحديث
        </button>
      </div>

      <h1 className="text-2xl font-bold text-amber-400">فهرس المناهج الدراسية (بيانات حية)</h1>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">الصفوف الدراسية:</label>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedGrade(null)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedGrade === null ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>الكل</button>
          {grades.map(g => (
            <button key={g.id} onClick={() => setSelectedGrade(g.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedGrade === g.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>{g.name}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">المواد:</label>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedSubject(null)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedSubject === null ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>الكل</button>
          {filteredSubjects.map(s => (
            <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedSubject === s.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>{s.name}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-8">جاري التحميل من Supabase...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.length > 0 ? (
            filteredLessons.map(l => (
              <div key={l.id} className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono">{l.unit_title || 'وحدة دراسية'}</span>
                <h3 className="font-bold text-base text-white mt-2">{l.lesson_title}</h3>
                <p className="text-xs text-slate-400 mt-1">الترم: {l.term}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-slate-500 py-8">لا توجد دروس مطابقة في قاعدة البيانات.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CurriculumCatalog;
