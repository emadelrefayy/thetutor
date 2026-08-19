import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface LessonData {
  title: string;
  description: string;
  video: string;
  game: string;
}

const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonData | null>(null);

  useEffect(() => {
    if (!id) return;
    const dummyLessons: Record<string, LessonData> = {
      '1': { title: 'الجمع', description: 'شرح درس الجمع', video: 'https://youtu.be/example', game: 'سؤال: 2+2=؟' },
      '2': { title: 'الطرح', description: 'شرح درس الطرح', video: 'https://youtu.be/example', game: 'سؤال: 5-3=؟' },
      '3': { title: 'حروف الجر', description: 'شرح حروف الجر', video: 'https://youtu.be/example', game: 'سؤال: ما هو حرف الجر؟' },
      '4': { title: 'الجملة الاسمية', description: 'شرح الجملة الاسمية', video: 'https://youtu.be/example', game: 'سؤال: ما هي الجملة الاسمية؟' },
      '5': { title: 'الضوء', description: 'شرح خصائص الضوء', video: 'https://youtu.be/example', game: 'سؤال: ما هو الضوء؟' },
      '6': { title: 'الصوت', description: 'شرح خصائص الصوت', video: 'https://youtu.be/example', game: 'سؤال: ما هو الصوت؟' },
    };
    setLesson(dummyLessons[id] || null);
  }, [id]);

  if (!lesson) return <div className="p-8 text-center">الدرس غير موجود</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{lesson.title}</h1>
        <p className="text-lg text-gray-700 mb-6">{lesson.description}</p>
        <a href={lesson.video} target="_blank" className="block bg-blue-600 text-white text-center py-3 rounded-xl mb-6 hover:bg-blue-700 transition">▶️ مشاهدة الفيديو</a>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">🎮 اللعبة</h2>
          <p className="text-lg">{lesson.game}</p>
          <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">إجابة</button>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
