import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Grade { id: number; name: string; }
interface Subject { id: number; name: string; grade_id: number; }
interface Lesson { id: number; subject_id: number; term: number; unit_title: string; lesson_title: string; video_url?: string; }

export default function StudentCatalog() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [selectedGrade, setSelectedGrade] = useState<number | null>(1); // افتراضي الصف الأول
  const [selectedTerm, setSelectedTerm] = useState<number>(1); // الترم الأول
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/full-curriculum')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setGrades(data.grades || []);
          setSubjects(data.subjects || []);
          setLessons(data.lessons || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching catalog:", err);
        setLoading(false);
      });
  }, []);

  // تصفية المواد حسب الصف الدراسي والترم
  const filteredSubjects = subjects.filter(s => s.grade_id === selectedGrade);
  
  // تصفية الدروس حسب المادة المختارة والترم
  const filteredLessons = selectedSubject 
    ? lessons.filter(l => l.subject_id === selectedSubject.id && l.term === selectedTerm)
    : [];

  if (loading) {
    return (
      <div className="text-center py-20 text-amber-400 font-bold">
        جاري مزامنة وجلب مناهج سوبابيز الحقيقية للطالب...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 text-white max-w-5xl mx-auto">
      {/* اختيار الصف الدراسي */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-amber-400 mb-3">🎓 اختر الصف الدراسي:</h3>
        <div className="flex flex-wrap gap-2">
          {grades.map(grade => (
            <button
              key={grade.id}
              onClick={() => { setSelectedGrade(grade.id); setSelectedSubject(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedGrade === grade.id 
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {grade.name}
            </button>
          ))}
        </div>
      </div>

      {/* اختيار الترم الدراسي */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setSelectedTerm(1)}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition border ${
            selectedTerm === 1 
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          ⭐ الترم الأول
        </button>
        <button
          onClick={() => setSelectedTerm(2)}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition border ${
            selectedTerm === 2 
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          🌙 الترم الثاني
        </button>
      </div>

      {/* عرض المواد أو الدروس */}
      {!selectedSubject ? (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-300">📚 المواد الدراسية المتاحة:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl cursor-pointer transition-all duration-200 shadow-md hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                      مادة دراسية
                    </span>
                    <h5 className="font-black text-base text-white mt-3">{sub.name}</h5>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <span>🎮 تحدي المادة متاح</span>
                    <span className="text-amber-400 font-bold">دخول ⬅</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                لا توجد مواد مسجلة لهذا الصف في قاعدة البيانات حالياً.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-amber-400 font-bold">المادة المختارة:</span>
              <h4 className="text-lg font-black text-white">{selectedSubject.name}</h4>
            </div>
            <button
              onClick={() => setSelectedSubject(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
            >
              ← العودة لجميع المواد
            </button>
          </div>

          {/* تحدي مستوى المادة */}
          <div className="bg-gradient-to-r from-amber-500/20 to-slate-900 border border-amber-500/40 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-400 font-bold">🏆 مستوى التحدي 3: تحدي المادة كاملة</span>
              <p className="text-xs text-slate-300 mt-1">اختبر معلوماتك في كافة دروس هذه المادة واحصل على نقاط مضاعفة!</p>
            </div>
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-md">
              🎮 العب الآن
            </button>
          </div>

          {/* قائمة الدروس */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400">📖 دروس المادة والوحدات:</h5>
            {filteredLessons.length > 0 ? (
              filteredLessons.map(lesson => (
                <div key={lesson.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between transition hover:border-amber-500/30">
                  <div>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {lesson.unit_title || 'الوحدة الدراسية'}
                    </span>
                    <h6 className="font-bold text-sm text-white mt-1">{lesson.lesson_title}</h6>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                      🎮 لعبة الدرس
                    </button>
                    <Link
                      to={`/explorer`}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      📺 عرض الدرس
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                لا توجد دروس مدخلة لهذه المادة في هذا الترم بعد. (يمكنك إضافة الدروس عبر لوحة تحكم السوبر أدمن).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
