import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface Lesson {
  id: number;
  title: string;
  description: string;
}

const SubjectPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!subjectId) return;
    const dummyLessons: Record<string, Lesson[]> = {
      '1': [
        { id: 1, title: 'الجمع', description: 'تعلم جمع الأعداد' },
        { id: 2, title: 'الطرح', description: 'تعلم طرح الأعداد' },
      ],
      '2': [
        { id: 3, title: 'حروف الجر', description: 'تعلم حروف الجر' },
        { id: 4, title: 'الجملة الاسمية', description: 'تعلم الجملة الاسمية' },
      ],
      '3': [
        { id: 5, title: 'الضوء', description: 'تعلم خصائص الضوء' },
        { id: 6, title: 'الصوت', description: 'تعلم خصائص الصوت' },
      ],
    };
    setLessons(dummyLessons[subjectId] || []);
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">📚 دروس المادة</h1>
        <div className="max-w-4xl mx-auto space-y-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/lesson/${lesson.id}`}
              className="block bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <h2 className="text-2xl font-semibold text-blue-600">{lesson.title}</h2>
              <p className="text-gray-600">{lesson.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
