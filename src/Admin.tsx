import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xsfjlzneykogdltuiwno.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Grade {
  id: number;
  title: string;
  level_code: number;
}

interface Subject {
  id: number;
  grade_id: number;
  title: string;
  code: string;
}

interface Lesson {
  id: number;
  subject_id: number;
  term: number;
  unit_title: string;
  lesson_title: string;
  youtube_url: string;
  content_markdown: string;
}

const AdminDashboard: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [unitTitle, setUnitTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [term, setTerm] = useState(1);
  const [contentMarkdown, setContentMarkdown] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    const { data, error } = await supabase.from('grades').select('*').order('level_code');
    if (!error && data) {
      setGrades(data);
      if (data.length > 0) setSelectedGrade(data[0].id);
    }
  };

  useEffect(() => {
    if (selectedGrade) fetchSubjects(selectedGrade);
  }, [selectedGrade]);

  const fetchSubjects = async (gradeId: number) => {
    const { data, error } = await supabase.from('subjects').select('*').eq('grade_id', gradeId);
    if (!error && data) {
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
      } else {
        setSelectedSubject(null);
        setLessons([]);
      }
    }
  };

  useEffect(() => {
    if (selectedSubject) fetchLessons(selectedSubject);
  }, [selectedSubject]);

  const fetchLessons = async (subjectId: number) => {
    setLoading(true);
    const { data, error } = await supabase.from('lessons').select('*').eq('subject_id', subjectId).order('order_index');
    if (!error && data) setLessons(data);
    setLoading(false);
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !lessonTitle || !unitTitle) return;

    const newLesson = {
      subject_id: selectedSubject,
      term,
      unit_title: unitTitle,
      lesson_title: lessonTitle,
      youtube_url: youtubeUrl,
      content_markdown: contentMarkdown
    };

    const { error } = await supabase.from('lessons').insert([newLesson]);
    if (!error) {
      setLessonTitle('');
      setUnitTitle('');
      setYoutubeUrl('');
      setContentMarkdown('');
      fetchLessons(selectedSubject);
    } else {
      alert('حدث خطأ أثناء إضافة الدرس: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 dir-rtl font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-amber-400">لوحة إدارة المحتوى - Super Admin 🛠️</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">المرحلة الدراسية:</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
              value={selectedGrade || ''}
              onChange={(e) => setSelectedGrade(Number(e.target.value))}
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">المادة الدراسية:</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(Number(e.target.value))}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.title} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-amber-400 border-b border-slate-700 pb-2">إضافة درس جديد ➕</h2>
            <form onSubmit={handleAddLesson} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">الترم</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100"
                >
                  <option value={1}>الترم الأول</option>
                  <option value={2}>الترم الثاني</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">اسم الوحدة (Unit Title)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Unit 1: Numbers"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">عنوان الدرس (Lesson Title)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Lesson 1: Counting"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">رابط فيديو يوتيوب</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">محتوى الدرس (Markdown)</label>
                <textarea
                  rows={4}
                  placeholder="# تفاصيل الدرس..."
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-100"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-all text-sm"
              >
                حفظ الدرس في القاعدة
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold text-amber-400 border-b border-slate-700 pb-2 mb-4">
              الدروس المسجلة ({lessons.length})
            </h2>

            {loading ? (
              <p className="text-sm text-slate-400">جاري تحميل الدروس...</p>
            ) : lessons.length === 0 ? (
              <p className="text-sm text-slate-400">لا يوجد دروس مضافة لهذه المادة بعد.</p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        ترم {lesson.term}
                      </span>
                      <h3 className="font-bold text-slate-200 mt-1">{lesson.lesson_title}</h3>
                      <p className="text-xs text-slate-400">{lesson.unit_title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
