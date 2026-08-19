import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import LessonPage from './pages/LessonPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/subject/:subjectId" element={<SubjectPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
