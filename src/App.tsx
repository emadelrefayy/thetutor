import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import GradesPage from './pages/GradesPage';
import TermsPage from './pages/TermsPage';
import SubjectsPage from './pages/SubjectsPage';
import UnitsPage from './pages/UnitsPage';
import LessonPage from './pages/LessonPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={
            <Navigate
              to="/grades"
              replace
            />
          }
        />

        {/* Grades */}
        <Route
          path="/grades"
          element={<GradesPage />}
        />

        {/* Terms */}
        <Route
          path="/grades/:gradeId/terms"
          element={<TermsPage />}
        />

        {/* Subjects */}
        <Route
          path="/grades/:gradeId/terms/:termId/subjects"
          element={<SubjectsPage />}
        />

        {/* Units */}
        <Route
          path="/grades/:gradeId/terms/:termId/subjects/:subjectId/units"
          element={<UnitsPage />}
        />

        {/* Lessons list */}
        <Route
          path="/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons"
          element={<LessonPage />}
        />

        {/* Individual lesson */}
        <Route
          path="/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons/:lessonId"
          element={<LessonPage />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to="/grades"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;