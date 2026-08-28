import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Navbar from './components/Navbar';

import AdminDashboard from './pages/AdminDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { StudentDashboard } from './pages/StudentDashboard';

import SubjectPage from './pages/SubjectPage';
import UnitPage from './pages/UnitPage';
import LessonPage from './pages/LessonPage';
import NotFound from './pages/NotFound';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div
        dir="rtl"
        className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950"
      >
        <Navbar />

        <main className="min-h-[calc(100vh-4rem)] w-full">
          <Routes>

            {/* -------------------------------------------------- */}
            {/* Root */}
            {/* -------------------------------------------------- */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/student"
                  replace
                />
              }
            />


            {/* -------------------------------------------------- */}
            {/* Student */}
            {/* -------------------------------------------------- */}

            <Route
              path="/student"
              element={
                <StudentDashboard />
              }
            />


            {/* -------------------------------------------------- */}
            {/* Parent */}
            {/* -------------------------------------------------- */}

            <Route
              path="/parent"
              element={
                <ParentDashboard />
              }
            />


            {/* -------------------------------------------------- */}
            {/* Admin */}
            {/* -------------------------------------------------- */}

            <Route
              path="/admin"
              element={
                <AdminDashboard />
              }
            />


            {/* -------------------------------------------------- */}
            {/* Academic Curriculum */}
            {/* Grade → Term → Subject → Unit → Lesson */}
            {/* -------------------------------------------------- */}

            <Route
              path="/subject/:subjectId"
              element={
                <SubjectPage />
              }
            />

            <Route
              path="/unit/:unitId"
              element={
                <UnitPage />
              }
            />

            <Route
              path="/lesson/:lessonId"
              element={
                <LessonPage />
              }
            />


            {/* -------------------------------------------------- */}
            {/* 404 */}
            {/* -------------------------------------------------- */}

            <Route
              path="*"
              element={
                <NotFound />
              }
            />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};


export default App;