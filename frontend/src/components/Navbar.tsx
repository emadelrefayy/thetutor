import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const allPages = [
    { path: '/control', label: '⚙️ مركز التحكم' },
    { path: '/dashboard', label: '📊 لوحة القيادة' },
    { path: '/catalog', label: '📚 الطلاب' },
    { path: '/explorer', label: '🔍 المناهج' },
    { path: '/parent', label: '👨‍👩‍👧‍👦 ولي الأمر' },
    { path: '/study-space', label: '📖 مساحة الدراسة' },
  ];

  return (
    <div className="sticky top-0 z-50 w-full shadow-2xl bg-slate-950">
      <nav className="border-b border-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/control" className="flex items-center group flex-shrink-0">
            <div className="w-[60px] h-[52px] flex-shrink-0 flex items-center justify-center bg-sky-950/90 rounded-xl border-2 border-sky-400 shadow-md shadow-sky-500/20 overflow-hidden px-1 py-0.5 transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="The Tutor Logo" className="w-full h-full object-contain scale-[1.03] rounded-lg" />
            </div>
          </Link>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <Link to="/control" className="group">
              <h1 className="font-black text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-sm hover:opacity-90 transition-opacity">
                The Tutor
              </h1>
            </Link>
            <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">
              المنصة التعليمية الذكية
            </span>
          </div>

          <div className="w-[60px] hidden lg:block"></div>
        </div>
      </nav>

      <div className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-3 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start lg:justify-center gap-1.5 min-w-max">
          {allPages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isActive(page.path)
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-amber-400 border border-slate-700/50'
              }`}
            >
              {page.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
