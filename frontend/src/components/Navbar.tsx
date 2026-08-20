import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-100 py-3 px-6 sticky top-0 z-50 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <span className="text-3xl">🧑‍🏫</span>
        <span className="text-2xl font-black text-amber-600 tracking-tight">The Tutor</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <span className="bg-amber-100 text-amber-800 text-sm font-bold px-4 py-1.5 rounded-full border border-amber-200">
          الصف الرابع الابتدائي 🏫
        </span>
        <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-full shadow-md transition-all">
          تسجيل الدخول
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
