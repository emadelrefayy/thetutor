import os, re

# البحث عن الملفات التي تحوي وسم اللوجو أو الصور في src
targets = []
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.jsx', '.css')):
            targets.append(os.path.join(root, file))

updated = False
for filepath in targets:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # البحث عن أبعاد اللوجو أو الكلاسات الخاصة به وتكبيرها
    if 'logo' in content.lower() or 'brand' in content.lower():
        # تعديل القيم البرمجية المباشرة للحجم مثل h-8, h-10, h-12 أو w-8 إلخ (Tailwind)
        new_content = re.sub(r'h-(8|10|12)', 'h-16', content)
        new_content = re.sub(r'w-(8|10|12)', 'w-16', new_content)
        
        # تعديل Inline Styles لو موجودة (مثل width: 40px -> 50px أو height)
        def scale_px(match):
            val = int(match.group(1))
            return f"{match.group(0).split(':')[0]}: {int(val * 1.2)}px"
            
        new_content = re.sub(r'(?:width|height)\s*:\s*\'?(\d+)px\'?', scale_px, new_content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Updated logo size in: {filepath}")
            updated = True

if not updated:
    print("⚠️ لم يتم العثور على أبعاد صريحة للوجو، يرجى مراجعة المكون مباشرة.")
