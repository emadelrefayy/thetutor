import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './Admin';

const Home: React.FC = () => (
  <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans dir-rtl">
    <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 max-w-md w-full space-y-4">
      <img src="/logo.png" alt="The Tutor Logo" className="w-20 h-20 mx-auto object-contain p-1" />
      <h1 className="text-2xl font-black text-slate-800">منصة The Tutor التعليمية 🎓</h1>
      <p className="text-sm text-slate-500">تم ربط قاعدة البيانات Supabase بنجاح!</p>
      
      <div className="pt-4">
        <Link
          to="/admin"
          className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg transition-all text-center"
        >
          الانتقال إلى لوحة السوبر أدمن 🛠️
        </Link>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
