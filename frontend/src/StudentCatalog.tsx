import { supabase } from "./lib/supabase";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


const supabaseUrl = ((process as any).env || {}).REACT_APP_SUPABASE_URL || 'https://xsfjlzneykogdltuiwno.supabase.co';
const supabaseAnonKey = ((process as any).env || {}).REACT_APP_SUPABASE_ANON_KEY || '';


interface Grade { id: number; title: string; level_code: number; }
interface Subject { id: number; grade_id: number; title: string; code: string; }
interface Lesson { id: number; subject_id: number; term: number; unit_title: string; lesson_title: string; }

const StudentCatalog: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('grades').select('*').order('level_code');
    if (error) {
      setErrorMsg(`خطأ الصفوف: ${error.message}`);
    } else if (data && data.length > 0) {
      setGrades(data);
      setSelectedGradeId(data[0].id);
      fetchSubjects(data[0].id);
    } else {
      setErrorMsg('لم يتم العثور على أية صفوف دراسية في جدول grades!');
    }
    setLoading(false);
  };

  const fetchSubjects = async (gradeId: number) => {
    const { data, error } = await supabase.from('subjects').select('*').eq('grade_id', gradeId);
    if (error) {
      setErrorMsg(`خطأ المواد: ${error.message}`);
    } else if (data && data.length > 0) {
      setSubjects(data);
      setSelectedSubjectId(data[0].id);
      fetchLessons(data[0].id);
    } else {
      setSubjects([]);
      setLessons([]);
    }
  };

  const fetchLessons = async (subjectId: number) => {
    const { data, error } = await supabase.from('lessons').select('*').eq('subject_id', subjectId).order('order_index');
    if (error) {
      setErrorMsg(`خطأ الدروس: ${error.message}`);
    } else if (data) {
      setLessons(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 dir-rtl font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Debug Box */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-amber-500/30 text-xs text-amber-300 space-y-1">
          <p><strong>تشخيص الاتصال:</strong></p>
          <p>URL: {supabaseUrl}</p>
          <p>Anon Key Status: {supabaseAnonKey ? 'متوفر ✅' : 'مفقود ❌'}</p>
          {errorMsg && <p className="text-rose-400 font-bold bg-rose-500/10 p-2 rounded border border-rose-500/20">{errorMsg}</p>}
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
            📖 فهرس المناهج والدروس
          </h1>
          <p className="text-xs text-slate-400 mt-1">تصفح الصفوف والمواد واضغط على أي درس لفتحه ديناميكياً</p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-amber-400 font-bold text-sm animate-pulse">
            جاري جلب البيانات من Supabase...
          </div>
        ) : (
          <>
            {/* اختيار الصف */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {grades.map(g => (
                <button
                  key={g.id}
                  onClick={() => { setSelectedGradeId(g.id); fetchSubjects(g.id); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedGradeId === g.id ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>

            {/* اختيار المادة */}
            {subjects.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSubjectId(s.id); fetchLessons(s.id); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSubjectId === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {/* قائمة الدروس */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
              <h2 className="text-sm font-bold text-slate-200">الدروس المتاحة ({lessons.length})</h2>
              
              {lessons.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">لا توجد دروس مضافة لهذه المادة بعد.</p>
              ) : (
                <div className="grid gap-3">
                  {lessons.map(l => (
                    <Link
                      key={l.id}
                      to={`/lesson/${l.id}`}
                      className="p-4 bg-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-xl flex justify-between items-center transition-all group"
                    >
                      <div>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold">الترم {l.term}</span>
                        <h3 className="text-sm font-bold text-slate-200 mt-1 group-hover:text-amber-400 transition-colors">{l.lesson_title}</h3>
                        <p className="text-xs text-slate-400">{l.unit_title}</p>
                      </div>
                      <span className="text-xs text-amber-400 font-bold bg-slate-800 px-3 py-1.5 rounded-lg">دخول الدرس ←</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default StudentCatalog;
