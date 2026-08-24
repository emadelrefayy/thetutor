import React from 'react';
import { Users, Award, BookOpen, CheckCircle, TrendingUp, Star } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* هيدر الصفحة */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">لوحة متابعة ولي الأمر 👨‍👩‍👧</h1>
            <p className="text-xs text-slate-400 mt-1">تقرير تفصيلي بمستوى الأبناء ونسبة إنجاز الدروس والواجبات</p>
          </div>
        </div>
      </div>

      {/* كارت بطاقة الابن */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 border-2 border-amber-400/40 rounded-2xl flex items-center justify-center text-2xl font-bold">
              👦
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">أحمد محمد</h2>
              <p className="text-xs text-slate-400">الصف الأول الابتدائي (لغات - تجريبي)</p>
            </div>
          </div>
          <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black px-4 py-1.5 rounded-full text-xs">
            مستوى ممتاز (92%) 🌟
          </span>
        </div>

        {/* شبكة الإحصائيات والأرقام */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>الدروس المكتملة</span>
            </div>
            <p className="text-xl font-black text-slate-100">18 / 24</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>مجموع النقاط</span>
            </div>
            <p className="text-xl font-black text-slate-100">1,250 نقطة</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>الأنشطة المكتملة</span>
            </div>
            <p className="text-xl font-black text-slate-100">32 نشاط</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>المعدل الأسبوعي</span>
            </div>
            <p className="text-xl font-black text-emerald-400">+15% ارتفاء</p>
          </div>
        </div>

        {/* التحديثات والتحديات الأخيرة */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            أحدث الدرجات والتحديات
          </h3>
          <div className="space-y-2">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-200 font-bold">Connect Plus 1 - Unit 1 Quiz</span>
              <span className="text-emerald-400 font-bold">10 / 10 (ممتاز)</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-200 font-bold">Mathematics 1 - Numbers 1 to 5</span>
              <span className="text-emerald-400 font-bold">9 / 10 (جيد جداً)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
