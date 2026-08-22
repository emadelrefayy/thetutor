import os, re

target_file = 'src/CurriculumCatalog.tsx'
if not os.path.exists(target_file):
    target_file = 'src/StudentCatalog.tsx'

if os.path.exists(target_file):
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # التأكد من استدعاء المكون
    if 'CourseFilter' not in content:
        content = "import { CourseFilter } from './components/CourseFilter';\n" + content

    # إضافة كود الفلترة الديناميكية للمصفوفة
    filter_logic = """
  // منطق الفلترة المباشرة للدروس
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = (lesson.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lesson.unit || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'الكل' || lesson.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });
"""

    if 'filteredLessons' not in content:
        # ربط منطق الفلترة قبل الـ return
        content = re.sub(r'(return\s*\()', filter_logic + r'\1', content, count=1)
        
        # استبدال الخريطة lessons.map بـ filteredLessons.map
        content = content.replace('lessons.map', 'filteredLessons.map')

        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Filter logic bound successfully to {target_file}")
    else:
        print("ℹ️ Filter logic already present.")
