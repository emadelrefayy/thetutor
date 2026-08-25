import React, { useState } from 'react';

export const ParentDashboard: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');

  return (
    <div className="space-y-6 dir-rtl text-slate-100 pb-10" dir="rtl">
      {/* الترويسة الرئيسية */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
          <span>👨‍👩‍👧‍👦</span> لوحة تحكم ولي الأمر
        </h1>
        <p className="text-xs text-slate-400">
          متابعة المستوى الأكاديمي والدروس المخصصة للسنة الدراسية لأبنائك.
        </p>
      </div>

      <hr className="border-slate-800" />

      {/* كارت ربط ابن جديد - الداكن الكحلي */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
            🔑
          </div>
          <h2 className="text-lg font-bold text-slate-100">ربط ابن جديد بحسابك</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          أدخل رمز الدعوة المكون من 6 أرقام وحروف الذي حصلت عليه من إدارة المدرسة/الأدمن:
        </p>

        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="أدخل رمز الدعوة (مثال: X1Z9K2)"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-amber-400 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all text-center tracking-widest font-mono"
          />

          <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
            <span>➕</span> تأكيد الربط
          </button>
        </div>
      </div>

      {/* كارت الأبناء المربوطين - الداكن الكحلي */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            👥
          </div>
          <div>
            <p className="text-xs text-slate-400">الأبناء المربوطين</p>
            <h3 className="text-lg font-black text-slate-100">1 طالب</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
