import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Lesson {
  id: number;
  title: string;
  order_index?: number;
}

export const SubjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectTitle, setSubjectTitle] = useState('');

  useEffect(() => {
    if (id) {
      fetchSubjectAndLessons(parseInt(id));
    }
  }, [id]);

  const fetchSubjectAndLessons = async (subjectId: number) => {
    setLoading(true);
    try {
      const { data: subData } = await supabase
        .from('subjects')
        .select('title')
        .eq('id', subjectId)
        .single();
      
      if (subData) setSubjectTitle(subData.title);

      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('subject_id', subjectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(lessonsData || []);
    } catch (err) {
      console.error('خطأ في جلب الدروس:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-slate-100 p-4" dir="rtl">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition-all border border-slate-700"
      >
        ⬅ العودة إلى قائمة المواد
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-2">
        <span className="text-4xl">📚</span>
        <h1 className="text-2xl font-black text-amber-400">
          الدرس {subjectTitle ? `- ${subjectTitle}` : ''}
        </h1>
        <p className="text-xs text-slate-400">قائمة دروس المادة</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-amber-400 animate-pulse font-bold">جاري تحميل الدروس...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-sm font-bold text-slate-400">لا توجد دروس مسجلة لهذه المادة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl transition-all shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{lesson.title}</h3>
                </div>
                <button className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition-all">
                  عرض الدرس 📖
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetails;
