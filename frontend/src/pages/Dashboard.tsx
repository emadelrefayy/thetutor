import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const subjects = [
    { id: 'arabic', name: 'اللغة العربية', path: '/subject/arabic', icon: '📖', color: 'bg-amber-500' },
    { id: 'math', name: 'الرياضيات (Math)', path: '/subject/math', icon: '📐', color: 'bg-blue-500' },
    { id: 'science', name: 'العلوم', path: '/subject/science', icon: '🔬', color: 'bg-emerald-500' },
    { id: 'social', name: 'الدراسات الاجتماعية', path: '/subject/social', icon: '🌍', color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 text-slate-100">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-amber-400 mb-3">📚 المواد الدراسية - الصف الرابع الابتدائي</h1>
        <p className="text-slate-300 text-lg">مرحباً بك في منصة The Tutor! اختر المادة وابدأ رحلة التعلم التفاعلية.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <Link
            key={sub.id}
            to={sub.path}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-2xl p-6 shadow-xl transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors mb-1">{sub.name}</h3>
              <p className="text-sm text-slate-400">استعرض الدروس التفاعلية والتمارين</p>
            </div>
            <div className={`w-16 h-16 rounded-2xl ${sub.color} flex items-center justify-center text-3xl shadow-lg`}>
              {sub.icon}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
