import os

print("🔍 === فحص المكونات الحالية في المشروع ===")
src_path = 'src'

for root, dirs, files in os.walk(src_path):
    for file in files:
        if file.endswith(('.tsx', '.jsx', '.ts', '.js')):
            full_path = os.path.join(root, file)
            size = os.path.getsize(full_path)
            print(f"📄 {full_path} ({size} bytes)")

print("\n💡 === اقتراحات ممتازة للتطوير قبل الـ Build ===")
print("1. صفحة عرض الدرس (Lesson View): تأكيد وجود مشغل فيديو أو عرض للمحتوى.")
print("2. صفحة 404 (Not Found): توجيه الطفل بشكل جذاب لو دخل رابط غلط.")
print("3. ربط شريط البحث بالداتا الحقيقية في HomePage.")
