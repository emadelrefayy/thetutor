import os, re

# البحث عن ملف الـ Navbar أو Header أو القائمة الرئيسية
targets = []
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.jsx')) and any(k in file.lower() for k in ['nav', 'header', 'app', 'layout']):
            targets.append(os.path.join(root, file))

updated = False
for filepath in targets:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # إضافة كلاسات الثبات للـ nav أو header أو div الرئيسي
    if '<nav' in content or '<header' in content or 'thetutor' in content:
        # استبدال className الخاصة بـ nav/header لتصبح sticky
        new_content = re.sub(
            r'<(nav|header)([^>]*?)className=["\']([^"\']*)["\']',
            r'<\1\2className="\3 sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 shadow-lg"',
            content
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Navbar is now fixed/sticky in: {filepath}")
            updated = True

if not updated:
    print("⚠️ تم التحقق، وسنتأكد من تطبيق الثبات في المكون الرئيسي.")
