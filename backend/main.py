from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="The Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# نماذج البيانات (Models)
class ProfileUpdate(BaseModel):
    full_name: str
    grade_level: int
    avatar_url: Optional[str] = None

class VideoUrlUpdate(BaseModel):
    lesson_id: int
    youtube_url: str

# Endpoints
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": "The Tutor API"}

# الحصول على مواد صف دراسي معين
@app.get("/api/subjects/{grade_level}")
async def get_subjects_for_grade(grade_level: int):
    all_subjects = [
        {"id": 1, "name_ar": "اللغة العربية", "code": "arabic", "icon": "📖", "color": "bg-amber-100 text-amber-800", "min_grade": 1},
        {"id": 2, "name_ar": "الرياضيات (Math)", "code": "math", "icon": "📐", "color": "bg-blue-100 text-blue-800", "min_grade": 1},
        {"id": 3, "name_ar": "العلوم (Science)", "code": "science", "icon": "🔬", "color": "bg-emerald-100 text-emerald-800", "min_grade": 1},
        {"id": 4, "name_ar": "اللغة الإنجليزية (Connect)", "code": "connect", "icon": "🇬🇧", "color": "bg-purple-100 text-purple-800", "min_grade": 1},
        {"id": 5, "name_ar": "المستوى الرفيع (Connect Plus)", "code": "connect_plus", "icon": "🌟", "color": "bg-indigo-100 text-indigo-800", "min_grade": 1},
        {"id": 6, "name_ar": "تكنولوجيا المعلومات (ICT)", "code": "ict", "icon": "💻", "color": "bg-cyan-100 text-cyan-800", "min_grade": 1},
        {"id": 7, "name_ar": "الدراسات الاجتماعية", "code": "social_studies", "icon": "🌍", "color": "bg-orange-100 text-orange-800", "min_grade": 4},
        {"id": 8, "name_ar": "المهارات المهنية", "code": "pro_skills", "icon": "🛠️", "color": "bg-rose-100 text-rose-800", "min_grade": 4},
        {"id": 9, "name_ar": "التربية الدينية", "code": "religion", "icon": "🕌", "color": "bg-teal-100 text-teal-800", "min_grade": 1},
    ]
    # تصفية المواد حسب الصف الدراسي
    filtered = [s for s in all_subjects if s["min_grade"] <= grade_level]
    return {"grade_level": grade_level, "subjects": filtered}

# جلب أسئلة اللعبة العامة (9 أسئلة)
@app.get("/api/games/general/{grade_level}")
async def get_general_game_questions(grade_level: int, limit: int = 9):
    questions = []
    for i in range(1, limit + 1):
        questions.append({
            "id": i,
            "question": f"سؤال تحدي رقم {i} للصف {grade_level} الابتدائي؟",
            "options": ["الإجابة الأولى", "الإجابة الثانية", "الإجابة الثالثة", "الإجابة الرابعة"],
            "correct_option_index": 0
        })
    return {"count": len(questions), "questions": questions}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
