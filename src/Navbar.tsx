import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-2.5 dir-rtl font-sans sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 shadow-lg">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        
        {/* الهوية والشعار المكبر */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="thetutor Logo" 
            className="w-16 h-16 rounded-xl object-contain bg-slate-800/80 p-1 border border-amber-500/40 group-hover:border-amber-400 transition-all shadow-md"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wide text-amber-400 group-hover:text-amber-300 transition-colors">
              thetutor
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-bold">منصة التعليم الذكي</span>
          </div>
        </Link>

        {/* أزرار الملاحة */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            to="/catalog"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/catalog') ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            📖 فهرس الدروس
          </Link>
          <Link
            to="/admin"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/admin') ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            🛠️ الأدمن
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
