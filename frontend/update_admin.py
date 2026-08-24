import os

# البحث عن ملف الأدمن في السورس
filepath = 'src/pages/Admin.tsx'
if not os.path.exists(filepath):
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file in ['Admin.tsx', 'AdminPanel.tsx', 'Admin.jsx']:
                filepath = os.path.join(root, file)
                break

full_admin_code = """import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const Admin = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('الرياضيات');
  const [grade, setGrade] = useState('الصف الأول الابتدائي');
  const [term, setTerm] = useState('الترم 1');
  const [unit, setUnit] = useState('');

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('lessons').select('*').order('id', { ascending: false });
    if (!error && data) setLessons(data);
    setLoading(false);
  };

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
      alert('تم تنظيف الجدول وضخ البيانات بنجاح!');
      fetchLessons();
    } catch (err: any) {
      alert('خطأ أثناء الضخ: ' + err.message);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('برجاء كتابة عنوان الدرس');
    
    const { error } = await supabase.from('lessons').insert([
      { title, subject, grade, term, unit: unit || 'عام' }
    ]);

    if (error) {
      alert('خطأ في الإضافة: ' + error.message);
    } else {
      alert('تم إضافة الدرس بنجاح!');
      setTitle('');
      setUnit('');
      fetchLessons();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت تأكد من حذف هذا الدرس؟')) return;
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) alert('خطأ في الحذف: ' + error.message);
    else fetchLessons();
  };

  return (
    <div style={{ padding: '20px', color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🛠️ لوحة تحكم الأدمن</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleSeed} style={{ background: '#e67e22', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
          🔄 إعادة ضخ البيانات (تنظيف وتحديث)
        </button>
      </div>

      {/* نموذج إضافة درس جديد */}
      <form onSubmit={handleAddLesson} style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>➕ إضافة درس جديد</h3>
        <input 
          type="text" 
          placeholder="عنوان الدرس" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px' }}
        />
        <input 
          type="text" 
          placeholder="الوحدة (اختياري)" 
          value={unit} 
          onChange={(e) => setUnit(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px' }}
        />
        <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          حفظ الدرس
        </button>
      </form>

      {/* عرض الدروس الحالية */}
      <h3>📚 الدروس الحالية ({lessons.length})</h3>
      {loading ? <p>جاري التحميل...</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {lessons.map((lesson) => (
            <li key={lesson.id} style={{ background: '#334155', margin: '8px 0', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{lesson.title}</strong> - <small>{lesson.subject} ({lesson.grade})</small>
              </div>
              <button onClick={() => handleDelete(lesson.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                حذف
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Admin;
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(full_admin_code)

print(f"✅ Successfully updated: {filepath}")
