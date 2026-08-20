import json

# قائمة المناهج المعتمدة للمرحلة الابتدائية (من الصف الأول لـ السادس)
CURRICULUM_DATA = [
    # --- الصف الأول الابتدائي ---
    {"subject_code": "arabic", "grade": 1, "title": "الدرس الأول: حرف الألف والباكورة", "description": "تعلم نطق وكتابة حرف الألف بحركاته الفتح والضم والكسر.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "math", "grade": 1, "title": "Lesson 1: Numbers from 1 to 10", "description": "Counting objects, understanding quantity and basic number shapes.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "connect", "grade": 1, "title": "Unit 1: Hello! - Lesson 1", "description": "Greetings, introducing yourself, and classroom objects.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "connect_plus", "grade": 1, "title": "Unit 1: All About Me", "description": "Advanced vocabulary for family members and body parts.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    
    # --- الصف الرابع الابتدائي ---
    {"subject_code": "arabic", "grade": 4, "title": "الدرس الأول: مريم ومريم (النص المعلوماتي)", "description": "التعرف على العالمة مريم الإسطرلابي وتاريخ علم الفلك.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "math", "grade": 4, "title": "Unit 1 - Lesson 1: Large Numbers & Place Value", "description": "Understanding millions, place value charts, and standard form.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "science", "grade": 4, "title": "Concept 1.1: Adaptation and Survival", "description": "How animals like the Fennec Fox and Penguin adapt to their environment.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "ict", "grade": 4, "title": "Theme 1 - Lesson 1: Explorer in Action", "description": "Albert Lin's archaeological tools and technology use.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "social_studies", "grade": 4, "title": "الدرس الأول: أدوات تحديد الموقع", "description": "استخدام الخريطة ورأس السهم والبوصلة والصور الجوية.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "pro_skills", "grade": 4, "title": "الدرس الأول: الترابط الأسري", "description": "مفهوم الأسرة وأهمية الاحترام بين الأفراد.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    
    # --- الصف السادس الابتدائي ---
    {"subject_code": "arabic", "grade": 6, "title": "الدرس الأول: كن ولا تكن", "description": "نصائح وإرشادات حول التفاؤل والاجتهاد وتجنب الكسل.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "math", "grade": 6, "title": "Unit 1: Long Division and Ratios", "description": "Solving real-life problems using long division and ratio applications.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    {"subject_code": "science", "grade": 6, "title": "Unit 1: The Cell as a System", "description": "Exploring plant and animal cells, cell wall, organelles, and functions.", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
]

print(f"✅ تم إعداد بيانات المناهج بنجاح! عدد الدروس المجهزة للحقن: {len(CURRICULUM_DATA)}")
