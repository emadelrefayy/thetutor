import React from 'react';
import Navbar from '../components/Navbar';
import CartoonBackground from '../components/CartoonBackground';

const ParentDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] relative overflow-hidden font-sans dir-rtl">
      <CartoonBackground />
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-amber-800 mb-2">👨‍👩‍👧‍👦 لوحة متابعة ولي الأمر</h1>
          <p className="text-md font-bold text-amber-600">تقرير تفصيلي بمستوى الأبناء ونسبة إنجاز الدروس والواجبات</p>
        </header>

        {/* كارت الطالب */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-amber-200 mb-8">
          <div className="flex items-center justify-between border-b pb-6 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">👦</span>
              <div>
                <h2 className="text-2xl font-black text-gray-800">الطالب: أحمد محمد</h2>
                <p className="font-bold text-amber-600">الصف الرابع الابتدائي 🏫</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold px-4 py-2 rounded-2xl">
              مستوى ممتازة (92%)
            </span>
          </div>

          {/* نتائج التحديات والدروس */}
          <h3 className="text-xl font-black text-amber-700 mb-4">📝 أحدث درجات التحديات والدروس:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="font-bold text-gray-600 block mb-1">اللغة العربية</span>
              <span className="text-2xl font-black text-amber-700">9/10 🎉</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <span className="font-bold text-gray-600 block mb-1">الرياضيات (Math)</span>
              <span className="text-2xl font-black text-blue-700">10/10 ⭐</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="font-bold text-gray-600 block mb-1">العلوم (Science)</span>
              <span className="text-2xl font-black text-emerald-700">8/10 🌟</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
