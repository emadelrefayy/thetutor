import React, { useState } from 'react';

export default function StudySpace() {
  const [title, setTitle] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
    setTitle('');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-slate-100">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-amber-400 mb-3">📂 مساحة المذاكرة والواجبات</h1>
        <p className="text-slate-300 text-lg">ارفع حلول الواجبات والمذكرات الخاصة بك لتحفظ بأمان وسهولة.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📤</span> رفع واجب أو مذكرة جديدة
        </h3>

        {success && (
          <div className="mb-6 p-4 rounded-xl text-sm font-semibold border bg-emerald-950/40 border-emerald-500/50 text-emerald-300">
            ✅ تم رفع الواجب وحفظه بنجاح في مساحتك السحابية!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">عنوان الواجب / المذكرة:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: حل شيت علوم الدرس الأول"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg"
          >
            رفع وحفظ المستند 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
