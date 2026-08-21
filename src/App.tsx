import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from './Admin';
import StudentLesson from './StudentLesson';
import ParentDashboard from './ParentDashboard';

// شريط التنقل الخاص بالتطوير للربط بين كافة الشاشات
const DevNavbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: '🏠 الرئيسية' },
    { path: '/admin', label: '🛠️ السوبر أدمن' },
    { path: '/student/lesson', label: '🎓 واجهة الطالب والدرس' },
    { path: '/parent', label: '👨‍👩‍👧‍👦 لوحة ولي الأمر' },
  ];

  return (
    <nav className="bg-slate-950 border-b border-amber-500/30 px-4 py-2.5 dir-rtl flex items-center justify-between overflow-x-auto">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md whitespace-nowrap">
          DEV MODE ⚡
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold whitespace-nowrap">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              location.pathname === link.path
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

const Home: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans dir-rtl">
    <div className="bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-700 max-w-md w-full space-y-5">
      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-2xl mx-auto">
        🎓
      </div>
      <h1 className="text-2xl font-black text-slate-100">منصة The Tutor التعليمية</h1>
      <p className="text-xs text-slate-400 leading-relaxed">
        أهلاً بك في بيئة التطوير. يمكنك التجول بحرية بين كل الواجهات من الشريط العلوي أو الخيارات التالية:
      </p>

      <div className="space-y-2.5 pt-2">
        <Link
          to="/admin"
          className="block w-full py-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 text-amber-400 font-bold rounded-xl text-xs transition-all text-center"
        >
          🛠️ الانتقال إلى لوحة السوبر أدمن
        </Link>
        <Link
          to="/student/lesson"
          className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all text-center shadow-lg"
        >
          🎓 معاينة صفحة الطالب والدرس التفاعلي
        </Link>
        <Link
          to="/parent"
          className="block w-full py-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all text-center"
        >
          👨‍👩‍👧‍👦 معاينة لوحة ولي الأمر
        </Link>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <DevNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student/lesson" element={<StudentLesson />} />
        <Route path="/parent" element={<ParentDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
