import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ControlCenter from './pages/ControlCenter';
import StudentCatalog from './pages/StudentCatalog';
import CurriculumExplorer from './pages/CurriculumExplorer';
import Dashboard from './pages/Dashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudySpace from './pages/StudySpace';
import SubjectPage from './pages/SubjectPage';
import LessonPage from './pages/LessonPage';
import NotFound from './pages/NotFound';

export default function App() {
  useEffect(() => {
    document.title = "🚀 The Tutor - منصة عماد الذكية";
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<ControlCenter />} />
            <Route path="/control" element={<ControlCenter />} />
            <Route path="/catalog" element={<StudentCatalog />} />
            <Route path="/explorer" element={<CurriculumExplorer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/study-space" element="/StudySpace" element={<StudySpace />} />
            <Route path="/subject/:id" element={<SubjectPage />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
