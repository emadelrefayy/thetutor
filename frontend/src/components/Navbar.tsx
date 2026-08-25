import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import logo from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white shadow-2xl px-3 py-3 dir-rtl w-full overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* اللوجو المكبر 30% مع نص تكبيره 20% */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-800/90 border-2 border-amber-500/50 flex items-center justify-center p-2 shadow-xl shadow-amber-500/10 shrink-0">
              <img 
                src={logo} 
                alt="The Tutor Logo" 
                className="w-full h-full object-contain filter drop-shadow-lg scale-105"
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wider drop-shadow-md">The Tutor</h1>
              <p className="text-sm sm:text-base text-slate-300 font-semibold mt-0.5">المنصة التعليمية الذكية</p>
            </div>
          </div>
        </div>

        {/* حاوية 4 أزرار بالتمرير الأفقي */}
        <div className="w-full bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 px-1">
            <Link 
              to="/student" 
              className={`shrink-0 w-[calc(25%-6px)] min-w-[95px] snap-center text-center py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive('/student') ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              📚 الطلاب
            </Link>

            <Link 
              to="/curriculum" 
              className={`shrink-0 w-[calc(25%-6px)] min-w-[95px] snap-center text-center py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive('/curriculum') ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              🔍 المناهج
            </Link>

            <Link 
              to="/parent" 
              className={`shrink-0 w-[calc(25%-6px)] min-w-[95px] snap-center text-center py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive('/parent') ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              👨‍👩‍👧‍👦 ولي الأمر
            </Link>

            <Link 
              to="/study-space" 
              className={`shrink-0 w-[calc(25%-6px)] min-w-[95px] snap-center text-center py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive('/study-space') ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              📖 الدراسة
            </Link>

            <Link 
              to="/control-center" 
              className={`shrink-0 w-[calc(25%-6px)] min-w-[95px] snap-center text-center py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive('/control-center') || isActive('/admin') ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              ⚙️ التحكم
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
