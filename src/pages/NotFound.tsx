import React from 'react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 text-white bg-slate-900 relative overflow-hidden">
      <div className="text-9xl mb-4 animate-bounce">🤖</div>
      <h1 className="text-4xl font-bold mb-2 text-amber-400">أوه! الصفحة غير موجودة</h1>
      <p className="text-slate-300 text-lg mb-6">يبدو أنك تهت في عالم العلوم والمغامرات!</p>
      <a 
        href="/" 
        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105"
      >
        🏠 العودة للصفحة الرئيسية
      </a>
    </div>
  );
};

export default NotFound;
