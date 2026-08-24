import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ((process as any).env || {}).REACT_APP_SUPABASE_URL || 'https://xsfjlzneykogdltuiwno.supabase.co';
const supabaseAnonKey = ((process as any).env || {}).REACT_APP_SUPABASE_ANON_KEY || '';
import { supabase } from "./lib/supabase";

// معرف افتراضي للطالب للتجربة وتتبع التقدم
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

interface LessonData {
  id: number;
  unit_title: string;
  lesson_title: string;
  youtube_url: string;
  content_markdown: string;
  term: number;
}

interface QuizQuestion {
  id: number;
  lesson_id: number;
  question: string;
  options: string[];
  correct_option: number;
}

const StudentLessonDynamic: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'quiz'>('video');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<boolean>(false);
  
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (lessonId) {
      const id = Number(lessonId);
      fetchLessonDetails(id);
      fetchLessonQuizzes(id);
      fetchUserProgress(id);
    }
  }, [lessonId]);

  const fetchLessonDetails = async (id: number) => {
    setLoading(true);
    const { data } = await supabase.from('lessons').select('*').eq('id', id).single();
    if (data) setLesson(data);
    setLoading(false);
  };

  const fetchLessonQuizzes = async (id: number) => {
    const { data } = await supabase.from('quizzes').select('*').eq('lesson_id', id);
    if (data) setQuizzes(data);
  };

  const fetchUserProgress = async (id: number) => {
    const { data } = await supabase
      .from('student_progress')
      .select('is_completed')
      .eq('lesson_id', id)
      .eq('user_id', DEMO_USER_ID)
      .maybeSingle();

    if (data) {
      setIsCompleted(data.is_completed);
    }
  };

  // حفظ تقدم الدرس عند الضغط على زر الإنجاز
  const toggleCompletion = async () => {
    if (!lessonId) return;
    const nextStatus = !isCompleted;
    setIsCompleted(nextStatus);
    setSavingProgress(true);

    await supabase.from('student_progress').upsert({
      user_id: DEMO_USER_ID,
      lesson_id: Number(lessonId),
      is_completed: nextStatus,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });

    setSavingProgress(false);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const handleSelectAnswer = async (qId: number, optionIdx: number) => {
    const updated = { ...userAnswers, [qId]: optionIdx };
    setUserAnswers(updated);

    // حساب النتيجة وحفظها في Supabase
    if (quizzes.length > 0 && lessonId) {
      let score = 0;
      quizzes.forEach(q => {
        if (updated[q.id] === q.correct_option) score += 1;
      });

      await supabase.from('student_progress').upsert({
        user_id: DEMO_USER_ID,
        lesson_id: Number(lessonId),
        is_completed: isCompleted,
        quiz_score: score,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-sans dir-rtl">
        <p className="text-amber-400 font-bold text-sm animate-pulse">جاري تحميل بيانات الدرس والتمارين من Supabase...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans dir-rtl text-center">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-sm space-y-4">
          <p className="text-rose-400 font-bold text-base">عذراً، هذا الدرس غير موجود!</p>
          <Link to="/catalog" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
            العودة لفهرس الدروس
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 dir-rtl font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* هيدر الدرس */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
                الترم {lesson.term} • {lesson.unit_title}
              </span>
              {isCompleted && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                  ✓ تم الإنجاز
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-100 mt-2">{lesson.lesson_title}</h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
            <button
              onClick={toggleCompletion}
              disabled={savingProgress}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isCompleted 
                  ? 'bg-emerald-500 text-slate-950' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {savingProgress ? 'جاري الحفظ...' : isCompleted ? '✓ مكتمل' : 'تعليم كمكتمل'}
            </button>

            <Link
              to="/catalog"
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold"
            >
              📖 الفهرس
            </Link>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'video' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎥 الفيديو
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notes' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 الشرح والملاحظات
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'quiz' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧪 التطبيق والأسئلة ({quizzes.length})
          </button>
        </div>

        {/* محتوى التبويب */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700 min-h-[350px]">
          {activeTab === 'video' && (
            <div className="aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(lesson.youtube_url)}
                title={lesson.lesson_title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="text-slate-300 space-y-3 text-sm leading-relaxed whitespace-pre-line">
              <h2 className="text-amber-400 text-base font-bold border-b border-slate-700 pb-2">شرح وملاحظات الدرس</h2>
              {lesson.content_markdown || "لا يوجد شرح مكتوب لهذا الدرس بعد."}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <h2 className="text-amber-400 text-base font-bold border-b border-slate-700 pb-2">أسئلة وتطبيقات الدرس</h2>
              
              {quizzes.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">لا توجد أسئلة مسجلة لهذا الدرس حالياً في قاعدة البيانات.</p>
              ) : (
                quizzes.map((q, idx) => {
                  const selectedIdx = userAnswers[q.id];
                  const isAnswered = selectedIdx !== undefined;

                  return (
                    <div key={q.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                      <p className="text-sm font-bold text-slate-200">س{idx + 1}: {q.question}</p>
                      
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          let btnStyle = "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600";
                          if (isAnswered) {
                            if (optIdx === q.correct_option) {
                              btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                            } else if (selectedIdx === optIdx) {
                              btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`w-full text-right p-3 rounded-lg text-xs border transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className={`p-2.5 rounded-lg text-xs font-bold text-center mt-2 ${
                          selectedIdx === q.correct_option 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {selectedIdx === q.correct_option ? '🎉 إجابة صحيحة!' : '❌ إجابة خاطئة!'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentLessonDynamic;
