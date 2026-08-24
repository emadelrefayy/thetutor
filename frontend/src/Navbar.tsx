import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* اللوجو الحقيقي من مجلد الـ public واسم المنصة The Tutor */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-slate-900 rounded-xl border border-sky-500/30 shadow-md overflow-hidden p-0.5">
            <img src="/logo.png" alt="The Tutor Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              The Tutor
            </span>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
              المنصة التعليمية الذكية
            </span>
          </div>
        </Link>

        {/* روابط التنقل الرئيسية */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/') 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-amber-400'
            }`}
          >
            🏠 الرئيسية
          </Link>
          <Link
            to="/student-catalog"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/student-catalog') 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-amber-400'
            }`}
          >
            📚 كتالوج الطلاب
          </Link>
          <Link
            to="/curriculum"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/curriculum') 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-amber-400'
            }`}
          >
            🔍 مستكشف المناهج
          </Link>
          <Link
            to="/parent"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/parent') 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-amber-400'
            }`}
          >
            👨‍👩‍👧‍👦 ولي الأمر
          </Link>
          <Link
            to="/admin"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/admin') 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-300 hover:bg-slate-900 hover:text-amber-400'
            }`}
          >
            ⚙️ لوحة التحكم
          </Link>
        </div>

        {/* أيقونة المستخدم */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md flex items-center justify-center font-black text-slate-950 text-sm">
            T
          </div>
        </div>

      </div>
    </nav>
  );
}
