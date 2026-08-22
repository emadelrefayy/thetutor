app_code = """import { PlayfulBackground } from './components/PlayfulBackground';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import StudentCatalog from './StudentCatalog';
import AdminPanel from './AdminPanel';
import ParentDashboard from './pages/ParentDashboard';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <PlayfulBackground />
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<StudentCatalog />} />
            <Route path="/catalog" element={<StudentCatalog />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
"""

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_code)

print("✅ App.tsx was safely repaired with all valid tags and routes!")
