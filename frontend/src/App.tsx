import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import StudySpace from './pages/StudySpace';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentTeacherDashboard from './pages/StudentTeacherDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/subject/:subjectId" element={<SubjectPage />} />
        <Route path="/study-space" element={<StudySpace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/student" element={<StudentTeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
