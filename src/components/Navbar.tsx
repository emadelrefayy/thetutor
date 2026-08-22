import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [lang, setLang] = useState<'AR' | 'EN'>('AR');

  const toggleLanguage = () => {
    setLang(prev => (prev === 'AR' ? 'EN' : 'AR'));
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50 shadow-sm dir-rtl sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        
        {/* اللوجو الجديد النظيف */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-[64px] h-[64px] flex items-center justify-center overflow-hidden rounded-full bg-amber-50 border border-amber-200 shadow-sm p-1">
            <img 
              src="/logo.png" 
              alt="The Tutor Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
            The Tutor
          </span>
        </div>

        {/* الأزرار */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleLanguage}
            className="h-16 flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all active:scale-95 whitespace-nowrap shadow-sm"
          >
            🌐 {lang === 'AR' ? 'العربية' : 'EN'}
          </button>

          <button className="h-16 flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all active:scale-95 whitespace-nowrap shadow-sm">
            تسجيل الدخول
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
