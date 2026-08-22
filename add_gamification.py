import os

# 1. إنشاء مكون شريط نقاط وإنجازات الطفل
gamification_component = """import React, { useState } from 'react';

export const StudentStats = () => {
  const [points, setPoints] = useState(120);
  const [streak, setStreak] = useState(3);

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 text-white shadow-lg relative z-10">
      {/* النقاط والنجوم */}
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-bounce">⭐</span>
        <div>
          <p className="text-xs text-amber-300 font-bold">مجموع النقاط</p>
          <p className="text-xl font-extrabold text-amber-400">{points} نقطة</p>
        </div>
      </div>

      {/* أيام الحضور المستمر */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-xs text-orange-300 font-bold">التفاعل المستمر</p>
          <p className="text-xl font-extrabold text-orange-400">{streak} أيام متتالية</p>
        </div>
      </div>

      {/* وسام الشرف */}
      <div className="flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-700">
        <span className="text-2xl">🏆</span>
        <span className="text-sm font-bold text-slate-200">بطل الرياضيات الصغير</span>
      </div>
    </div>
  );
};

export default StudentStats;
"""

os.makedirs('src/components', exist_ok=True)
with open('src/components/StudentStats.tsx', 'w', encoding='utf-8') as f:
    f.write(gamification_component)

print("✅ StudentStats component created successfully!")

# 2. ربطه بصفحة الطلاب الرئيسية
catalog_path = 'src/CurriculumCatalog.tsx'
if not os.path.exists(catalog_path):
    catalog_path = 'src/StudentCatalog.tsx'

if os.path.exists(catalog_path):
    with open(catalog_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'StudentStats' not in content:
        content = "import { StudentStats } from './components/StudentStats';\n" + content
        content = content.replace('<CourseFilter', '<StudentStats />\n      <CourseFilter')
        with open(catalog_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Integrated StudentStats into {catalog_path}")
