import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173",
)

if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL.")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_SERVICE_ROLE_KEY."
    )

SUPABASE_REST_URL = (
    f"{SUPABASE_URL.rstrip('/')}/rest/v1"
)

SUPABASE_HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": (
        f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    ),
    "Content-Type": "application/json",
}

app = FastAPI(
    title="The Tutor API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in FRONTEND_ORIGIN.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def supabase_request(
    method: str,
    table: str,
    *,
    params: dict | None = None,
    json: dict | list | None = None,
):
    headers = {
        **SUPABASE_HEADERS,
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:
        response = await client.request(
            method,
            f"{SUPABASE_REST_URL}/{table}",
            headers=headers,
            params=params,
            json=json,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Supabase request failed.",
                "status": response.status_code,
                "response": response.text,
            },
        )

    if not response.content:
        return []

    return response.json()


@app.get("/")
async def root():
    return {
        "service": "The Tutor API",
        "status": "online",
    }


@app.get("/api/health")
async def health():
    return {
        "service": "The Tutor API",
        "status": "healthy",
    }


@app.get("/api/grades")
async def get_grades():
    return await supabase_request(
        "GET",
        "grades",
        params={
            "select": "*",
            "order": "id.asc",
        },
    )


@app.get("/api/grades/{grade_id}/terms")
async def get_grade_terms(
    grade_id: int,
):
    return await supabase_request(
        "GET",
        "terms",
        params={
            "grade_id": f"eq.{grade_id}",
            "select": "*",
            "order": "id.asc",
        },
    )


@app.get("/api/terms/{term_id}/subjects")
async def get_term_subjects(
    term_id: int,
):
    return await supabase_request(
        "GET",
        "subjects",
        params={
            "term_id": f"eq.{term_id}",
            "select": "*",
            "order": "id.asc",
        },
    )


@app.get("/api/subjects/{subject_id}/units")
async def get_subject_units(
    subject_id: int,
):
    return await supabase_request(
        "GET",
        "units",
        params={
            "subject_id": f"eq.{subject_id}",
            "select": "*",
            "order": "id.asc",
        },
    )


@app.get("/api/units/{unit_id}/lessons")
async def get_unit_lessons(
    unit_id: int,
):
    return await supabase_request(
        "GET",
        "lessons",
        params={
            "unit_id": f"eq.{unit_id}",
            "select": "*",
            "order": "id.asc",
        },
    )


@app.get("/api/lessons/{lesson_id}")
async def get_lesson(
    lesson_id: int,
):
    lessons = await supabase_request(
        "GET",
        "lessons",
        params={
            "id": f"eq.{lesson_id}",
            "select": "*",
            "limit": "1",
        },
    )

    if not lessons:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found.",
        )

    return lessons[0]


@app.get(
    "/api/lessons/{lesson_id}/content"
)
async def get_lesson_content(
    lesson_id: int,
):
    return await supabase_request(
        "GET",
        "lesson_content_blocks",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": "*",
            "order": "sort_order.asc",
        },
    )


@app.get(
    "/api/lessons/{lesson_id}/assets"
)
async def get_lesson_assets(
    lesson_id: int,
):
    return await supabase_request(
        "GET",
        "lesson_assets",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": "*",
            "order": "id.asc",
        },
    )


@app.get(
    "/api/lessons/{lesson_id}/questions"
)
async def get_lesson_questions(
    lesson_id: int,
):
    return await supabase_request(
        "GET",
        "question_lessons",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "relevance,"
                "questions("
                "id,"
                "question_type,"
                "difficulty,"
                "prompt,"
                "explanation,"
                "correct_answer,"
                "metadata,"
                "source,"
                "status,"
                "skill_type,"
                "generation_source,"
                "question_options(*)"
                ")"
            ),
            "order": "relevance.desc",
        },
    )


@app.get(
    "/api/questions/{question_id}"
)
async def get_question(
    question_id: str,
):
    questions = await supabase_request(
        "GET",
        "questions",
        params={
            "id": f"eq.{question_id}",
            "select": (
                "*,question_options(*)"
            ),
            "limit": "1",
        },
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Question not found.",
        )

    return questions[0]