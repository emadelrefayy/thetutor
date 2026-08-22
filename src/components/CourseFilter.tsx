import React from 'react';

interface FilterProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedSubject: string;
  setSelectedSubject: (val: string) => void;
}

export const CourseFilter: React.FC<FilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedSubject,
  setSelectedSubject,
}) => {
  const subjects = ['الكل', 'الرياضيات', 'العلوم', 'اللغة العربية', 'الإنجليزي'];

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl relative z-10">
      {/* شريط البحث */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="🔍 ابحث عن اسم الدرس أو الوحدة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-3 px-5 pr-12 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
        />
      </div>

      {/* أزرار الفلترة حسب المادة */}
      <div className="flex flex-wrap gap-2 justify-center">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              selectedSubject === sub
                ? 'bg-amber-500 text-slate-950 scale-105 shadow-md'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseFilter;
