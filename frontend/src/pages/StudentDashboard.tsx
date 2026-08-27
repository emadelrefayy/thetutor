import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Subject {
  id: number;
  title: string;
  code: string;
  term_id: number;
}

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedTermNum, setSelectedTermNum] = useState<number>(1); // 1 = الترم الأول, 2 = الترم الثاني
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const gradeLevels = [
    { id: 1, name: 'الصف الأول الابتدائي' },
    { id: 2, name: 'الصف الثاني الابتدائي' },
    { id: 3, name: 'الصف الثالث الابتدائي' },
    { id: 4, name: 'الصف الرابع الابتدائي' },
    { id: 5, name: 'الصف الخامس الابتدائي' },
    { id: 6, name: 'الصف السادس الابتدائي' },
  ];

  // دالة حساب معرف الترم (term_id) في قاعدة البيانات
  const calculateTermId = (grade: number, termNum: number): number => {
    return grade * 100 + termNum;
  };

  useEffect(() => {
    fetchSubjectsForTerm();
  }, [selectedGrade, selectedTermNum]);

  const fetchSubjectsForTerm = async () => {
    setLoading(true);
    const targetTermId = calculateTermId(selectedGrade, selectedTermNum);
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title, code, term_id')
        .eq('term_id', targetTermId);

      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error('خطأ في جلب المواد:', err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 dir-rtl text-slate-100 pb-12" dir="rtl">
      {/* الترويسة */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
            🏫 المدرسة - لوحة المناهج
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-400">لوحة المناهج والدروس</h1>
        </div>
      </div>

      {/* 1. اختيار السنة الدراسية */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-400">🔢 اختر السنة الدراسية:</label>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
          {gradeLevels.map((grade) => (
            <button
              key={grade.id}
              onClick={() => setSelectedGrade(grade.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                selectedGrade === grade.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              [{grade.id}] {grade.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. اختيار الترم (الترم الأول / الترم الثاني) */}
      <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setSelectedTermNum(1)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedTermNum === 1
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📘 الترم الأول
        </button>
        <button
          onClick={() => setSelectedTermNum(2)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedTermNum === 2
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📗 الترم الثاني
        </button>
      </div>

      {/* شريط البحث */}
      <input
        type="text"
        placeholder="🔍 ابحث عن مادة..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
      />

      {/* 3. قائمة المواد المفلترة للترم المحدد */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300">
          مواد الصف [{selectedGrade}] - {selectedTermNum === 1 ? 'الترم الأول' : 'الترم الثاني'}
        </h2>

        {loading ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-amber-400 animate-pulse font-bold">جاري تحميل المواد...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-sm font-bold text-slate-400">لا توجد مواد مسجلة لهذا الترم حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSubjects.map((sub, idx) => (
              <div
                key={sub.id}
                onClick={() => navigate(`/subject/${sub.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl cursor-pointer transition-all shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 group-hover:text-amber-400 transition-all">{sub.title}</h3>
                    <p className="text-[10px] text-slate-400">كود المادة: {sub.code}</p>
                  </div>
                </div>
                <span className="text-xs text-amber-400">◀</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
