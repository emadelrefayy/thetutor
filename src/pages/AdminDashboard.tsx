import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CartoonBackground from '../components/CartoonBackground';

interface UserAccount {
  id: string;
  name: string;
  role: string;
  grade: number;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([
    { id: '1', name: 'أحمد علي', role: 'طالب', grade: 4, status: 'نشط' },
    { id: '2', name: 'محمد محمود (ولي أمر)', role: 'ولي أمر', grade: 4, status: 'نشط' },
    { id: '3', name: 'أ. إبراهيم حسن', role: 'معلم', grade: 4, status: 'نشط' },
  ]);

  const [lessonId, setLessonId] = useState('1');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const handleUpdateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`✅ تم تحديث رابط الفيديو للدرس رقم (${lessonId}) بنجاح!`);
    setNewVideoUrl('');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] relative overflow-hidden font-sans dir-rtl">
      <CartoonBackground />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-amber-800 mb-2">👑 لوحة تحكم السوبر أدمن</h1>
          <p className="text-md font-bold text-amber-600">إدارة المستخديين، الاشتراكات، وتعديل روابط الدروس والفيديوهات المعطوبة</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* قسم تحديث روابط الفيديوهات المعطوبة */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200">
            <h2 className="text-2xl font-black text-amber-700 mb-4 flex items-center gap-2">
              🛠️ اصلاح وتحديث رابط فيديو معطوب
            </h2>
            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">رقم المعرف للدرس (Lesson ID):</label>
                <input
                  type="text"
                  required
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">رابط YouTube الجديد:</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 font-bold"
                />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-xl shadow-md">
                حفظ وحقن الرابط الجديد 🔄
              </button>
            </form>
          </div>

          {/* إحصائيات سريعة */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200 flex flex-col justify-between">
            <h2 className="text-2xl font-black text-amber-700 mb-4">📊 إحصائيات المنصة السريعة</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                <span className="text-3xl font-black text-amber-600 block">1,240</span>
                <span className="font-bold text-gray-600">إجمالي الطلاب</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
                <span className="text-3xl font-black text-emerald-600 block">98%</span>
                <span className="font-bold text-gray-600">اشتراكات نشطة</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-center">
              <span className="text-2xl font-black text-indigo-600 block">135</span>
              <span className="font-bold text-gray-600">دروس فيديو مفهرسة</span>
            </div>
          </div>
        </div>

        {/* إدارة الحسابات والاشتراكات */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h2 className="text-2xl font-black text-amber-700 mb-4">👥 حسابات المستخدمين والاشتراكات</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right font-bold">
              <thead>
                <tr className="border-b-2 border-amber-200 text-amber-800">
                  <th className="p-3">اسم المستخدم</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">الصف الدراسي</th>
                  <th className="p-3">حالة الاشتراك</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3"><span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">{u.role}</span></td>
                    <td className="p-3">الصف {u.grade}</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
