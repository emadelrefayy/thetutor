import React, { useState } from 'react';

const StudentLesson: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'game'>('video');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 dir-rtl font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* هيدر الدرس */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
              Math - Primary 1 
            </span>
            <h1 className="text-xl font-black text-slate-100 mt-2">Lesson 1: Counting 1 to 3 🔢</h1>
            <p className="text-xs text-slate-400 mt-1">Unit 1: Numbers up to 10</p>
          </div>
          <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'video' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎥 الفيديو
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'notes' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📝 الشرح
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'game' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎮 اللعبة
            </button>
          </div>
        </div>

        {/* محتوى الشاشة حسب التاب المختار */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700 min-h-[350px]">
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Lesson Video"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-sm font-bold text-amber-400">ملخص الفيديو</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                في هذا الدرس نتعلم كيفية العد من 1 إلى 3 باستخدام الأشكال الممتعة والمكعبات الملونة.
              </p>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="prose prose-invert max-w-none text-slate-300 space-y-3 text-sm">
              <h2 className="text-amber-400 text-base font-bold">1. Counting 1 to 3</h2>
              <p>Look at the items around you:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>1 Apple 🍎</li>
                <li>2 Cars 🚗🚗</li>
                <li>3 Stars ⭐⭐⭐</li>
              </ul>
            </div>
          )}

          {activeTab === 'game' && (
            <div className="text-center py-12 space-y-4">
              <div className="text-4xl">🎲</div>
              <h3 className="text-base font-bold text-amber-400">لعبة العد التفاعلية</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                عد العرايس الظاهرة على الشاشة واختر الرقم الصحيح ليكتسب الطالب نقاط التميز!
              </p>
              <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg">
                ابدأ اللعب الآن 🚀
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentLesson;
