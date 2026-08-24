import React, { useState } from 'react';

export const StudentStats = () => {
  const [points, setPoints] = useState(120);
  const [streak, setStreak] = useState(3);

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 text-white shadow-lg relative z-10">
      {/* النقاط والنجوم */}
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-bounce">⭐</span>
        <div>
          <p className="text-xs text-amber-300 font-bold">مجموع النقاط</p>
          <p className="text-xl font-extrabold text-amber-400">{points} نقطة</p>
        </div>
      </div>

      {/* أيام الحضور المستمر */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-xs text-orange-300 font-bold">التفاعل المستمر</p>
          <p className="text-xl font-extrabold text-orange-400">{streak} أيام متتالية</p>
        </div>
      </div>

      {/* وسام الشرف */}
      <div className="flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-700">
        <span className="text-2xl">🏆</span>
        <span className="text-sm font-bold text-slate-200">بطل الرياضيات الصغير</span>
      </div>
    </div>
  );
};

export default StudentStats;
