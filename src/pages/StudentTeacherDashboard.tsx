import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CartoonBackground from '../components/CartoonBackground';

interface SubjectProgress {
  id: number;
  name: string;
  icon: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
}

interface Message {
  id: number;
  sender: string;
  role: string;
  text: string;
  date: string;
}

const StudentTeacherDashboard: React.FC = () => {
  const [subjects] = useState<SubjectProgress[]>([
    { id: 1, name: 'اللغة العربية', icon: '📖', progress: 80, lessonsCompleted: 8, totalLessons: 10 },
    { id: 2, name: 'الرياضيات (Math)', icon: '📐', progress: 90, lessonsCompleted: 9, totalLessons: 10 },
    { id: 3, name: 'العلوم (Science)', icon: '🔬', progress: 70, lessonsCompleted: 7, totalLessons: 10 },
    { id: 4, name: 'اللغة الإنجليزية', icon: '🇬🇧', progress: 100, lessonsCompleted: 10, totalLessons: 10 },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'أ. إبراهيم حسن', role: 'معلم الرياضيات', text: 'ممتاز يا أحمد في حل واجب الأعداد الكبيرة! راجع الدرس الثالث مجدداً للتمكن أكثر.', date: '2026-08-19' },
    { id: 2, sender: 'أ. مروة السيد', role: 'معلمة العلوم', text: 'لا تنسَ حل لعبة التحدي الخاصة بدرس الجهاز الهضمي اليوم.', date: '2026-08-20' },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now(),
      sender: 'أحمد علي (طالب)',
      role: 'طالب',
      text: newMessage,
      date: new Date().toISOString().split('T')[0],
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] relative overflow-hidden font-sans dir-rtl">
      <CartoonBackground />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-amber-800 mb-2">🎓 لوحة الطالب والمعلم (الدروس والفصول)</h1>
          <p className="text-md font-bold text-amber-600">عرض المواد الدراسية، متابعة الفصول، ورسائل المراجعة المباشرة مع المعلم</p>
        </header>

        <section className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200 mb-8">
          <h2 className="text-2xl font-black text-amber-700 mb-6 flex items-center gap-2">
            📚 موادي الدراسية ونسبة الإنجاز (الصف الرابع الابتدائي)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{sub.icon}</span>
                    <h3 className="text-lg font-bold text-gray-800">{sub.name}</h3>
                  </div>
                  <span className="text-sm font-black text-amber-700">{sub.lessonsCompleted} / {sub.totalLessons} دروس</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-gray-500 mt-2 text-left">مكتمل بنسبة {sub.progress}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <h2 className="text-2xl font-black text-amber-700 mb-6 flex items-center gap-2">
            💬 رسائل المراجعة والتواصل مع معلمي الفصل
          </h2>

          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto p-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border ${
                  m.role === 'طالب' ? 'bg-amber-100/70 border-amber-300 mr-8' : 'bg-blue-50/70 border-blue-200 ml-8'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-gray-800">{m.sender} <span className="text-xs text-gray-500 font-normal">({m.role})</span></span>
                  <span className="text-xs text-gray-400 font-bold">{m.date}</span>
                </div>
                <p className="text-gray-700 font-bold text-sm">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب سؤالك أو استفسارك للمعلم هنا..."
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-amber-500 outline-none font-bold"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-3 rounded-2xl shadow transition-transform hover:scale-105"
            >
              إرسال 🚀
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default StudentTeacherDashboard;
