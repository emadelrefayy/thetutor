import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CartoonBackground from '../components/CartoonBackground';

interface HomeworkItem {
  id: number;
  title: string;
  subject: string;
  fileName: string;
  driveUrl: string;
  date: string;
}

const StudySpace: React.FC = () => {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([
    { id: 1, title: 'حل واجب الدرس الأول - لغة عربية', subject: 'اللغة العربية', fileName: 'arabic_hw1.pdf', driveUrl: 'https://drive.google.com', date: '2026-08-15' },
    { id: 2, title: 'شيت مراجعة الأعداد الكبيرة - رياضيات', subject: 'الرياضيات', fileName: 'math_sheet1.jpg', driveUrl: 'https://drive.google.com', date: '2026-08-18' },
  ]);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('اللغة العربية');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);

    // محاكاة رفع الملف إلى Google Drive عبر API
    setTimeout(() => {
      const newItem: HomeworkItem = {
        id: Date.now(),
        title,
        subject,
        fileName: file.name,
        driveUrl: `https://drive.google.com/file/d/mock_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
      };

      setHomeworks([newItem, ...homeworks]);
      setTitle('');
      setFile(null);
      setIsUploading(false);
      alert('✅ تم رفع الواجب/المذكرة بنجاح إلى Google Drive!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] relative overflow-hidden font-sans dir-rtl">
      <CartoonBackground />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10 relative z-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-amber-800 mb-2">📁 مساحة المذاكرة والواجبات</h1>
          <p className="text-md font-bold text-amber-600">ارفع حلول الواجبات والمذكرات الخاصة بك لتُحفظ بأمان على Google Drive</p>
        </header>

        {/* نموذج الرفع */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-amber-200 mb-10">
          <h2 className="text-2xl font-black text-amber-700 mb-6 flex items-center gap-2">
            📤 رفع واجب أو مذكرة جديدة
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">عنوان الواجب / المذكرة:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: حل شيت علوم الدرس الأول"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-amber-500 outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2">المادة:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-amber-500 outline-none font-bold bg-white"
                >
                  <option value="اللغة العربية">اللغة العربية</option>
                  <option value="الرياضيات">الرياضيات (Math)</option>
                  <option value="العلوم">العلوم (Science)</option>
                  <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                  <option value="تكنولوجيا المعلومات">تكنولوجيا المعلومات (ICT)</option>
                  <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">اختر الملف (PDF أو صورة):</label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-amber-200 bg-amber-50 font-bold text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-2xl shadow-lg transition-all text-lg mt-4"
            >
              {isUploading ? 'جاري الرفع إلى Google Drive... ⏳' : 'رفع الملف الآن 🚀'}
            </button>
          </form>
        </div>

        {/* قائمة المذكرات والواجبات المرفوعة */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-amber-200">
          <h2 className="text-2xl font-black text-amber-700 mb-6 flex items-center gap-2">
            📑 الواجبات المرفوعة سابقاً
          </h2>

          <div className="space-y-4">
            {homeworks.map((hw) => (
              <div key={hw.id} className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{hw.title}</h3>
                  <div className="flex gap-4 text-xs font-bold text-gray-500 mt-1">
                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">{hw.subject}</span>
                    <span>📅 {hw.date}</span>
                    <span>📎 {hw.fileName}</span>
                  </div>
                </div>
                <a
                  href={hw.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow"
                >
                  عرض الملف 🔗
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudySpace;
