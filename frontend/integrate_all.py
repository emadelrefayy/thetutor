import os, re

# 1. إنشاء صفحة 404 مبهجة للطفل
not_found_code = """import React from 'react';

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
"""

os.makedirs('src/pages', exist_ok=True)
with open('src/pages/NotFound.tsx', 'w', encoding='utf-8') as f:
    f.write(not_found_code)

print("✅ Created NotFound (404) page.")

# 2. ربط الفلترة بصفحة الفهرس الأساسية CurriculumCatalog
catalog_path = 'src/CurriculumCatalog.tsx'
if not os.path.exists(catalog_path):
    catalog_path = 'src/StudentCatalog.tsx'

if os.path.exists(catalog_path):
    with open(catalog_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'CourseFilter' not in content:
        # إضافة الـ import
        content = "import { CourseFilter } from './components/CourseFilter';\n" + content
        
        # إضافة حالتَي البحث والمادة
        state_code = """
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('الكل');
"""
        content = re.sub(r'(export const \w+ = \(\) => \{)', r'\1' + state_code, content, count=1)

        with open(catalog_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ CourseFilter integrated into {catalog_path}")

