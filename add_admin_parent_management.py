import os, re

filepath = 'src/pages/Admin.tsx'
if not os.path.exists(filepath):
    filepath = 'src/Admin.tsx'

if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    admin_parent_section = """
      {/* قسم إدارة أولياء الأمور والأبناء للسوبر أدمن */}
      <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>👨‍👩‍👧‍👦 إدارة أولياء الأمور والأبناء (Super Admin)</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          يمكنك كسوبر أدمن متابعة جميع أولياء الأمور، تحديد الحد الأقصى لإضافة الأبناء، وتعديل بيانات أي طالب.
        </p>
        <div style={{ background: '#0f172a', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
          <small style={{ color: '#38bdf8' }}>💡 يتم تطبيق سياسة Row Level Security (RLS) لضمان أن كل ولي أمر يرى أطفاله فقط، بينما يرى السوبر أدمن الجميع.</small>
        </div>
      </div>
"""

    if 'إدارة أولياء الأمور' not in content:
        content = content.replace('</div>\n  );', admin_parent_section + '\n    </div>\n  );')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Integrated Parent/Child management section into {filepath}")
