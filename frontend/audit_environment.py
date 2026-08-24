import os, json

print("==================================================")
print("🧐 1. فحص ملف package.json والحزم المثبتة:")
print("==================================================")
if os.path.exists('package.json'):
    with open('package.json', 'r', encoding='utf-8') as f:
        pkg = json.load(f)
    print("📦 Dependencies:")
    for k, v in pkg.get('dependencies', {}).items():
        print(f"  - {k}: {v}")
    print("\n🛠️ DevDependencies:")
    for k, v in pkg.get('devDependencies', {}).items():
        print(f"  - {k}: {v}")
else:
    print("❌ package.json غير موجود!")

print("\n==================================================")
print("📁 2. جرد كامل لجميع الملفات داخل مجلد src:")
print("==================================================")
for root, dirs, files in os.walk('src'):
    for file in files:
        full_path = os.path.join(root, file)
        size = os.path.getsize(full_path)
        print(f"📄 {full_path} ({size} bytes)")

print("\n==================================================")
print("🔗 3. التحقق من المسارات والـ Imports في App.tsx:")
print("==================================================")
app_path = 'src/App.tsx'
if not os.path.exists(app_path):
    app_path = 'src/App.jsx'

if os.path.exists(app_path):
    with open(app_path, 'r', encoding='utf-8') as f:
        print(f.read())
else:
    print("❌ لم يتم العثور على App.tsx")

