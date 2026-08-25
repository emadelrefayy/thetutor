import React from 'react';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6 dir-rtl text-slate-100 pb-10" dir="rtl">
      {/* الترويسة الداكنة بدلاً من اللون البنفسجي الفاتح */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            ✨ مرحباً بك مجدداً
          </div>
          <h1 className="text-2xl font-black text-amber-400">لوحة التعلم الخاصة بك</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            استكمل دروسك اليوم واعرض المواد المخصصة لصفك الدراسي بكل سهولة.
          </p>
        </div>
      </div>

      {/* بطاقات الإحصائيات بالتصميم الغامق */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-md hover:border-slate-700 transition-all">
          <div>
            <p className="text-xs text-slate-400 font-medium">عدد المواد الدراسية</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">16 مواد</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl">
            📖
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-md hover:border-slate-700 transition-all">
          <div>
            <p className="text-xs text-slate-400 font-medium">الدروس المكتملة</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">12 درس</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
            ✅
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
