import os
import secrets
import string
from datetime import datetime, timezone
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


load_dotenv()


# ==================================================================
# Environment
# ==================================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
)
FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173",
)


if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL.")

if not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_KEY.")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_SERVICE_ROLE_KEY."
    )


SUPABASE_BASE_URL = SUPABASE_URL.rstrip("/")

SUPABASE_REST_URL = (
    f"{SUPABASE_BASE_URL}/rest/v1"
)

SUPABASE_AUTH_URL = (
    f"{SUPABASE_BASE_URL}/auth/v1"
)


# ==================================================================
# Application
# ==================================================================

app = FastAPI(
    title="The Tutor API",
    version="1.1.0",
)


allowed_origins = [
    origin.strip()
    for origin in FRONTEND_ORIGIN.split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================================
# Helpers
# ==================================================================

def require_bearer(
    authorization: str | None,
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization required.",
        )

    if not authorization.lower().startswith(
        "bearer "
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header.",
        )

    token = authorization[7:].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization token.",
        )

    return authorization


async def supabase_auth_user(
    authorization: str,
) -> dict:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": authorization,
    }

    async with httpx.AsyncClient(
        timeout=15.0
    ) as client:
        response = await client.get(
            f"{SUPABASE_AUTH_URL}/user",
            headers=headers,
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session.",
        )

    user = response.json()

    if not user.get("id"):
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user.",
        )

    return user


async def require_user(
    authorization: str | None,
) -> tuple[str, dict]:
    auth = require_bearer(authorization)
    user = await supabase_auth_user(auth)
    return auth, user


async def supabase_request(
    method: str,
    table: str,
    *,
    params: dict | None = None,
    payload: dict | list | None = None,
    authorization: str | None = None,
    privileged: bool = False,
):
    if privileged:
        key = SUPABASE_SERVICE_ROLE_KEY
        bearer = f"Bearer {key}"
    else:
        key = SUPABASE_KEY

        bearer = (
            authorization
            if authorization
            else f"Bearer {key}"
        )

    headers = {
        "apikey": key,
        "Authorization": bearer,
        "Content-Type": "application/json",
    }

    if method in {"POST", "PATCH", "PUT"}:
        headers["Prefer"] = (
            "return=representation"
        )

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:
        response = await client.request(
            method,
            f"{SUPABASE_REST_URL}/{table}",
            headers=headers,
            params=params,
            json=payload,
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

    try:
        return response.json()
    except ValueError:
        return []


def now_iso() -> str:
    return datetime.now(
        timezone.utc
    ).isoformat()


def generate_invitation_code() -> str:
    alphabet = (
        string.ascii_uppercase
        + string.digits
    )

    return (
        "TUTOR-"
        + "".join(
            secrets.choice(alphabet)
            for _ in range(8)
        )
    )


# ==================================================================
# Request models
# ==================================================================

class ProgressUpdate(BaseModel):
    status: str = Field(
        default="in_progress"
    )
    completion_percent: float = Field(
        default=0,
        ge=0,
        le=100,
    )
    time_spent_seconds: int = Field(
        default=0,
        ge=0,
    )


class LearningEventCreate(BaseModel):
    event_type: str
    lesson_id: int | None = None
    concept_id: int | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


class QuestionAttemptCreate(BaseModel):
    session_question_id: str
    answer: Any
    is_correct: bool
    points_awarded: int = Field(
        default=0,
        ge=0,
    )
    response_time_ms: int | None = Field(
        default=None,
        ge=0,
    )
    feedback: dict[str, Any] = Field(
        default_factory=dict
    )


class GameSessionCreate(BaseModel):
    game_definition_id: str


class GameSessionUpdate(BaseModel):
    status: str
    score: int = Field(
        default=0,
        ge=0,
    )
    max_score: int = Field(
        default=0,
        ge=0,
    )
    accuracy: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    xp_earned: int = Field(
        default=0,
        ge=0,
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


# ==================================================================
# Health
# ==================================================================

@app.get("/")
async def root():
    return {
        "service": "The Tutor API",
        "status": "online",
        "version": "1.1.0",
    }


@app.get("/api/health")
async def health():
    return {
        "service": "The Tutor API",
        "status": "healthy",
    }


# ==================================================================
# Curriculum
# ==================================================================

@app.get("/api/grades")
async def get_grades():
    return await supabase_request(
        "GET",
        "grades",
        params={
            "select": (
                "id,"
                "title,"
                "level_code,"
                "code,"
                "created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get("/api/grades/{grade_id}")
async def get_grade(
    grade_id: int,
):
    rows = await supabase_request(
        "GET",
        "grades",
        params={
            "id": f"eq.{grade_id}",
            "select": (
                "id,"
                "title,"
                "level_code,"
                "code,"
                "created_at"
            ),
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Grade not found.",
        )

    return rows[0]


@app.get("/api/grades/{grade_id}/terms")
async def get_grade_terms(
    grade_id: int,
):
    return await supabase_request(
        "GET",
        "terms",
        params={
            "grade_id": f"eq.{grade_id}",
            "select": (
                "id,"
                "title,"
                "code,"
                "grade_id,"
                "created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get("/api/terms/{term_id}")
async def get_term(
    term_id: int,
):
    rows = await supabase_request(
        "GET",
        "terms",
        params={
            "id": f"eq.{term_id}",
            "select": (
                "id,"
                "title,"
                "code,"
                "grade_id,"
                "created_at"
            ),
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Term not found.",
        )

    return rows[0]


@app.get("/api/terms/{term_id}/subjects")
async def get_term_subjects(
    term_id: int,
):
    return await supabase_request(
        "GET",
        "subjects",
        params={
            "term_id": f"eq.{term_id}",
            "select": (
                "id,"
                "term_id,"
                "title,"
                "code,"
                "icon_name,"
                "color_theme,"
                "created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get("/api/subjects/{subject_id}")
async def get_subject(
    subject_id: int,
):
    rows = await supabase_request(
        "GET",
        "subjects",
        params={
            "id": f"eq.{subject_id}",
            "select": (
                "id,"
                "term_id,"
                "title,"
                "code,"
                "icon_name,"
                "color_theme,"
                "created_at"
            ),
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Subject not found.",
        )

    return rows[0]


@app.get("/api/subjects/{subject_id}/units")
async def get_subject_units(
    subject_id: int,
):
    return await supabase_request(
        "GET",
        "units",
        params={
            "subject_id": f"eq.{subject_id}",
            "select": (
                "id,"
                "subject_id,"
                "unit_number,"
                "title,"
                "description,"
                "created_at"
            ),
            "order": "unit_number.asc",
        },
    )


@app.get("/api/units/{unit_id}")
async def get_unit(
    unit_id: int,
):
    rows = await supabase_request(
        "GET",
        "units",
        params={
            "id": f"eq.{unit_id}",
            "select": (
                "id,"
                "subject_id,"
                "unit_number,"
                "title,"
                "description,"
                "created_at"
            ),
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Unit not found.",
        )

    return rows[0]


@app.get("/api/units/{unit_id}/lessons")
async def get_unit_lessons(
    unit_id: int,
):
    return await supabase_request(
        "GET",
        "lessons",
        params={
            "unit_id": f"eq.{unit_id}",
            "select": (
                "id,"
                "subject_id,"
                "unit_id,"
                "unit_number,"
                "lesson_number,"
                "title,"
                "content_summary,"
                "video_url,"
                "infographic_url,"
                "game_url,"
                "created_at"
            ),
            "order": "lesson_number.asc",
        },
    )


# ==================================================================
# Lessons
# ==================================================================

@app.get("/api/lessons/{lesson_id}")
async def get_lesson(
    lesson_id: int,
):
    rows = await supabase_request(
        "GET",
        "lessons",
        params={
            "id": f"eq.{lesson_id}",
            "select": (
                "id,"
                "subject_id,"
                "unit_id,"
                "unit_number,"
                "lesson_number,"
                "title,"
                "content_summary,"
                "video_url,"
                "infographic_url,"
                "game_url,"
                "created_at"
            ),
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found.",
        )

    return rows[0]


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
            "is_published": "eq.true",
            "select": (
                "id,"
                "lesson_id,"
                "block_type,"
                "content,"
                "asset_id,"
                "sort_order,"
                "is_published,"
                "created_at"
            ),
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
            "is_published": "eq.true",
            "select": (
                "id,"
                "lesson_id,"
                "asset_type,"
                "title,"
                "url,"
                "storage_path,"
                "alt_text,"
                "metadata,"
                "sort_order,"
                "is_published,"
                "created_at"
            ),
            "order": "sort_order.asc",
        },
    )


@app.get(
    "/api/lessons/{lesson_id}/objectives"
)
async def get_lesson_objectives(
    lesson_id: int,
):
    return await supabase_request(
        "GET",
        "learning_objectives",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "id,"
                "lesson_id,"
                "objective_code,"
                "statement,"
                "cognitive_level,"
                "created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get(
    "/api/lessons/{lesson_id}/vocabulary"
)
async def get_lesson_vocabulary(
    lesson_id: int,
):
    return await supabase_request(
        "GET",
        "lesson_vocabulary",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "id,"
                "lesson_id,"
                "term,"
                "definition,"
                "pronunciation,"
                "example,"
                "created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get(
    "/api/lessons/{lesson_id}/concepts"
)
async def get_lesson_concepts(
    lesson_id: int,
):
    links = await supabase_request(
        "GET",
        "lesson_concepts",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "concept_id,"
                "is_primary"
            ),
            "order": "is_primary.desc",
        },
    )

    result = []

    for link in links:
        concepts = await supabase_request(
            "GET",
            "concepts",
            params={
                "id": (
                    f"eq.{link['concept_id']}"
                ),
                "select": (
                    "id,"
                    "subject_id,"
                    "name,"
                    "description,"
                    "created_at"
                ),
                "limit": "1",
            },
        )

        if concepts:
            concept = concepts[0]
            concept["is_primary"] = (
                link.get("is_primary", False)
            )
            result.append(concept)

    return result


@app.get(
    "/api/lessons/{lesson_id}/sources"
)
async def get_lesson_sources(
    lesson_id: int,
):
    links = await supabase_request(
        "GET",
        "lesson_source_refs",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "source_id,"
                "locator,"
                "notes,"
                "created_at"
            ),
        },
    )

    result = []

    for link in links:
        sources = await supabase_request(
            "GET",
            "curriculum_sources",
            params={
                "id": (
                    f"eq.{link['source_id']}"
                ),
                "select": (
                    "id,"
                    "name,"
                    "source_type,"
                    "publisher,"
                    "source_url,"
                    "edition,"
                    "academic_year,"
                    "language,"
                    "rights_notes,"
                    "metadata,"
                    "created_at"
                ),
                "limit": "1",
            },
        )

        if sources:
            source = sources[0]
            source["locator"] = (
                link.get("locator")
            )
            source["notes"] = (
                link.get("notes")
            )
            result.append(source)

    return result


# ==================================================================
# Questions
# ==================================================================

@app.get(
    "/api/lessons/{lesson_id}/questions"
)
async def get_lesson_questions(
    lesson_id: int,
):
    links = await supabase_request(
        "GET",
        "question_lessons",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "question_id,"
                "relevance"
            ),
            "order": "relevance.desc",
        },
    )

    result = []

    for link in links:
        question_id = link["question_id"]

        questions = await supabase_request(
            "GET",
            "published_questions_public",
            params={
                "id": f"eq.{question_id}",
                "select": (
                    "id,"
                    "question_type,"
                    "difficulty,"
                    "prompt,"
                    "explanation,"
                    "metadata,"
                    "source,"
                    "status,"
                    "created_at,"
                    "updated_at"
                ),
                "limit": "1",
            },
        )

        if not questions:
            continue

        options = await supabase_request(
            "GET",
            "question_options_public",
            params={
                "question_id": (
                    f"eq.{question_id}"
                ),
                "select": (
                    "id,"
                    "question_id,"
                    "option_key,"
                    "option_text,"
                    "sort_order,"
                    "metadata"
                ),
                "order": "sort_order.asc",
            },
        )

        question = questions[0]

        question["relevance"] = (
            link.get("relevance")
        )

        question["options"] = options

        result.append(question)

    return result


@app.get(
    "/api/questions/{question_id}"
)
async def get_question(
    question_id: str,
):
    questions = await supabase_request(
        "GET",
        "published_questions_public",
        params={
            "id": f"eq.{question_id}",
            "select": (
                "id,"
                "question_type,"
                "difficulty,"
                "prompt,"
                "explanation,"
                "metadata,"
                "source,"
                "status,"
                "created_at,"
                "updated_at"
            ),
            "limit": "1",
        },
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Question not found.",
        )

    options = await supabase_request(
        "GET",
        "question_options_public",
        params={
            "question_id": (
                f"eq.{question_id}"
            ),
            "select": (
                "id,"
                "question_id,"
                "option_key,"
                "option_text,"
                "sort_order,"
                "metadata"
            ),
            "order": "sort_order.asc",
        },
    )

    questions[0]["options"] = options

    return questions[0]


# ==================================================================
# Student
# ==================================================================

async def verify_student_access(
    student_profile_id: str,
    authorization: str | None,
):
    auth, user = await require_user(
        authorization
    )

    if user.get("id") != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return auth, user


@app.get(
    "/api/students/{student_profile_id}"
)
async def get_student(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    rows = await supabase_request(
        "GET",
        "student_profiles",
        params={
            "profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": (
                "profile_id,"
                "grade_id,"
                "display_name,"
                "date_of_birth,"
                "avatar_url,"
                "xp,"
                "level,"
                "is_active,"
                "created_at,"
                "updated_at"
            ),
            "limit": "1",
        },
        authorization=auth,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return rows[0]


@app.get(
    "/api/students/{student_profile_id}/dashboard"
)
async def get_student_dashboard(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    summary = await supabase_request(
        "GET",
        "student_dashboard_summary",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    streak = await supabase_request(
        "GET",
        "student_streaks",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    recommendations = await supabase_request(
        "GET",
        "learning_recommendations",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "is_dismissed": "eq.false",
            "select": "*",
            "order": "priority.desc",
        },
        authorization=auth,
    )

    return {
        "summary": (
            summary[0]
            if summary
            else None
        ),
        "streak": (
            streak[0]
            if streak
            else None
        ),
        "recommendations": recommendations,
    }


@app.get(
    "/api/students/{student_profile_id}/progress"
)
async def get_student_progress(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    return await supabase_request(
        "GET",
        "lesson_progress",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "order": "updated_at.desc",
        },
        authorization=auth,
    )


@app.get(
    "/api/students/{student_profile_id}/progress/{lesson_id}"
)
async def get_lesson_progress(
    student_profile_id: str,
    lesson_id: int,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    rows = await supabase_request(
        "GET",
        "lesson_progress",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "lesson_id": f"eq.{lesson_id}",
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    return rows[0] if rows else None


@app.post(
    "/api/students/{student_profile_id}/progress/{lesson_id}"
)
async def update_lesson_progress(
    student_profile_id: str,
    lesson_id: int,
    data: ProgressUpdate,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    existing = await supabase_request(
        "GET",
        "lesson_progress",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "lesson_id": f"eq.{lesson_id}",
            "select": "id",
            "limit": "1",
        },
        authorization=auth,
    )

    payload = {
        "student_profile_id": (
            student_profile_id
        ),
        "lesson_id": lesson_id,
        "status": data.status,
        "completion_percent": (
            data.completion_percent
        ),
        "time_spent_seconds": (
            data.time_spent_seconds
        ),
        "last_accessed_at": now_iso(),
        "updated_at": now_iso(),
    }

    if (
        data.status == "completed"
        or data.completion_percent >= 100
    ):
        payload["status"] = "completed"
        payload["completion_percent"] = 100

        if not existing:
            payload["first_started_at"] = (
                now_iso()
            )

        payload["completed_at"] = now_iso()

    if existing:
        rows = await supabase_request(
            "PATCH",
            "lesson_progress",
            params={
                "id": (
                    f"eq.{existing[0]['id']}"
                ),
            },
            payload=payload,
            authorization=auth,
        )
    else:
        payload["first_started_at"] = (
            now_iso()
        )

        rows = await supabase_request(
            "POST",
            "lesson_progress",
            payload=payload,
            authorization=auth,
        )

    return rows[0] if rows else payload


@app.get(
    "/api/students/{student_profile_id}/analytics"
)
async def get_student_analytics(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    metrics = await supabase_request(
        "GET",
        "student_subject_metrics",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "order": "subject_id.asc",
        },
        authorization=auth,
    )

    mastery = await supabase_request(
        "GET",
        "concept_mastery",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "order": "concept_id.asc",
        },
        authorization=auth,
    )

    recommendations = await supabase_request(
        "GET",
        "learning_recommendations",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "is_dismissed": "eq.false",
            "select": "*",
            "order": "priority.desc",
        },
        authorization=auth,
    )

    return {
        "subject_metrics": metrics,
        "concept_mastery": mastery,
        "recommendations": recommendations,
    }


# ==================================================================
# Learning Events
# ==================================================================

@app.post(
    "/api/students/{student_profile_id}/events"
)
async def create_learning_event(
    student_profile_id: str,
    data: LearningEventCreate,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    rows = await supabase_request(
        "POST",
        "learning_events",
        payload={
            "student_profile_id": (
                student_profile_id
            ),
            "event_type": data.event_type,
            "lesson_id": data.lesson_id,
            "concept_id": data.concept_id,
            "metadata": data.metadata,
            "occurred_at": now_iso(),
        },
        authorization=auth,
    )

    return rows[0] if rows else {}


# ==================================================================
# XP / Gamification
# ==================================================================

@app.get(
    "/api/students/{student_profile_id}/streak"
)
async def get_student_streak(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    rows = await supabase_request(
        "GET",
        "student_streaks",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    return rows[0] if rows else None


@app.get(
    "/api/students/{student_profile_id}/xp"
)
async def get_student_xp(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    profile = await supabase_request(
        "GET",
        "student_profiles",
        params={
            "profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": (
                "profile_id,"
                "xp,"
                "level"
            ),
            "limit": "1",
        },
        authorization=auth,
    )

    transactions = await supabase_request(
        "GET",
        "xp_transactions",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "order": "created_at.desc",
        },
        authorization=auth,
    )

    return {
        "profile": (
            profile[0]
            if profile
            else None
        ),
        "transactions": transactions,
    }


@app.get(
    "/api/students/{student_profile_id}/achievements"
)
async def get_student_achievements(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    earned = await supabase_request(
        "GET",
        "student_achievements",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "order": "earned_at.desc",
        },
        authorization=auth,
    )

    achievements = []

    for item in earned:
        achievement_id = item.get(
            "achievement_id"
        )

        rows = await supabase_request(
            "GET",
            "achievements",
            params={
                "id": (
                    f"eq.{achievement_id}"
                ),
                "is_active": "eq.true",
                "select": (
                    "id,"
                    "code,"
                    "name,"
                    "description,"
                    "icon_url,"
                    "xp_reward,"
                    "criteria"
                ),
                "limit": "1",
            },
            authorization=auth,
        )

        if rows:
            achievement = rows[0]
            achievement["earned_at"] = (
                item.get("earned_at")
            )
            achievement["metadata"] = (
                item.get("metadata")
            )
            achievements.append(achievement)

    return achievements


# ==================================================================
# Games
# ==================================================================

@app.get("/api/games")
async def get_games(
    lesson_id: int | None = Query(
        default=None
    ),
):
    params = {
        "select": (
            "id,"
            "lesson_id,"
            "game_type,"
            "title,"
            "game_data,"
            "created_at"
        ),
        "order": "id.asc",
    }

    if lesson_id is not None:
        params["lesson_id"] = (
            f"eq.{lesson_id}"
        )

    return await supabase_request(
        "GET",
        "games",
        params=params,
    )


@app.get("/api/lessons/{lesson_id}/games")
async def get_lesson_games(
    lesson_id: int,
):
    return await supabase_request(
        "GET",
        "games",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "id,"
                "lesson_id,"
                "game_type,"
                "title,"
                "game_data,"
                "created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get("/api/game-templates")
async def get_game_templates():
    return await supabase_request(
        "GET",
        "game_templates",
        params={
            "is_active": "eq.true",
            "select": (
                "id,"
                "code,"
                "name,"
                "description,"
                "game_type,"
                "supported_question_types,"
                "configuration,"
                "frontend_url,"
                "thumbnail_url,"
                "is_active,"
                "created_at"
            ),
            "order": "name.asc",
        },
    )


@app.get("/api/game-definitions")
async def get_game_definitions(
    lesson_id: int | None = Query(
        default=None
    ),
    unit_id: int | None = Query(
        default=None
    ),
    subject_id: int | None = Query(
        default=None
    ),
    course_id: str | None = Query(
        default=None
    ),
):
    params = {
        "is_active": "eq.true",
        "select": (
            "id,"
            "template_id,"
            "scope_type,"
            "lesson_id,"
            "unit_id,"
            "subject_id,"
            "course_id,"
            "challenge_id,"
            "title,"
            "settings,"
            "is_active,"
            "created_at"
        ),
        "order": "created_at.desc",
    }

    if lesson_id is not None:
        params["lesson_id"] = (
            f"eq.{lesson_id}"
        )

    if unit_id is not None:
        params["unit_id"] = (
            f"eq.{unit_id}"
        )

    if subject_id is not None:
        params["subject_id"] = (
            f"eq.{subject_id}"
        )

    if course_id is not None:
        params["course_id"] = (
            f"eq.{course_id}"
        )

    return await supabase_request(
        "GET",
        "game_definitions",
        params=params,
    )


@app.get(
    "/api/game-definitions/{game_definition_id}"
)
async def get_game_definition(
    game_definition_id: str,
):
    rows = await supabase_request(
        "GET",
        "game_definitions",
        params={
            "id": (
                f"eq.{game_definition_id}"
            ),
            "is_active": "eq.true",
            "select": "*",
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Game definition not found.",
        )

    definition = rows[0]

    questions = await supabase_request(
        "GET",
        "game_definition_questions",
        params={
            "game_definition_id": (
                f"eq.{game_definition_id}"
            ),
            "select": (
                "game_definition_id,"
                "question_id,"
                "sort_order,"
                "points"
            ),
            "order": "sort_order.asc",
        },
    )

    definition["questions"] = questions

    return definition


@app.post(
    "/api/students/{student_profile_id}/game-sessions"
)
async def create_game_session(
    student_profile_id: str,
    data: GameSessionCreate,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    definition = await supabase_request(
        "GET",
        "game_definitions",
        params={
            "id": (
                f"eq.{data.game_definition_id}"
            ),
            "is_active": "eq.true",
            "select": "id",
            "limit": "1",
        },
        authorization=auth,
    )

    if not definition:
        raise HTTPException(
            status_code=404,
            detail="Game definition not found.",
        )

    session_rows = await supabase_request(
        "POST",
        "game_sessions",
        payload={
            "student_profile_id": (
                student_profile_id
            ),
            "game_definition_id": (
                data.game_definition_id
            ),
            "started_at": now_iso(),
            "status": "started",
            "score": 0,
            "max_score": 0,
            "xp_earned": 0,
            "metadata": {},
        },
        authorization=auth,
    )

    if not session_rows:
        return {}

    session = session_rows[0]

    questions = await supabase_request(
        "GET",
        "game_definition_questions",
        params={
            "game_definition_id": (
                data.game_definition_id
            ),
            "select": (
                "question_id,"
                "sort_order,"
                "points"
            ),
            "order": "sort_order.asc",
        },
        authorization=auth,
    )

    for question in questions:
        await supabase_request(
            "POST",
            "game_session_questions",
            payload={
                "session_id": session["id"],
                "question_id": (
                    question["question_id"]
                ),
                "sequence_no": (
                    question["sort_order"]
                ),
                "points_possible": (
                    question["points"]
                ),
            },
            authorization=auth,
        )

    return session


@app.patch(
    "/api/students/{student_profile_id}/game-sessions/{session_id}"
)
async def update_game_session(
    student_profile_id: str,
    session_id: str,
    data: GameSessionUpdate,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    rows = await supabase_request(
        "GET",
        "game_sessions",
        params={
            "id": f"eq.{session_id}",
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "id",
            "limit": "1",
        },
        authorization=auth,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Game session not found.",
        )

    payload = {
        "status": data.status,
        "score": data.score,
        "max_score": data.max_score,
        "accuracy": data.accuracy,
        "xp_earned": data.xp_earned,
        "metadata": data.metadata,
    }

    if data.status in {
        "completed",
        "finished",
    }:
        payload["completed_at"] = now_iso()

    updated = await supabase_request(
        "PATCH",
        "game_sessions",
        params={
            "id": f"eq.{session_id}",
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
        },
        payload=payload,
        authorization=auth,
    )

    return updated[0] if updated else payload


@app.post(
    "/api/students/{student_profile_id}/question-attempts"
)
async def create_question_attempt(
    student_profile_id: str,
    data: QuestionAttemptCreate,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    session_questions = await supabase_request(
        "GET",
        "game_session_questions",
        params={
            "id": (
                f"eq.{data.session_question_id}"
            ),
            "select": (
                "id,"
                "session_id,"
                "points_possible"
            ),
            "limit": "1",
        },
        authorization=auth,
    )

    if not session_questions:
        raise HTTPException(
            status_code=404,
            detail="Session question not found.",
        )

    session_question = (
        session_questions[0]
    )

    sessions = await supabase_request(
        "GET",
        "game_sessions",
        params={
            "id": (
                f"eq.{session_question['session_id']}"
            ),
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "id",
            "limit": "1",
        },
        authorization=auth,
    )

    if not sessions:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    rows = await supabase_request(
        "POST",
        "question_attempts",
        payload={
            "session_question_id": (
                data.session_question_id
            ),
            "student_profile_id": (
                student_profile_id
            ),
            "answer": data.answer,
            "is_correct": data.is_correct,
            "points_awarded": (
                data.points_awarded
            ),
            "response_time_ms": (
                data.response_time_ms
            ),
            "answered_at": now_iso(),
            "feedback": data.feedback,
        },
        authorization=auth,
    )

    return rows[0] if rows else {}


# ==================================================================
# Challenges
# ==================================================================

@app.get("/api/challenges")
async def get_challenges(
    grade_id: int | None = Query(
        default=None
    ),
):
    params = {
        "select": (
            "id,"
            "title,"
            "description,"
            "grade_id,"
            "starts_at,"
            "ends_at,"
            "status,"
            "settings,"
            "created_at"
        ),
        "order": "starts_at.desc",
    }

    if grade_id is not None:
        params["grade_id"] = (
            f"eq.{grade_id}"
        )

    return await supabase_request(
        "GET",
        "challenges",
        params=params,
    )


@app.get(
    "/api/challenges/{challenge_id}"
)
async def get_challenge(
    challenge_id: str,
):
    rows = await supabase_request(
        "GET",
        "challenges",
        params={
            "id": f"eq.{challenge_id}",
            "select": "*",
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found.",
        )

    challenge = rows[0]

    questions = await supabase_request(
        "GET",
        "challenge_questions",
        params={
            "challenge_id": (
                f"eq.{challenge_id}"
            ),
            "select": (
                "challenge_id,"
                "question_id,"
                "sort_order,"
                "points"
            ),
            "order": "sort_order.asc",
        },
    )

    challenge["questions"] = questions

    return challenge


@app.post(
    "/api/students/{student_profile_id}/challenges/{challenge_id}/join"
)
async def join_challenge(
    student_profile_id: str,
    challenge_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    challenge = await supabase_request(
        "GET",
        "challenges",
        params={
            "id": f"eq.{challenge_id}",
            "select": (
                "id,"
                "starts_at,"
                "ends_at,"
                "status"
            ),
            "limit": "1",
        },
        authorization=auth,
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found.",
        )

    existing = await supabase_request(
        "GET",
        "challenge_participants",
        params={
            "challenge_id": (
                f"eq.{challenge_id}"
            ),
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    if existing:
        return existing[0]

    rows = await supabase_request(
        "POST",
        "challenge_participants",
        payload={
            "challenge_id": challenge_id,
            "student_profile_id": (
                student_profile_id
            ),
            "joined_at": now_iso(),
            "score": 0,
        },
        authorization=auth,
    )

    return rows[0] if rows else {}


# ==================================================================
# Parent
# ==================================================================

@app.post(
    "/api/parent/invitations"
)
async def create_parent_invitation(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, user = await require_user(
        authorization
    )

    created_by = user.get("id")

    student = await supabase_request(
        "GET",
        "student_profiles",
        params={
            "profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "profile_id",
            "limit": "1",
        },
        authorization=auth,
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    code = generate_invitation_code()

    rows = await supabase_request(
        "POST",
        "parent_invitations",
        payload={
            "student_profile_id": (
                student_profile_id
            ),
            "created_by": created_by,
            "code": code,
        },
        authorization=auth,
    )

    return rows[0] if rows else {}


@app.post(
    "/api/parent/invitations/{code}/claim"
)
async def claim_parent_invitation(
    code: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, user = await require_user(
        authorization
    )

    parent_profile_id = user.get("id")

    invitations = await supabase_request(
        "GET",
        "parent_invitations",
        params={
            "code": f"eq.{code}",
            "used_at": "is.null",
            "select": (
                "id,"
                "student_profile_id,"
                "expires_at"
            ),
            "limit": "1",
        },
        privileged=True,
    )

    if not invitations:
        raise HTTPException(
            status_code=404,
            detail=(
                "Invalid or already used "
                "invitation."
            ),
        )

    invitation = invitations[0]

    expires_at = invitation.get(
        "expires_at"
    )

    if expires_at:
        expires = datetime.fromisoformat(
            expires_at.replace(
                "Z",
                "+00:00",
            )
        )

        if expires <= datetime.now(
            timezone.utc
        ):
            raise HTTPException(
                status_code=410,
                detail="Invitation expired.",
            )

    existing = await supabase_request(
        "GET",
        "parent_students",
        params={
            "parent_profile_id": (
                f"eq.{parent_profile_id}"
            ),
            "student_profile_id": (
                f"eq.{invitation['student_profile_id']}"
            ),
            "select": (
                "parent_profile_id,"
                "student_profile_id"
            ),
            "limit": "1",
        },
        privileged=True,
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Relationship already exists.",
        )

    relationship = await supabase_request(
        "POST",
        "parent_students",
        payload={
            "parent_profile_id": (
                parent_profile_id
            ),
            "student_profile_id": (
                invitation["student_profile_id"]
            ),
            "relationship": "parent",
            "is_primary": False,
        },
        privileged=True,
    )

    updated = await supabase_request(
        "PATCH",
        "parent_invitations",
        params={
            "id": (
                f"eq.{invitation['id']}"
            ),
            "used_at": "is.null",
        },
        payload={
            "used_by": parent_profile_id,
            "used_at": now_iso(),
        },
        privileged=True,
    )

    if not updated:
        raise HTTPException(
            status_code=409,
            detail="Invitation was already claimed.",
        )

    return {
        "status": "success",
        "student_profile_id": (
            invitation["student_profile_id"]
        ),
        "relationship": relationship,
    }


@app.get(
    "/api/parents/{parent_profile_id}/students"
)
async def get_parent_students(
    parent_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, user = await require_user(
        authorization
    )

    if user.get("id") != parent_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return await supabase_request(
        "GET",
        "parent_dashboard_students",
        params={
            "parent_profile_id": (
                f"eq.{parent_profile_id}"
            ),
            "select": "*",
        },
        authorization=auth,
    )


@app.get(
    "/api/parents/{parent_profile_id}/students/{student_profile_id}"
)
async def get_parent_student(
    parent_profile_id: str,
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, user = await require_user(
        authorization
    )

    if user.get("id") != parent_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    relationship = await supabase_request(
        "GET",
        "parent_students",
        params={
            "parent_profile_id": (
                f"eq.{parent_profile_id}"
            ),
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": (
                "parent_profile_id,"
                "student_profile_id,"
                "relationship,"
                "is_primary,"
                "created_at"
            ),
            "limit": "1",
        },
        authorization=auth,
    )

    if not relationship:
        raise HTTPException(
            status_code=403,
            detail="Student is not linked to this parent.",
        )

    dashboard = await supabase_request(
        "GET",
        "parent_dashboard_students",
        params={
            "parent_profile_id": (
                f"eq.{parent_profile_id}"
            ),
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    return (
        dashboard[0]
        if dashboard
        else {
            "student_profile_id": (
                student_profile_id
            )
        }
    )


# ==================================================================
# Courses
# ==================================================================

@app.get("/api/courses")
async def get_courses():
    return await supabase_request(
        "GET",
        "courses",
        params={
            "select": (
                "id,"
                "title,"
                "subject_code,"
                "grade_level,"
                "term,"
                "description,"
                "icon,"
                "is_experimental,"
                "created_at"
            ),
            "order": "title.asc",
        },
    )


@app.get("/api/courses/{course_id}")
async def get_course(
    course_id: str,
):
    rows = await supabase_request(
        "GET",
        "courses",
        params={
            "id": f"eq.{course_id}",
            "select": "*",
            "limit": "1",
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    course = rows[0]

    modules = await supabase_request(
        "GET",
        "course_modules",
        params={
            "course_id": f"eq.{course_id}",
            "select": (
                "id,"
                "course_id,"
                "title,"
                "description,"
                "sort_order,"
                "created_at"
            ),
            "order": "sort_order.asc",
        },
    )

    for module in modules:
        lessons = await supabase_request(
            "GET",
            "course_lessons",
            params={
                "module_id": (
                    f"eq.{module['id']}"
                ),
                "select": (
                    "id,"
                    "module_id,"
                    "title,"
                    "description,"
                    "content,"
                    "sort_order,"
                    "created_at"
                ),
                "order": "sort_order.asc",
            },
        )

        module["lessons"] = lessons

    course["modules"] = modules

    return course


@app.get(
    "/api/courses/{course_id}/modules"
)
async def get_course_modules(
    course_id: str,
):
    return await supabase_request(
        "GET",
        "course_modules",
        params={
            "course_id": f"eq.{course_id}",
            "select": "*",
            "order": "sort_order.asc",
        },
    )


@app.get(
    "/api/course-modules/{module_id}/lessons"
)
async def get_course_module_lessons(
    module_id: str,
):
    return await supabase_request(
        "GET",
        "course_lessons",
        params={
            "module_id": f"eq.{module_id}",
            "select": "*",
            "order": "sort_order.asc",
        },
    )


@app.get(
    "/api/courses/{course_id}/enrollment"
)
async def get_course_enrollment(
    course_id: str,
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    rows = await supabase_request(
        "GET",
        "course_enrollments",
        params={
            "course_id": f"eq.{course_id}",
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    return rows[0] if rows else None


# ==================================================================
# Parent / student messaging
# ==================================================================

@app.get(
    "/api/conversations"
)
async def get_conversations(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    memberships = await supabase_request(
        "GET",
        "conversation_members",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": (
                "conversation_id,"
                "joined_at"
            ),
            "order": "joined_at.desc",
        },
        authorization=auth,
    )

    result = []

    for membership in memberships:
        conversations = await supabase_request(
            "GET",
            "conversations",
            params={
                "id": (
                    f"eq.{membership['conversation_id']}"
                ),
                "select": (
                    "id,"
                    "conversation_type,"
                    "title,"
                    "created_at"
                ),
                "limit": "1",
            },
            authorization=auth,
        )

        if conversations:
            result.append(
                conversations[0]
            )

    return result


@app.get(
    "/api/conversations/{conversation_id}/messages"
)
async def get_messages(
    conversation_id: str,
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    membership = await supabase_request(
        "GET",
        "conversation_members",
        params={
            "conversation_id": (
                f"eq.{conversation_id}"
            ),
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "conversation_id",
            "limit": "1",
        },
        authorization=auth,
    )

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return await supabase_request(
        "GET",
        "messages",
        params={
            "conversation_id": (
                f"eq.{conversation_id}"
            ),
            "select": (
                "id,"
                "conversation_id,"
                "sender_id,"
                "body,"
                "message_type,"
                "metadata,"
                "created_at"
            ),
            "order": "created_at.asc",
        },
        authorization=auth,
    )