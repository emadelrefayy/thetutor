import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import FamilyProgress from './pages/FamilyProgress';
import StudySpace from './pages/StudySpace';
import SubjectPage from './pages/SubjectPage';
import LessonPage from './pages/LessonPage';
import ControlCenter from './pages/ControlCenter';
import CurriculumExplorer from './pages/CurriculumExplorer';
import NotFound from './pages/NotFound';

import { StudentDashboard } from './pages/StudentDashboard';
import { ParentDashboard } from './pages/ParentDashboard';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col dir-rtl font-sans antialiased selection:bg-amber-500 selection:text-slate-950" dir="rtl">
        <Navbar />
        <main className="flex-1 w-full max-w-md sm:max-w-xl md:max-w-4xl mx-auto px-3 py-4">
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/control-center" element={<ControlCenter />} />
            <Route path="/control" element={<Navigate to="/control-center" replace />} />
            <Route path="/family-progress" element={<FamilyProgress />} />
            <Route path="/study-space" element={<StudySpace />} />
            <Route path="/curriculum" element={<CurriculumExplorer />} />
            <Route path="/subject/:subjectId" element={<SubjectPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
