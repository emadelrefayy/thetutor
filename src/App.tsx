import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// استدعاء جميع الصفحات والمكونات الموجودة في المشروع
import CurriculumCatalog from './CurriculumCatalog';
import StudentCatalog from './StudentCatalog';
import AdminPanel from './AdminPanel';
import StudentLessonDynamic from './StudentLessonDynamic';

import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentTeacherDashboard from './pages/StudentTeacherDashboard';
import StudySpace from './pages/StudySpace';
import LessonPage from './pages/LessonPage';
import SubjectPage from './pages/SubjectPage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        {/* شريط التحكم الشامل للمطور والسوبر أدمن */}
        <header className="bg-slate-800 border-b border-slate-700 p-3 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="bg-amber-500 text-slate-900 font-black px-2 py-1 rounded text-xs">DEV SUPER-ADMIN</span>
              <h1 className="font-bold text-lg text-amber-400">thetutor Platform</h1>
            </div>
            
            {/* خريطة الوصول السريع لكافة صفحات ومكونات الموقع */}
            <nav className="flex flex-wrap gap-2 text-xs font-semibold">
              <Link to="/" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-slate-200 transition">📚 الفهرس الرئيسي</Link>
              <Link to="/student-catalog" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-slate-200 transition">🎓 فهرس الطلاب</Link>
              <Link to="/admin-panel" className="bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded text-white transition">🛠️ لوحة التحكم (Panel)</Link>
              <Link to="/admin-dashboard" className="bg-amber-700 hover:bg-amber-600 px-3 py-1.5 rounded text-white transition">📊 أدمن المناهج (Dashboard)</Link>
              <Link to="/parent" className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white transition">👨‍👩‍👦 ولي الأمر</Link>
              <Link to="/teacher-student" className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded text-white transition">👨‍🏫 المدرس والطلاب</Link>
              <Link to="/study-space" className="bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded text-white transition">✏️ مساحة الدراسة</Link>
              <Link to="/lesson/1" className="bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded text-white transition">🎬 عرض درس تجريبي</Link>
            </nav>
          </div>
        </header>

        {/* شبكة التوجيه الحقيقية لجميع صفحات المنصة */}
        <main className="p-4 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<CurriculumCatalog />} />
            <Route path="/catalog" element={<CurriculumCatalog />} />
            <Route path="/student-catalog" element={<StudentCatalog />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/teacher-student" element={<StudentTeacherDashboard />} />
            <Route path="/study-space" element={<StudySpace />} />
            <Route path="/lesson/:id" element={<StudentLessonDynamic />} />
            <Route path="/lesson-page" element={<LessonPage />} />
            <Route path="/subject/:id" element={<SubjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
