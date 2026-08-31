import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import GradesPage from './pages/GradesPage';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/grades" replace />}
        />

        <Route
          path="/grades"
          element={<GradesPage />}
        />

        <Route
          path="/grades/:gradeId/terms"
          element={<TermsPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/grades" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;