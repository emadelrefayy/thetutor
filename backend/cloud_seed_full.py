from supabase import create_client, Client

url = "https://xsfjlzneykogdltuiwno.supabase.co"
key = "sb_publishable_F9TC2g0rL4mwufMz0h0iJw_FSfOhj9-"

supabase: Client = create_client(url, key)

print("🚀 جاري رفع وحقن كافة المناهج والصفوف على Supabase Cloud...")

# 1. حقن الصفوف
grades_data = [
    {"id": 1, "name": "الصف الأول الابتدائي"},
    {"id": 2, "name": "الصف الثاني الابتدائي"},
    {"id": 3, "name": "الصف الثالث الابتدائي"},
    {"id": 4, "name": "الصف الرابع الابتدائي"},
    {"id": 5, "name": "الصف الخامس الابتدائي"},
    {"id": 6, "name": "الصف السادس الابتدائي"},
]

try:
    supabase.table("grades").upsert(grades_data).execute()
    print("✅ تم رفع الصفوف الدراسية (Grades) بنجاح!")
except Exception as e:
    print(f"❌ خطأ في رفع الصفوف: {e}")

# 2. حقن الدروس والمناهج
curriculum_data = [
    {"subject_code": "arabic", "grade": 1, "title": "الدرس الأول: أشكال الحروف", "description": "تعلم أشكال الحروف العربية في أول ووسط وآخر الكلمة.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "math", "grade": 1, "title": "Lesson 1: Numbers from 1 to 10", "description": "Counting objects, understanding quantity and basic number shapes.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "connect", "grade": 1, "title": "Unit 1: Hello! - Lesson 1", "description": "Greetings, introducing yourself, and classroom objects.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "connect_plus", "grade": 1, "title": "Unit 1: All About Me", "description": "Advanced vocabulary for family members and body parts.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "math", "grade": 4, "title": "Unit 1 - Lesson 1: Large Numbers & Place Value", "description": "Understanding millions, place value charts, and standard form.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "science", "grade": 4, "title": "Concept 1.1: Adaptation and Survival", "description": "How animals like the Fennec Fox and Penguin adapt to their environment.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "ict", "grade": 4, "title": "Theme 1 - Lesson 1: Explorer in Action", "description": "Albert Lin's archaeological tools and technology use.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "arabic", "grade": 6, "title": "الدرس الأول: كن ولا تكن", "description": "نصائح وإرشادات حول التفاؤل والاجتهاد وتجنب الكسل.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "math", "grade": 6, "title": "Unit 1: Long Division and Ratios", "description": "Solving real-life problems using long division and ratio applications.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "science", "grade": 6, "title": "Unit 1: The Cell as a System", "description": "Exploring plant and animal cells, cell wall, organelles, and functions.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
]

try:
    supabase.table("lessons").upsert(curriculum_data).execute()
    print(f"🎉 تم حقن {len(curriculum_data)} درساً بنجاح على قاعدة بيانات Supabase الكلاود!")
except Exception as e:
    print(f"❌ خطأ في رفع الدروس: {e}")

