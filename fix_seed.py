import re, os

filepath = 'src/pages/Admin.tsx'
if not os.path.exists(filepath):
    # البحث عن الملف لو المسار مختلف
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file in ['Admin.tsx', 'AdminPanel.tsx', 'Admin.jsx']:
                filepath = os.path.join(root, file)
                break

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# استبدال دالة الضخ لمنع التكرار
clean_code = """
  const handleSeed = async () => {
    try {
      await supabase.from('lessons').delete().neq('id', 0);
      const { error } = await supabase.from('lessons').insert([
        {
          title: 'الدرس الأول: الأعداد حتى 10',
          subject: 'الرياضيات',
          grade: 'الصف الأول الابتدائي',
          term: 'الترم 1',
          unit: 'الوحدة الأولى: الأعداد'
        }
      ]);
      if (error) throw error;
      alert('تم تنظيف الجدول وضخ البيانات بنجاح بدون تكرار!');
      if (typeof fetchLessons === 'function') fetchLessons();
    } catch (err) {
      alert('خطأ أثناء الضخ: ' + err.message);
    }
  };
"""

# استبدال الدالة القديمة
new_content = re.sub(r'const handleSeed\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\};', clean_code, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"DONE: Updated {filepath}")
