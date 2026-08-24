import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Grade { id: number; name: string; }
interface Subject { id: number; name: string; grade_id: number; }
interface Lesson { id: number; subject_id: number; term: number; unit_title: string; lesson_title: string; video_url?: string; }

const CurriculumExplorer: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/full-curriculum');
      const data = await res.json();
      if (data.status === 'success') {
        setGrades(data.grades || []);
        setSubjects(data.subjects || []);
        setLessons(data.lessons || []);
      }
    } catch (err) {
      console.error('Error fetching curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesGrade = selectedGrade ? subjects.find(s => s.id === lesson.subject_id)?.grade_id === selectedGrade : true;
    const matchesSubject = selectedSubject ? lesson.subject_id === selectedSubject : true;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' ||
      (lesson.lesson_title && lesson.lesson_title.toLowerCase().includes(query)) ||
      (lesson.unit_title && lesson.unit_title.toLowerCase().includes(query));

    return matchesGrade && matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6 p-4 text-white">
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-3 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-amber-400">🔍 مستكشف المناهج والدروس الشامل</h2>
          <p className="text-xs text-slate-400">ابحث في كافة الصفوف، الدروس، المذكرات والوحدات الدراسية بكتابة الكلمة المفتاحية</p>
          <div className="relative mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم الدرس، الوحدة، أو المادة..."
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition duration-200 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded-md"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div>
          <span className="text-xs font-bold text-amber-400 block mb-2">اختر الصف الدراسي:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGrade(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedGrade === null ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              الكل
            </button>
            {grades.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedGrade === g.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {selectedGrade && (
          <div>
            <span className="text-xs font-bold text-amber-400 block mb-2">المواد المتاحة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedSubject === null ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                جميع المواد
              </button>
              {subjects.filter(s => s.grade_id === selectedGrade).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedSubject === s.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">جاري تحميل المناهج والدروس...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.length > 0 ? (
            filteredLessons.map(lesson => (
              <div key={lesson.id} className="p-5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl shadow-lg transition-all duration-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {lesson.unit_title || 'وحدة دراسية'}
                  </span>
                  <h3 className="font-bold text-base text-white mt-2.5">{lesson.lesson_title}</h3>
                  <p className="text-xs text-slate-400 mt-1">الفصل الدراسي: الترم {lesson.term}</p>
                </div>

                <Link
                  to={`/lesson/${lesson.id}`}
                  className="mt-4 w-full bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-bold py-2 rounded-xl text-xs text-center transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <span>🎬 دخول القاعة الدراسية</span>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
              لا توجد دروس مطابقة لطلبة البحث الحالي.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurriculumExplorer;
