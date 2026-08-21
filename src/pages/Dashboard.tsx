import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartoonBackground from '../components/CartoonBackground';
import InteractiveGame from '../components/InteractiveGame';

const subjects = [
  { name: 'اللغة العربية', icon: '📖', color: 'bg-amber-500', link: '/subject/1' },
  { name: 'الرياضيات (Math)', icon: '📐', color: 'bg-blue-500', link: '/subject/2' },
  { name: 'العلوم (Science)', icon: '🔬', color: 'bg-emerald-500', link: '/subject/3' },
  { name: 'اللغة الإنجليزية (Connect)', icon: '🇬🇧', color: 'bg-purple-500', link: '/subject/4' },
  { name: 'المستوى الرفيع (Connect Plus)', icon: '🌟', color: 'bg-indigo-500', link: '/subject/5' },
  { name: 'تكنولوجيا المعلومات (ICT)', icon: '💻', color: 'bg-cyan-500', link: '/subject/6' },
  { name: 'الدراسات الاجتماعية', icon: '🌍', color: 'bg-orange-500', link: '/subject/7' },
  { name: 'المهارات المهنية', icon: '🛠️', color: 'bg-rose-500', link: '/subject/8' },
  { name: 'التربية الدينية', icon: '🕌', color: 'bg-teal-500', link: '/subject/9' },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] relative overflow-hidden font-sans dir-rtl">
      <CartoonBackground />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-amber-800 mb-4">
            📚 المواد الدراسية - الصف الرابع الابتدائي
          </h1>
          <p className="text-lg font-bold text-amber-600">
            مرحباً بك في منصة The Tutor! اختر المادة وابدأ رحلة التعلم التفاعلية.
          </p>
        </header>

        {/* كروت المواد */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {subjects.map((sub, idx) => (
            <Link
              key={idx}
              to={sub.link}
              className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-amber-100 flex items-center gap-5 group"
            >
              <div className={`${sub.color} text-white w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform`}>
                {sub.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
                  {sub.name}
                </h3>
                <span className="text-sm font-bold text-gray-400">استعرض الدروس ➔</span>
              </div>
            </Link>
          ))}
        </div>

        {/* اللعبة العامة الشاملة */}
        <section className="mt-12">
          <InteractiveGame title="التحدي العام الشامل لكل المواد (9 أسئلة)" />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
