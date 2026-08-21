import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xsfjlzneykogdltuiwno.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface LessonData {
  id: number;
  unit_title: string;
  lesson_title: string;
  youtube_url: string;
  content_markdown: string;
  term: number;
}

const StudentLessonDynamic: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'video' | 'notes'>('video');

  useEffect(() => {
    if (lessonId) fetchLessonDetails(Number(lessonId));
  }, [lessonId]);

  const fetchLessonDetails = async (id: number) => {
    setLoading(true);
    const { data, error } = await supabase.from('lessons').select('*').eq('id', id).single();
    if (!error && data) {
      setLesson(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-sans dir-rtl">
        <p className="text-amber-400 font-bold text-sm animate-pulse">جاري تحميل بيانات الدرس من Supabase...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans dir-rtl text-center">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-sm space-y-4">
          <p className="text-rose-400 font-bold text-base">عذراً، هذا الدرس غير موجود!</p>
          <Link to="/" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // تحويل رابط يوتيوب لرابط embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 dir-rtl font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* هيدر الدرس الديناميكي */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
              الترم {lesson.term} • {lesson.unit_title}
            </span>
            <h1 className="text-xl font-black text-slate-100 mt-2">{lesson.lesson_title}</h1>
          </div>

          <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'video' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎥 الفيديو
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'notes' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📝 الشرح والمحتوى
            </button>
          </div>
        </div>

        {/* جسم الدرس */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700 min-h-[350px]">
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
                <iframe
                  className="w-full h-full"
                  src={getEmbedUrl(lesson.youtube_url)}
                  title={lesson.lesson_title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="text-slate-300 space-y-3 text-sm leading-relaxed whitespace-pre-line">
              <h2 className="text-amber-400 text-base font-bold border-b border-slate-700 pb-2">شرح الدرس</h2>
              {lesson.content_markdown || "لا يوجد شرح مكتوب لهذا الدرس بعد."}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentLessonDynamic;
