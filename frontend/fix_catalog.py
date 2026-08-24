import re

file_path = "src/CurriculumCatalog.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. تحديث الـ Interface لتشمل كل الخصائص المحتملة
old_interface = "interface Lesson { id: number; subject_id: number; term: term: number; unit_title: string; lesson_title: string; }"
new_interface = """interface Lesson {
  id: number;
  subject_id: number;
  term: number;
  unit_title: string;
  lesson_title: string;
  title?: string;
  unit?: string;
  subject?: any;
}"""

content = re.sub(r'interface Lesson \{[^}]*\}', new_interface, content)

# 2. ضمان وجود متغير searchTerm وإصلاح فلترة الدروس
search_fix = """  const [searchTerm, setSearchTerm] = useState<string>('');

  // منطق الفلترة المباشرة الآمن للدروس
  const filteredLessons = lessons.filter((lesson) => {
    const lTitle = lesson.lesson_title || lesson.title || '';
    const lUnit = lesson.unit_title || lesson.unit || '';
    const matchesSearch = lTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lUnit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === null || lesson.subject_id === selectedSubject;
    return matchesSearch && matchesSubject;
  });"""

# استبدال منطق الفلترة القديم المكسور
content = re.sub(r'// منطق الفلترة المباشرة للدروس[\s\S]*?return matchesSearch && matchesSubject;\n  \};', search_fix, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ CurriculumCatalog.tsx has been fixed properly.")
