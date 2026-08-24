import React from 'react';

const ParentDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 dir-rtl font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-amber-400">لوحة ولي الأمر 👨‍👩‍👧‍👦</h1>
          <p className="text-xs text-slate-400 mt-1">متابعة المستوى الأكاديمي والتفاعل للأبناء</p>
        </header>

        {/* كارت الابن */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
              أ
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">أحمد عماد</h2>
              <p className="text-xs text-slate-400">الصف الأول الابتدائي (Primary 1)</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto text-center">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex-1 md:flex-none md:w-28">
              <p className="text-[10px] text-slate-400">الدروس المكتملة</p>
              <p className="font-black text-amber-400 text-base">5 / 12</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex-1 md:flex-none md:w-28">
              <p className="text-[10px] text-slate-400">مجموع النقاط</p>
              <p className="font-black text-emerald-400 text-base">450 ⭐</p>
            </div>
          </div>
        </div>

        {/* تقارير المواد */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200 text-sm">📐 مادة Math</h3>
              <span className="text-xs text-emerald-400 font-bold">ممتاز (85%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
            </div>
            <p className="text-xs text-slate-400">آخر درس مكتمل: Lesson 1 Counting 1 to 3</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200 text-sm">📖 مادة Connect Plus</h3>
              <span className="text-xs text-amber-400 font-bold">جيد جداً (70%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[70%] rounded-full"></div>
            </div>
            <p className="text-xs text-slate-400">آخر درس مكتمل: Lesson 1 Parts of the Body</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;
