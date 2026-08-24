import React, { useState } from 'react';
import { BookOpen, Gamepad2, PlayCircle, ChevronLeft, ArrowRight, Sparkles, Image as ImageIcon, Trophy, Zap, Lock } from 'lucide-react';

// عينة من البيانات المربوطة بالأترام والمواد والدروس
const curriculumData = {
  term1: [
    {
      id: 'cp1_t1',
      title: 'Connect Plus 1 - Primary 1',
      subTitle: 'المنهج المتقدم للغة الإنجليزية (ترم أول)',
      icon: '🇬🇧',
      lessonsCount: 5,
      gameTitle: 'تحدي كلمات Connect Plus 1',
      lessons: [
        { id: 1, title: 'Lesson 1: This is me', completed: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', infographicUrl: 'https://placehold.co/800x1200/0f172a/f59e0b?text=Infographic+Lesson+1' },
        { id: 2, title: 'Lesson 2: My Family', completed: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', infographicUrl: 'https://placehold.co/800x1200/0f172a/f59e0b?text=Infographic+Lesson+2' },
        { id: 3, title: 'Lesson 3: School Supplies', completed: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', infographicUrl: '' }
      ]
    },
    {
      id: 'math1_t1',
      title: 'Mathematics 1 - Primary 1',
      subTitle: 'الرياضيات باللغة الإنجليزية (ترم أول)',
      icon: '🔢',
      lessonsCount: 4,
      gameTitle: 'مغامرة الأرقام والحساب',
      lessons: [
        { id: 4, title: 'Lesson 1: Numbers 1 to 5', completed: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', infographicUrl: '' }
      ]
    }
  ],
  term2: [
    {
      id: 'cp1_t2',
      title: 'Connect 1 - Term 2',
      subTitle: 'المنهج الأساسي للغة الإنجليزية (ترم ثاني)',
      icon: '🇬🇧',
      lessonsCount: 3,
      gameTitle: 'لعبة القواعد والكلمات',
      lessons: [
        { id: 5, title: 'Lesson 1: Animals around us', completed: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', infographicUrl: '' }
      ]
    },
    {
      id: 'ar_t2',
      title: 'اللغة العربية - الترم الثاني',
      subTitle: 'القراءة والحروف الأبجدية (ترم ثاني)',
      icon: '📚',
      lessonsCount: 4,
      gameTitle: 'تحدي الحروف والكلمات',
      lessons: [
        { id: 6, title: 'الدرس الأول: رحلة الحروف', completed: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', infographicUrl: '' }
      ]
    }
  ]
};

export default function CurriculumCatalog() {
  const [selectedTerm, setSelectedTerm] = useState<'term1' | 'term2'>('term1');
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [isPlayingTermGame, setIsPlayingTermGame] = useState(false);

  const currentSubjects = curriculumData[selectedTerm];

  // حساب عدد الدروس المكتملة في الترم الحالي
  const totalCompletedLessons = currentSubjects.reduce((acc, sub) => {
    return acc + sub.lessons.filter((l: any) => l.completed).length;
  }, 0);

  // 1. شاشة لعبة تحدي الترم الشامل
  if (isPlayingTermGame) {
    return (
      <div className="space-y-6 dir-rtl text-right animate-fadeIn">
        <button
          onClick={() => setIsPlayingTermGame(false)}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-800 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          الخروج من التحدي
        </button>

        <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-100">تحدي اختبار {selectedTerm === 'term1' ? 'الترم الأول' : 'الترم الثاني'} الشامل 🏆</h1>
                <p className="text-xs text-slate-400 mt-0.5">أسئلة تجمع المواد بناءً على ({totalCompletedLessons}) دروس أتممتها</p>
              </div>
            </div>
            <span className="bg-amber-500/20 text-amber-300 font-black text-xs px-3 py-1 rounded-full border border-amber-500/30">
              النقاط: +50 🌟
            </span>
          </div>

          {/* محاكي شاشة السؤال */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 text-center">
            <span className="bg-slate-800 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full">سؤال 1 من 5 (Connect Plus 1)</span>
            <h3 className="text-sm font-bold text-slate-100">Choose the correct word: "This is my ______ (family / book)"</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 font-bold text-xs p-3 rounded-xl transition-all">
                Family 👨‍👩‍👧
              </button>
              <button className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 font-bold text-xs p-3 rounded-xl transition-all">
                Book 📚
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. شاشة عرض الدرس (Lesson View)
  if (selectedLesson) {
    return (
      <div className="space-y-6 dir-rtl text-right animate-fadeIn">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-800 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع إلى دروس المادة
        </button>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            {selectedLesson.title}
          </h1>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              الإنفوجراف التعليمي
            </h2>
            {selectedLesson.infographicUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                <img src={selectedLesson.infographicUrl} alt="Infographic" className="w-full h-auto rounded-xl object-contain" />
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-500">
                لا يوجد صورة إنفوجراف مرفوقة لهذا الدرس حالياً.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-amber-400" />
              فيديو الشرح التفاعلي
            </h2>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe
                src={selectedLesson.videoUrl}
                title={selectedLesson.title}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                لعبة الدرس التفاعلية
              </h3>
              <p className="text-xs text-slate-400">اختبر معلوماتك في هذا الدرس باكتساب النقاط والأوسمة!</p>
            </div>
            <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all">
              ابدأ اللعبة 🎮
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. شاشة عرض دروس المادة (Subject View)
  if (selectedSubject) {
    return (
      <div className="space-y-6 dir-rtl text-right animate-fadeIn">
        <button
          onClick={() => setSelectedSubject(null)}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-800 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع لمواد الترم
        </button>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl mb-1 block">{selectedSubject.icon}</span>
              <h1 className="text-xl font-black text-slate-100">{selectedSubject.title}</h1>
              <p className="text-xs text-slate-400 mt-1">{selectedSubject.subTitle}</p>
            </div>
            <button className="bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all">
              <Gamepad2 className="w-4 h-4" />
              <span>{selectedSubject.gameTitle}</span>
            </button>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-bold text-slate-300">دروس المادة المتاحة ({selectedSubject.lessons.length}):</h2>
            <div className="grid grid-cols-1 gap-3">
              {selectedSubject.lessons.map((lesson: any) => (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors block">
                        {lesson.title}
                      </span>
                      {lesson.completed && (
                        <span className="text-[10px] text-emerald-400 font-bold">مكتمل 🟢 (جاهز للعبة الترم)</span>
                      )}
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. الشاشة الرئيسية لصفحة الطالب باختيار الترم وبنَر تحدي الترم الشامل
  return (
    <div className="space-y-6 dir-rtl text-right animate-fadeIn">
      {/* تبويب اختيار الترم */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex gap-2">
        <button
          onClick={() => setSelectedTerm('term1')}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            selectedTerm === 'term1'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>الترم الأول</span>
        </button>

        <button
          onClick={() => setSelectedTerm('term2')}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            selectedTerm === 'term2'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>الترم الثاني</span>
        </button>
      </div>

      {/* 🏆 كارت "تحدي الترم الشامل" (الذي يجمع أسئلة كل مواد الترم للدروس المكتملة) */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-100">تحدي اختبار {selectedTerm === 'term1' ? 'الترم الأول' : 'الترم الثاني'} الشامل</h3>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-500/30">
                كل المواد 🎮
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              اختبر معلوماتك العامة في مواد الترم من واقع ({totalCompletedLessons}) دروس أتممتها حتى الآن!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPlayingTermGame(true)}
          disabled={totalCompletedLessons === 0}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 ${
            totalCompletedLessons > 0
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {totalCompletedLessons > 0 ? (
            <>
              <Zap className="w-4 h-4 fill-current" />
              ابدأ التحدي الآن
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              أكمل درساً لفتح التحدي
            </>
          )}
        </button>
      </div>

      {/* قائمة المواد المعروضة */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 px-1">
          المواد الدراسية ({selectedTerm === 'term1' ? 'الترم الأول' : 'الترم الثاني'}) - اضغط على المادة لعرض الدروس:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl cursor-pointer transition-all space-y-4 group shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{subject.icon}</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                      {subject.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{subject.subTitle}</p>
                  </div>
                </div>
                <span className="bg-slate-950 border border-slate-800 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full">
                  {subject.lessonsCount} دروس
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  {subject.gameTitle}
                </span>
                <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                  عرض الدروس <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
