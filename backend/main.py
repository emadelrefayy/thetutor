from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# السماح للـ Frontend بالتواصل
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint تجريبي (الصحة)
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Endpoint خاص بالدروس (بيانات وهمية دلوقتي)
@app.get("/api/lessons/{lesson_id}")
async def get_lesson(lesson_id: int):
    return {
        "id": lesson_id,
        "title": f"الدرس رقم {lesson_id}",
        "description": "ده شرح تجريبي للدرس",
        "youtube_link": "https://youtu.be/example",
        "game_data": {"question": "ده سؤال تجريبي؟", "options": ["نعم", "لا"]}
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
