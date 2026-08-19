import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const subjects = [
  { name: 'الرياضيات', icon: '📐', color: 'bg-red-600', link: '/subject/1' },
  { name: 'اللغة العربية', icon: '📖', color: 'bg-green-600', link: '/subject/2' },
  { name: 'العلوم', icon: '🔬', color: 'bg-yellow-600', link: '/subject/3' },
  { name: 'الإنجليزية', icon: '🇬🇧', color: 'bg-purple-600', link: '/subject/4' },
  { name: 'الكمبيوتر', icon: '💻', color: 'bg-blue-600', link: '/subject/5' },
  { name: 'الدين', icon: '🕌', color: 'bg-teal-600', link: '/subject/6' },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">📚 المواد الدراسية</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subjects.map((subject, idx) => (
            <Link
              key={idx}
              to={subject.link}
              className={`${subject.color} p-8 rounded-3xl shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center h-56 text-white`}
            >
              <span className="text-7xl mb-4">{subject.icon}</span>
              <span className="text-2xl font-semibold">{subject.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
