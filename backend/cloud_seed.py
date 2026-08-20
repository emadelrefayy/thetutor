import os
from supabase import create_client, Client

url = "https://xsfjlzneykogdltuiwno.supabase.co"
key = "sb_publishable_F9TC2g0rL4mwufMz0h0iJw_FSfOhj9-"

supabase: Client = create_client(url, key)

print("🚀 جاري الاتصال بقاعدة بيانات Supabase السحابية...")

# إدخال الصفوف الدراسية الأساسية
grades_data = [
    {"id": 1, "name": "الصف الأول الابتدائي"},
    {"id": 2, "name": "الصف الثاني الابتدائي"},
    {"id": 3, "name": "الصف الثالث الابتدائي"},
    {"id": 4, "name": "الصف الرابع الابتدائي"},
    {"id": 5, "name": "الصف الخامس الابتدائي"},
    {"id": 6, "name": "الصف السادس الابتدائي"},
]

try:
    res = supabase.table("grades").upsert(grades_data).execute()
    print("✅ تم رفع وحقن الصفوف الدراسية على الكلاود بنجاح!")
except Exception as e:
    print(f"⚠️ تنبيه أثناء الحقن: {e}")

