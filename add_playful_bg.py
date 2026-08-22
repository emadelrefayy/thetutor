import os

# 1. إنشاء مكون الأيقونات العائمة
playful_component = """import React from 'react';

export const PlayfulBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-15 select-none">
      {/* قلم رصاص عائم */}
      <div className="absolute top-[10%] left-[5%] text-6xl animate-bounce duration-[3000ms]">
        ✏️
      </div>
      {/* كتاب مفتوح */}
      <div className="absolute top-[25%] right-[8%] text-7xl animate-pulse duration-[4000ms]">
        📖
      </div>
      {/* مسطرة وحقيبة */}
      <div className="absolute top-[60%] left-[8%] text-6xl animate-bounce duration-[5000ms]">
        📐
      </div>
      <div className="absolute top-[75%] right-[10%] text-7xl animate-pulse duration-[3500ms]">
        🎒
      </div>
      {/* لوحة ألوان ونجمة */}
      <div className="absolute top-[45%] left-[85%] text-6xl animate-bounce duration-[4500ms]">
        🎨
      </div>
      <div className="absolute bottom-[10%] left-[45%] text-6xl animate-pulse duration-[2500ms]">
        ⭐
      </div>
    </div>
  );
};

export default PlayfulBackground;
"""

os.makedirs('src/components', exist_ok=True)
with open('src/components/PlayfulBackground.tsx', 'w', encoding='utf-8') as f:
    f.write(playful_component)

print("✅ Created PlayfulBackground component successfully!")

# 2. دمج المكون في App.tsx أو الصفحة الرئيسية
app_path = 'src/App.tsx'
if not os.path.exists(app_path):
    app_path = 'src/App.jsx'

if os.path.exists(app_path):
    with open(app_path, 'r', encoding='utf-8') as f:
        app_code = f.read()

    if 'PlayfulBackground' not in app_code:
        # إضافة الـ Import
        app_code = "import { PlayfulBackground } from './components/PlayfulBackground';\n" + app_code
        # إضافة المكون داخل الـ Return الرئيسي
        app_code = app_code.replace('<div', '<div className="relative min-h-screen">\n      <PlayfulBackground />\n      <div', 1)

        with open(app_path, 'w', encoding='utf-8') as f:
            f.write(app_code)
        print(f"✅ Integrated PlayfulBackground into {app_path}")
