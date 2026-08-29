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


# =====================================================================
# Environment
# =====================================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173",
)

if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL.")

if not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_KEY.")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_SERVICE_ROLE_KEY.")


SUPABASE_BASE_URL = SUPABASE_URL.rstrip("/")
SUPABASE_REST_URL = f"{SUPABASE_BASE_URL}/rest/v1"
SUPABASE_AUTH_URL = f"{SUPABASE_BASE_URL}/auth/v1"


# =====================================================================
# Application
# =====================================================================

app = FastAPI(
    title="The Tutor API",
    version="3.0.0",
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


# =====================================================================
# Helpers
# =====================================================================

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def require_bearer(
    authorization: str | None,
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization required.",
        )

    if not authorization.lower().startswith("bearer "):
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
) -> dict[str, Any]:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": authorization,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
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
) -> tuple[str, dict[str, Any]]:
    auth = require_bearer(authorization)
    user = await supabase_auth_user(auth)
    return auth, user


async def supabase_request(
    method: str,
    table: str,
    *,
    params: dict[str, Any] | None = None,
    payload: dict[str, Any] | list[dict[str, Any]] | None = None,
    authorization: str | None = None,
    privileged: bool = False,
) -> Any:
    if privileged:
        key = SUPABASE_SERVICE_ROLE_KEY
        bearer = f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    else:
        key = SUPABASE_KEY
        bearer = authorization or f"Bearer {SUPABASE_KEY}"

    headers = {
        "apikey": key,
        "Authorization": bearer,
        "Content-Type": "application/json",
    }

    if method.upper() in {"POST", "PATCH", "PUT", "DELETE"}:
        headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.request(
            method.upper(),
            f"{SUPABASE_REST_URL}/{table}",
            headers=headers,
            params=params,
            json=payload,
        )

    if response.status_code >= 400:
        try:
            error_data = response.json()
        except ValueError:
            error_data = response.text

        raise HTTPException(
            status_code=502,
            detail={
                "message": "Supabase request failed.",
                "status": response.status_code,
                "response": error_data,
            },
        )

    if not response.content:
        return []

    try:
        return response.json()
    except ValueError:
        return []


async def require_profile(
    authorization: str | None,
) -> tuple[str, dict[str, Any]]:
    auth, user = await require_user(authorization)

    rows = await supabase_request(
        "GET",
        "profiles",
        params={
            "id": f"eq.{user['id']}",
            "select": "id,name,role,grade_id,created_at",
            "limit": "1",
        },
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=403,
            detail="Profile not found.",
        )

    return auth, rows[0]


async def require_admin(
    authorization: str | None,
) -> tuple[str, dict[str, Any]]:
    auth, profile = await require_profile(authorization)

    role = profile.get("role")

    if role not in {"admin", "super_admin"}:
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )

    return auth, profile


async def verify_student_access(
    student_profile_id: str,
    authorization: str | None,
) -> tuple[str, dict[str, Any]]:
    auth, user = await require_user(authorization)

    if user.get("id") != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return auth, user


async def verify_parent_access(
    parent_profile_id: str,
    authorization: str | None,
) -> tuple[str, dict[str, Any]]:
    auth, user = await require_user(authorization)

    if user.get("id") != parent_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return auth, user


def generate_invitation_code() -> str:
    alphabet = string.ascii_uppercase + string.digits

    return "TUTOR-" + "".join(
        secrets.choice(alphabet)
        for _ in range(8)
    )


async def get_one(
    table: str,
    record_id: str | int,
    *,
    select: str = "*",
    authorization: str | None = None,
    privileged: bool = False,
    id_column: str = "id",
) -> dict[str, Any]:
    rows = await supabase_request(
        "GET",
        table,
        params={
            id_column: f"eq.{record_id}",
            "select": select,
            "limit": "1",
        },
        authorization=authorization,
        privileged=privileged,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"{table} record not found.",
        )

    return rows[0]


# =====================================================================
# Request models
# =====================================================================

class ProgressUpdate(BaseModel):
    status: str = "in_progress"
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


class GameSessionCreate(BaseModel):
    game_definition_id: str


class GameSessionUpdate(BaseModel):
    status: str
    score: int = Field(default=0, ge=0)
    max_score: int = Field(default=0, ge=0)
    accuracy: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    xp_earned: int = Field(default=0, ge=0)
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )

class QuestionAttemptCreate(BaseModel):
    session_question_id: str
    answer: Any
    response_time_ms: int | None = Field(
        default=None,
        ge=0,
    )

# =====================================================================
# Admin content models
# =====================================================================

class AdminLessonCreate(BaseModel):
    subject_id: int
    unit_id: int
    unit_number: int = Field(default=1, ge=1)
    lesson_number: int = Field(default=1, ge=1)
    title: str = Field(min_length=1)
    content_summary: str = ""
    video_url: str = ""
    infographic_url: str = ""
    game_url: str = ""


class AdminLessonUpdate(BaseModel):
    subject_id: int | None = None
    unit_id: int | None = None
    unit_number: int | None = Field(default=None, ge=1)
    lesson_number: int | None = Field(default=None, ge=1)
    title: str | None = Field(default=None, min_length=1)
    content_summary: str | None = None
    video_url: str | None = None
    infographic_url: str | None = None
    game_url: str | None = None


class AdminContentBlockCreate(BaseModel):
    lesson_id: int
    block_type: str
    content: dict[str, Any] = Field(
        default_factory=dict
    )
    asset_id: str | None = None
    sort_order: int = Field(default=0, ge=0)
    is_published: bool = False


class AdminContentBlockUpdate(BaseModel):
    block_type: str | None = None
    content: dict[str, Any] | None = None
    asset_id: str | None = None
    sort_order: int | None = Field(default=None, ge=0)
    is_published: bool | None = None


class AdminAssetCreate(BaseModel):
    lesson_id: int
    asset_type: str
    title: str | None = None
    url: str
    storage_path: str | None = None
    alt_text: str | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )
    sort_order: int = Field(default=0, ge=0)
    is_published: bool = False


class AdminAssetUpdate(BaseModel):
    asset_type: str | None = None
    title: str | None = None
    url: str | None = None
    storage_path: str | None = None
    alt_text: str | None = None
    metadata: dict[str, Any] | None = None
    sort_order: int | None = Field(default=None, ge=0)
    is_published: bool | None = None


class AdminObjectiveCreate(BaseModel):
    lesson_id: int
    objective_code: str | None = None
    statement: str = Field(min_length=1)
    cognitive_level: str | None = None


class AdminObjectiveUpdate(BaseModel):
    objective_code: str | None = None
    statement: str | None = Field(
        default=None,
        min_length=1,
    )
    cognitive_level: str | None = None


class AdminVocabularyCreate(BaseModel):
    lesson_id: int
    term: str = Field(min_length=1)
    definition: str | None = None
    pronunciation: str | None = None
    example: str | None = None


class AdminVocabularyUpdate(BaseModel):
    term: str | None = Field(
        default=None,
        min_length=1,
    )
    definition: str | None = None
    pronunciation: str | None = None
    example: str | None = None


class AdminConceptCreate(BaseModel):
    subject_id: int
    name: str = Field(min_length=1)
    description: str | None = None


class AdminConceptUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
    )
    description: str | None = None


class AdminSourceCreate(BaseModel):
    name: str = Field(min_length=1)
    source_type: str
    publisher: str | None = None
    source_url: str | None = None
    edition: str | None = None
    academic_year: str | None = None
    language: str = "ar"
    rights_notes: str | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


class AdminSourceUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
    )
    source_type: str | None = None
    publisher: str | None = None
    source_url: str | None = None
    edition: str | None = None
    academic_year: str | None = None
    language: str | None = None
    rights_notes: str | None = None
    metadata: dict[str, Any] | None = None


class AdminQuestionOption(BaseModel):
    option_key: str
    option_text: str
    is_correct: bool = False
    sort_order: int = Field(default=0, ge=0)
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


class AdminQuestionCreate(BaseModel):
    question_type: str
    difficulty: str = "medium"
    prompt: str = Field(min_length=1)
    explanation: str | None = None
    correct_answer: Any = Field(
        default_factory=dict
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )
    source: str = "manual"
    status: str = "draft"
    skill_type: str | None = None
    generation_source: str | None = None
    lesson_ids: list[int] = Field(
        default_factory=list
    )
    options: list[AdminQuestionOption] = Field(
        default_factory=list
    )


class AdminQuestionUpdate(BaseModel):
    question_type: str | None = None
    difficulty: str | None = None
    prompt: str | None = Field(
        default=None,
        min_length=1,
    )
    explanation: str | None = None
    correct_answer: Any | None = None
    metadata: dict[str, Any] | None = None
    source: str | None = None
    status: str | None = None
    skill_type: str | None = None
    generation_source: str | None = None
    lesson_ids: list[int] | None = None
    options: list[AdminQuestionOption] | None = None


# =====================================================================
# Health
# =====================================================================

@app.get("/")
async def root():
    return {
        "service": "The Tutor API",
        "status": "online",
        "version": "3.0.0",
    }


@app.get("/api/health")
async def health():
    return {
        "service": "The Tutor API",
        "status": "healthy",
        "version": "3.0.0",
    }


# =====================================================================
# Curriculum
# =====================================================================

@app.get("/api/grades")
async def get_grades():
    return await supabase_request(
        "GET",
        "grades",
        params={
            "select": "id,title,level_code,code,created_at",
            "order": "id.asc",
        },
    )


@app.get("/api/grades/{grade_id}")
async def get_grade(grade_id: int):
    return await get_one(
        "grades",
        grade_id,
        select="id,title,level_code,code,created_at",
    )


@app.get("/api/grades/{grade_id}/terms")
async def get_grade_terms(grade_id: int):
    return await supabase_request(
        "GET",
        "terms",
        params={
            "grade_id": f"eq.{grade_id}",
            "select": "id,grade_id,title,code,created_at",
            "order": "id.asc",
        },
    )


@app.get("/api/terms/{term_id}")
async def get_term(term_id: int):
    return await get_one(
        "terms",
        term_id,
        select="id,grade_id,title,code,created_at",
    )


@app.get("/api/terms/{term_id}/subjects")
async def get_term_subjects(term_id: int):
    return await supabase_request(
        "GET",
        "subjects",
        params={
            "term_id": f"eq.{term_id}",
            "select": (
                "id,term_id,title,code,"
                "icon_name,color_theme,created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get("/api/subjects/{subject_id}")
async def get_subject(subject_id: int):
    return await get_one(
        "subjects",
        subject_id,
        select=(
            "id,term_id,title,code,"
            "icon_name,color_theme,created_at"
        ),
    )


@app.get("/api/subjects/{subject_id}/units")
async def get_subject_units(subject_id: int):
    return await supabase_request(
        "GET",
        "units",
        params={
            "subject_id": f"eq.{subject_id}",
            "select": (
                "id,subject_id,unit_number,"
                "title,description,created_at"
            ),
            "order": "unit_number.asc",
        },
    )


@app.get("/api/units/{unit_id}")
async def get_unit(unit_id: int):
    return await get_one(
        "units",
        unit_id,
        select=(
            "id,subject_id,unit_number,"
            "title,description,created_at"
        ),
    )


@app.get("/api/units/{unit_id}/lessons")
async def get_unit_lessons(unit_id: int):
    return await supabase_request(
        "GET",
        "lessons",
        params={
            "unit_id": f"eq.{unit_id}",
            "select": (
                "id,subject_id,unit_id,unit_number,"
                "lesson_number,title,content_summary,"
                "video_url,infographic_url,game_url,created_at"
            ),
            "order": "lesson_number.asc",
        },
    )


# =====================================================================
# Lessons
# =====================================================================

LESSON_SELECT = (
    "id,subject_id,unit_id,unit_number,"
    "lesson_number,title,content_summary,"
    "video_url,infographic_url,game_url,created_at"
)


@app.get("/api/lessons/{lesson_id}")
async def get_lesson(lesson_id: int):
    return await get_one(
        "lessons",
        lesson_id,
        select=LESSON_SELECT,
    )


@app.get("/api/lessons/{lesson_id}/content")
async def get_lesson_content(lesson_id: int):
    return await supabase_request(
        "GET",
        "lesson_content_blocks",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "is_published": "eq.true",
            "select": (
                "id,lesson_id,block_type,content,"
                "asset_id,sort_order,is_published,created_at"
            ),
            "order": "sort_order.asc",
        },
    )


@app.get("/api/lessons/{lesson_id}/assets")
async def get_lesson_assets(lesson_id: int):
    return await supabase_request(
        "GET",
        "lesson_assets",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "is_published": "eq.true",
            "select": (
                "id,lesson_id,asset_type,title,url,"
                "storage_path,alt_text,metadata,sort_order,"
                "is_published,created_at"
            ),
            "order": "sort_order.asc",
        },
    )


@app.get("/api/lessons/{lesson_id}/objectives")
async def get_lesson_objectives(lesson_id: int):
    return await supabase_request(
        "GET",
        "learning_objectives",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "id,lesson_id,objective_code,"
                "statement,cognitive_level,created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get("/api/lessons/{lesson_id}/vocabulary")
async def get_lesson_vocabulary(lesson_id: int):
    return await supabase_request(
        "GET",
        "lesson_vocabulary",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "id,lesson_id,term,definition,"
                "pronunciation,example,created_at"
            ),
            "order": "id.asc",
        },
    )


@app.get("/api/lessons/{lesson_id}/concepts")
async def get_lesson_concepts(lesson_id: int):
    links = await supabase_request(
        "GET",
        "lesson_concepts",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": "concept_id,is_primary",
            "order": "is_primary.desc",
        },
    )

    result = []

    for link in links:
        rows = await supabase_request(
            "GET",
            "concepts",
            params={
                "id": f"eq.{link['concept_id']}",
                "select": (
                    "id,subject_id,name,"
                    "description,created_at"
                ),
                "limit": "1",
            },
        )

        if rows:
            item = rows[0]
            item["is_primary"] = link.get(
                "is_primary",
                False,
            )
            result.append(item)

    return result


@app.get("/api/lessons/{lesson_id}/sources")
async def get_lesson_sources(lesson_id: int):
    links = await supabase_request(
        "GET",
        "lesson_source_refs",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": (
                "source_id,locator,notes,created_at"
            ),
        },
    )

    result = []

    for link in links:
        rows = await supabase_request(
            "GET",
            "curriculum_sources",
            params={
                "id": f"eq.{link['source_id']}",
                "select": (
                    "id,name,source_type,publisher,"
                    "source_url,edition,academic_year,"
                    "language,rights_notes,metadata,created_at"
                ),
                "limit": "1",
            },
        )

        if rows:
            item = rows[0]
            item["locator"] = link.get("locator")
            item["notes"] = link.get("notes")
            result.append(item)

    return result


# =====================================================================
# Questions
# =====================================================================

async def load_public_question(
    question_id: str,
) -> dict[str, Any] | None:
    rows = await supabase_request(
        "GET",
        "published_questions_public",
        params={
            "id": f"eq.{question_id}",
            "select": (
                "id,question_type,difficulty,prompt,"
                "explanation,metadata,source,status,"
                "created_at,updated_at"
            ),
            "limit": "1",
        },
    )

    if not rows:
        return None

    options = await supabase_request(
        "GET",
        "question_options_public",
        params={
            "question_id": f"eq.{question_id}",
            "select": (
                "id,question_id,option_key,"
                "option_text,sort_order,metadata"
            ),
            "order": "sort_order.asc",
        },
    )

    question = rows[0]
    question["options"] = options

    return question


@app.get("/api/lessons/{lesson_id}/questions")
async def get_lesson_questions(lesson_id: int):
    links = await supabase_request(
        "GET",
        "question_lessons",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "select": "question_id,relevance",
            "order": "relevance.desc",
        },
    )

    result = []

    for link in links:
        question = await load_public_question(
            str(link["question_id"])
        )

        if question:
            question["relevance"] = link.get(
                "relevance"
            )
            result.append(question)

    return result


@app.get("/api/questions/{question_id}")
async def get_question(question_id: str):
    question = await load_public_question(question_id)

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found.",
        )

    return question


# =====================================================================
# Student
# =====================================================================

@app.get("/api/students/{student_profile_id}")
async def get_student(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    return await get_one(
        "student_profiles",
        student_profile_id,
        select=(
            "profile_id,grade_id,display_name,"
            "date_of_birth,avatar_url,xp,level,"
            "is_active,created_at,updated_at"
        ),
        authorization=auth,
        id_column="profile_id",
    )


@app.get("/api/students/{student_profile_id}/dashboard")
async def get_student_dashboard(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
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
        "summary": summary[0] if summary else None,
        "streak": streak[0] if streak else None,
        "recommendations": recommendations,
    }


@app.get("/api/students/{student_profile_id}/progress")
async def get_student_progress(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
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
    authorization: str | None = Header(default=None),
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
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    await get_one(
        "lessons",
        lesson_id,
        select="id",
        authorization=auth,
    )

    existing = await supabase_request(
        "GET",
        "lesson_progress",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "lesson_id": f"eq.{lesson_id}",
            "select": "id,first_started_at",
            "limit": "1",
        },
        authorization=auth,
    )

    timestamp = now_iso()

    payload = {
        "student_profile_id": student_profile_id,
        "lesson_id": lesson_id,
        "status": data.status,
        "completion_percent": data.completion_percent,
        "time_spent_seconds": data.time_spent_seconds,
        "last_accessed_at": timestamp,
        "updated_at": timestamp,
    }

    if (
        data.status == "completed"
        or data.completion_percent >= 100
    ):
        payload["status"] = "completed"
        payload["completion_percent"] = 100
        payload["completed_at"] = timestamp

    if existing:
        if not existing[0].get("first_started_at"):
            payload["first_started_at"] = timestamp

        rows = await supabase_request(
            "PATCH",
            "lesson_progress",
            params={
                "id": f"eq.{existing[0]['id']}"
            },
            payload=payload,
            authorization=auth,
        )
    else:
        payload["first_started_at"] = timestamp

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
    authorization: str | None = Header(default=None),
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


@app.post(
    "/api/students/{student_profile_id}/events"
)
async def create_learning_event(
    student_profile_id: str,
    data: LearningEventCreate,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    rows = await supabase_request(
        "POST",
        "learning_events",
        payload={
            "student_profile_id": student_profile_id,
            "event_type": data.event_type,
            "lesson_id": data.lesson_id,
            "concept_id": data.concept_id,
            "metadata": data.metadata,
            "occurred_at": now_iso(),
        },
        authorization=auth,
    )

    return rows[0] if rows else {}


@app.get(
    "/api/students/{student_profile_id}/streak"
)
async def get_student_streak(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
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
    authorization: str | None = Header(default=None),
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
            "select": "profile_id,xp,level",
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
        "profile": profile[0] if profile else None,
        "transactions": transactions,
    }


@app.get(
    "/api/students/{student_profile_id}/achievements"
)
async def get_student_achievements(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
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

    result = []

    for item in earned:
        achievement_id = item["achievement_id"]

        rows = await supabase_request(
            "GET",
            "achievements",
            params={
                "id": f"eq.{achievement_id}",
                "is_active": "eq.true",
                "select": (
                    "id,code,name,description,icon_url,"
                    "criteria,xp_reward,is_active,created_at"
                ),
                "limit": "1",
            },
            authorization=auth,
        )

        if rows:
            achievement = rows[0]
            achievement["earned_at"] = item.get(
                "earned_at"
            )
            achievement["metadata"] = item.get(
                "metadata"
            )
            result.append(achievement)

    return result


# =====================================================================
# Games
# ==================================================================


@app.get("/api/game-templates")
async def get_game_templates():
    return await supabase_request(
        "GET",
        "game_templates",
        params={
            "is_active": "eq.true",
            "select": (
                "id,code,name,description,game_type,"
                "supported_question_types,configuration,"
                "frontend_url,thumbnail_url,is_active,created_at"
            ),
            "order": "name.asc",
        },
    )


@app.get("/api/game-definitions")
async def get_game_definitions(
    lesson_id: int | None = Query(default=None),
    unit_id: int | None = Query(default=None),
    subject_id: int | None = Query(default=None),
    course_id: str | None = Query(default=None),
    challenge_id: str | None = Query(default=None),
):
    params = {
        "is_active": "eq.true",
        "select": (
            "id,template_id,scope_type,lesson_id,unit_id,"
            "subject_id,course_id,challenge_id,title,"
            "settings,is_active,created_at"
        ),
        "order": "created_at.desc",
    }

    filters = {
        "lesson_id": lesson_id,
        "unit_id": unit_id,
        "subject_id": subject_id,
        "course_id": course_id,
        "challenge_id": challenge_id,
    }

    for key, value in filters.items():
        if value is not None:
            params[key] = f"eq.{value}"

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
    definition = await get_one(
        "game_definitions",
        game_definition_id,
        select="*",
    )

    template = await supabase_request(
        "GET",
        "game_templates",
        params={
            "id": f"eq.{definition['template_id']}",
            "select": (
                "id,code,name,description,game_type,"
                "supported_question_types,configuration,"
                "frontend_url,thumbnail_url"
            ),
            "limit": "1",
        },
    )

    questions = await supabase_request(
        "GET",
        "game_definition_questions",
        params={
            "game_definition_id": (
                f"eq.{game_definition_id}"
            ),
            "select": (
                "game_definition_id,question_id,"
                "sort_order,points"
            ),
            "order": "sort_order.asc",
        },
    )

    definition["template"] = (
        template[0] if template else None
    )
    definition["questions"] = questions

    return definition


@app.post(
    "/api/students/{student_profile_id}/game-sessions"
)
async def create_game_session(
    student_profile_id: str,
    data: GameSessionCreate,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    definition = await supabase_request(
        "GET",
        "game_definitions",
        params={
            "id": f"eq.{data.game_definition_id}",
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

    try:
        result = await supabase_request(
            "POST",
            "rpc/start_game",
            payload={
                "p_student_profile_id": student_profile_id,
                "p_game_definition_id": data.game_definition_id,
                "p_question_count": 10,
            },
            privileged=True,
        )
    except HTTPException as exc:
        detail = exc.detail

        if isinstance(detail, dict):
            response_data = detail.get("response")

            if isinstance(response_data, dict):
                message = str(
                    response_data.get("message", "")
                )

                if "no_eligible_questions" in message:
                    raise HTTPException(
                        status_code=409,
                        detail=(
                            "لا توجد أسئلة مؤهلة من الدروس "
                            "المكتملة لهذا الطالب."
                        ),
                    )

        raise

    if isinstance(result, str):
        session_id = result
    elif (
        isinstance(result, list)
        and result
        and isinstance(result[0], str)
    ):
        session_id = result[0]
    else:
        raise HTTPException(
            status_code=502,
            detail="Could not create game session.",
        )

    session = await get_one(
        "game_sessions",
        session_id,
        select="*",
        privileged=True,
    )

    if session["student_profile_id"] != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return session


@app.get(
    "/api/students/{student_profile_id}/game-sessions"
)
async def get_student_game_sessions(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    return await supabase_request(
        "GET",
        "game_sessions",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
            "order": "started_at.desc",
        },
        authorization=auth,
    )


@app.get(
    "/api/students/{student_profile_id}/game-sessions/{session_id}"
)
async def get_game_session(
    student_profile_id: str,
    session_id: str,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    session = await get_one(
        "game_sessions",
        session_id,
        select="*",
        authorization=auth,
    )

    if session["student_profile_id"] != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    session["questions"] = await supabase_request(
        "GET",
        "game_session_questions",
        params={
            "session_id": f"eq.{session_id}",
            "select": (
                "id,session_id,question_id,"
                "sequence_no,points_possible"
            ),
            "order": "sequence_no.asc",
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
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    existing = await supabase_request(
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

    if not existing:
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

    if data.status == "completed":
        payload["completed_at"] = now_iso()

    rows = await supabase_request(
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

    return rows[0] if rows else payload

@app.post(
    "/api/students/{student_profile_id}/question-attempts"
)
async def create_question_attempt(
    student_profile_id: str,
    data: QuestionAttemptCreate,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    session_questions = await supabase_request(
        "GET",
        "game_session_questions",
        params={
            "id": f"eq.{data.session_question_id}",
            "select": (
                "id,session_id,question_id,"
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

    session_question = session_questions[0]

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

    try:
        result = await supabase_request(
            "POST",
            "rpc/submit_game_answer",
            payload={
                "p_student_profile_id": student_profile_id,
                "p_session_id": session_question[
                    "session_id"
                ],
                "p_session_question_id": (
                    data.session_question_id
                ),
                "p_answer": data.answer,
                "p_response_time_ms": (
                    data.response_time_ms
                ),
            },
            privileged=True,
        )
    except HTTPException as exc:
        detail = exc.detail

        if isinstance(detail, dict):
            response_data = detail.get("response")

            if isinstance(response_data, dict):
                message = str(
                    response_data.get("message", "")
                )

                if "already_answered" in message:
                    raise HTTPException(
                        status_code=409,
                        detail="السؤال تمت الإجابة عليه بالفعل.",
                    )

                if "invalid_game_session" in message:
                    raise HTTPException(
                        status_code=409,
                        detail="جلسة اللعبة غير صالحة.",
                    )

                if "invalid_game_question" in message:
                    raise HTTPException(
                        status_code=404,
                        detail="سؤال اللعبة غير صالح.",
                    )

        raise

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=502,
            detail="Could not submit game answer.",
        )

    return {
        "id": result["attempt_id"],
        "session_question_id": (
            data.session_question_id
        ),
        "student_profile_id": student_profile_id,
        "answer": data.answer,
        "is_correct": result["is_correct"],
        "points_awarded": result["points_awarded"],
        "response_time_ms": data.response_time_ms,
        "answered_at": now_iso(),
        "feedback": {
            "explanation": result.get(
                "explanation"
            ),
            "correct_answer": result.get(
                "correct_answer"
            ),
            "source_lesson_id": result.get(
                "source_lesson_id"
            ),
            "source_lesson_title": result.get(
                "source_lesson_title"
            ),
        },
    }


# =====================================================================
# Challenges
# =====================================================================

@app.get("/api/challenges")
async def get_challenges(
    grade_id: int | None = Query(default=None),
):
    params = {
        "select": (
            "id,title,description,grade_id,starts_at,"
            "ends_at,status,settings,created_at"
        ),
        "order": "starts_at.desc",
    }

    if grade_id is not None:
        params["grade_id"] = f"eq.{grade_id}"

    return await supabase_request(
        "GET",
        "challenges",
        params=params,
    )


@app.get("/api/challenges/{challenge_id}")
async def get_challenge(
    challenge_id: str,
):
    challenge = await get_one(
        "challenges",
        challenge_id,
        select="*",
    )

    challenge["questions"] = await supabase_request(
        "GET",
        "challenge_questions",
        params={
            "challenge_id": f"eq.{challenge_id}",
            "select": (
                "challenge_id,question_id,"
                "sort_order,points"
            ),
            "order": "sort_order.asc",
        },
    )

    return challenge


@app.post(
    "/api/students/{student_profile_id}/challenges/{challenge_id}/join"
)
async def join_challenge(
    student_profile_id: str,
    challenge_id: str,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    challenge = await get_one(
        "challenges",
        challenge_id,
        select="id,starts_at,ends_at,status",
        authorization=auth,
    )

    existing = await supabase_request(
        "GET",
        "challenge_participants",
        params={
            "challenge_id": f"eq.{challenge_id}",
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
            "student_profile_id": student_profile_id,
            "joined_at": now_iso(),
            "score": 0,
        },
        authorization=auth,
    )

    return rows[0] if rows else {}


# =====================================================================
# Parent
# =====================================================================

@app.post("/api/parent/invitations")
async def create_parent_invitation(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_student_access(
        student_profile_id,
        authorization,
    )

    await get_one(
        "student_profiles",
        student_profile_id,
        select="profile_id",
        authorization=auth,
        id_column="profile_id",
    )

    code = generate_invitation_code()

    rows = await supabase_request(
        "POST",
        "parent_invitations",
        payload={
            "student_profile_id": student_profile_id,
            "created_by": student_profile_id,
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
    authorization: str | None = Header(default=None),
):
    _, user = await require_user(authorization)
    parent_profile_id = user["id"]

    invitations = await supabase_request(
        "GET",
        "parent_invitations",
        params={
            "code": f"eq.{code}",
            "used_at": "is.null",
            "select": (
                "id,student_profile_id,code,created_by,"
                "expires_at,used_at,used_by,created_at"
            ),
            "limit": "1",
        },
        privileged=True,
    )

    if not invitations:
        raise HTTPException(
            status_code=404,
            detail="Invalid or already used invitation.",
        )

    invitation = invitations[0]
    expires_at = invitation.get("expires_at")

    if expires_at:
        expires = datetime.fromisoformat(
            expires_at.replace("Z", "+00:00")
        )

        if expires <= datetime.now(timezone.utc):
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
            "select": "*",
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
            "parent_profile_id": parent_profile_id,
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
            "id": f"eq.{invitation['id']}",
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
        "student_profile_id": invitation["student_profile_id"],
        "relationship": (
            relationship[0]
            if relationship
            else None
        ),
    }


@app.get(
    "/api/parents/{parent_profile_id}/students"
)
async def get_parent_students(
    parent_profile_id: str,
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_parent_access(
        parent_profile_id,
        authorization,
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
    authorization: str | None = Header(default=None),
):
    auth, _ = await verify_parent_access(
        parent_profile_id,
        authorization,
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
            "select": "*",
            "limit": "1",
        },
        authorization=auth,
    )

    if not relationship:
        raise HTTPException(
            status_code=403,
            detail="Student is not linked to this parent.",
        )

    rows = await supabase_request(
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

    return rows[0] if rows else relationship[0]


# =====================================================================
# Courses
# =====================================================================

@app.get("/api/courses")
async def get_courses():
    return await supabase_request(
        "GET",
        "courses",
        params={
            "select": (
                "id,title,subject_code,grade_level,"
                "term,description,icon,is_experimental,created_at"
            ),
            "order": "title.asc",
        },
    )


@app.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    course = await get_one(
        "courses",
        course_id,
        select=(
            "id,title,subject_code,grade_level,"
            "term,description,icon,is_experimental,created_at"
        ),
    )

    modules = await supabase_request(
        "GET",
        "course_modules",
        params={
            "course_id": f"eq.{course_id}",
            "select": (
                "id,course_id,title,description,"
                "sort_order,created_at"
            ),
            "order": "sort_order.asc",
        },
    )

    for module in modules:
        module["lessons"] = await supabase_request(
            "GET",
            "course_lessons",
            params={
                "module_id": f"eq.{module['id']}",
                "select": (
                    "id,module_id,title,description,"
                    "content,sort_order,created_at"
                ),
                "order": "sort_order.asc",
            },
        )

    course["modules"] = modules

    return course


@app.get(
    "/api/courses/{course_id}/modules"
)
async def get_course_modules(course_id: str):
    return await supabase_request(
        "GET",
        "course_modules",
        params={
            "course_id": f"eq.{course_id}",
            "select": (
                "id,course_id,title,description,"
                "sort_order,created_at"
            ),
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
            "select": (
                "id,module_id,title,description,"
                "content,sort_order,created_at"
            ),
            "order": "sort_order.asc",
        },
    )


@app.get(
    "/api/courses/{course_id}/enrollment"
)
async def get_course_enrollment(
    course_id: str,
    student_profile_id: str,
    authorization: str | None = Header(default=None),
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


# =====================================================================
# Messaging
# =====================================================================

@app.get("/api/conversations")
async def get_conversations(
    student_profile_id: str,
    authorization: str | None = Header(default=None),
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
            "select": "conversation_id,joined_at",
            "order": "joined_at.desc",
        },
        authorization=auth,
    )

    result = []

    for membership in memberships:
        rows = await supabase_request(
            "GET",
            "conversations",
            params={
                "id": (
                    f"eq.{membership['conversation_id']}"
                ),
                "select": (
                    "id,conversation_type,"
                    "title,created_at"
                ),
                "limit": "1",
            },
            authorization=auth,
        )

        if rows:
            item = rows[0]
            item["joined_at"] = membership.get(
                "joined_at"
            )
            result.append(item)

    return result


@app.get(
    "/api/conversations/{conversation_id}/messages"
)
async def get_messages(
    conversation_id: str,
    student_profile_id: str,
    authorization: str | None = Header(default=None),
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
                "id,conversation_id,sender_id,"
                "body,message_type,metadata,created_at"
            ),
            "order": "created_at.asc",
        },
        authorization=auth,
    )


# =====================================================================
# ADMIN — Content Management
# =====================================================================

@app.get("/api/admin/me")
async def admin_me(
    authorization: str | None = Header(default=None),
):
    _, profile = await require_admin(authorization)
    return profile



# ---------------------------------------------------------------------
# Admin dashboard
# ---------------------------------------------------------------------

ADMIN_DASHBOARD_TABLES = (
    "grades",
    "terms",
    "subjects",
    "units",
    "lessons",
    "lesson_content_blocks",
    "lesson_assets",
    "learning_objectives",
    "lesson_vocabulary",
    "concepts",
    "questions",
    "curriculum_sources",
    "game_templates",
    "game_definitions",
    "profiles",
    "student_profiles",
    "plans",
    "subscriptions",
)

ADMIN_DIAGNOSTIC_TABLES = (
    "profiles",
    "student_profiles",
    "grades",
    "terms",
    "subjects",
    "units",
    "lessons",
    "lesson_content_blocks",
    "lesson_assets",
    "learning_objectives",
    "lesson_vocabulary",
    "concepts",
    "questions",
    "question_options",
    "game_templates",
    "game_definitions",
    "game_definition_questions",
    "lesson_progress",
    "learning_events",
    "plans",
    "subscriptions",
)


async def admin_count_table(table: str) -> int:
    count_columns = {
        "student_profiles": "profile_id",
    }

    column = count_columns.get(table, "id")

    key = SUPABASE_SERVICE_ROLE_KEY

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Prefer": "count=exact",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{SUPABASE_REST_URL}/{table}",
            headers=headers,
            params={
                "select": column,
                "limit": "1",
            },
        )

    if response.status_code >= 400:
        try:
            error_data = response.json()
        except ValueError:
            error_data = response.text

        raise HTTPException(
            status_code=502,
            detail={
                "message": "Supabase count request failed.",
                "table": table,
                "status": response.status_code,
                "response": error_data,
            },
        )

    content_range = response.headers.get(
        "content-range",
        "",
    )

    if "/" in content_range:
        total = content_range.rsplit("/", 1)[1]

        if total != "*":
            try:
                return int(total)
            except ValueError:
                pass

    return len(
        response.json()
        if response.content
        else []
    )


@app.get("/api/admin/dashboard")
async def admin_dashboard(
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    counts: dict[str, int] = {}

    for table in ADMIN_DASHBOARD_TABLES:
        counts[table] = await admin_count_table(table)

    return {
        "content": {
            "grades": counts["grades"],
            "terms": counts["terms"],
            "subjects": counts["subjects"],
            "units": counts["units"],
            "lessons": counts["lessons"],
            "lesson_content_blocks": counts[
                "lesson_content_blocks"
            ],
            "lesson_assets": counts["lesson_assets"],
            "learning_objectives": counts[
                "learning_objectives"
            ],
            "lesson_vocabulary": counts[
                "lesson_vocabulary"
            ],
            "concepts": counts["concepts"],
            "questions": counts["questions"],
            "curriculum_sources": counts[
                "curriculum_sources"
            ],
            "game_templates": counts["game_templates"],
            "game_definitions": counts[
                "game_definitions"
            ],
        },
        "users": {
            "profiles": counts["profiles"],
            "students": counts["student_profiles"],
        },
        "subscriptions": {
            "plans": counts["plans"],
            "subscriptions": counts["subscriptions"],
        },
    }


@app.get("/api/admin/diagnostics")
async def admin_diagnostics(
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    started_at = datetime.now(timezone.utc)

    checks: list[dict[str, Any]] = []

    for table in ADMIN_DIAGNOSTIC_TABLES:
        check_started_at = datetime.now(timezone.utc)

        try:
            await admin_count_table(table)

            duration_ms = int(
                (
                    datetime.now(timezone.utc)
                    - check_started_at
                ).total_seconds()
                * 1000
            )

            checks.append(
                {
                    "name": table,
                    "status": "pass",
                    "duration_ms": duration_ms,
                }
            )

        except HTTPException as exc:
            duration_ms = int(
                (
                    datetime.now(timezone.utc)
                    - check_started_at
                ).total_seconds()
                * 1000
            )

            checks.append(
                {
                    "name": table,
                    "status": "fail",
                    "duration_ms": duration_ms,
                    "error": exc.detail,
                }
            )

        except Exception as exc:
            duration_ms = int(
                (
                    datetime.now(timezone.utc)
                    - check_started_at
                ).total_seconds()
                * 1000
            )

            checks.append(
                {
                    "name": table,
                    "status": "fail",
                    "duration_ms": duration_ms,
                    "error": str(exc),
                }
            )

    failed = [
        check
        for check in checks
        if check["status"] != "pass"
    ]

    total_duration_ms = int(
        (
            datetime.now(timezone.utc)
            - started_at
        ).total_seconds()
        * 1000
    )

    return {
        "status": "healthy" if not failed else "degraded",
        "checked_at": now_iso(),
        "duration_ms": total_duration_ms,
        "checks": checks,
        "summary": {
            "total": len(checks),
            "passed": len(checks) - len(failed),
            "failed": len(failed),
        },
    }
# ---------------------------------------------------------------------
# Admin lessons
# ---------------------------------------------------------------------

@app.post("/api/admin/lessons")
async def admin_create_lesson(
    data: AdminLessonCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    subject = await supabase_request(
        "GET",
        "subjects",
        params={
            "id": f"eq.{data.subject_id}",
            "select": "id",
            "limit": "1",
        },
        privileged=True,
    )

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found.",
        )

    unit = await supabase_request(
        "GET",
        "units",
        params={
            "id": f"eq.{data.unit_id}",
            "subject_id": f"eq.{data.subject_id}",
            "select": "id",
            "limit": "1",
        },
        privileged=True,
    )

    if not unit:
        raise HTTPException(
            status_code=404,
            detail="Unit does not belong to subject.",
        )

    rows = await supabase_request(
        "POST",
        "lessons",
        payload=data.model_dump(),
        privileged=True,
    )

    return rows[0] if rows else {}


@app.patch("/api/admin/lessons/{lesson_id}")
async def admin_update_lesson(
    lesson_id: int,
    data: AdminLessonUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump().items()
        if value is not None
    }

    if not payload:
        return await get_one(
            "lessons",
            lesson_id,
            select=LESSON_SELECT,
            privileged=True,
        )

    if "subject_id" in payload or "unit_id" in payload:
        current = await get_one(
            "lessons",
            lesson_id,
            select="id,subject_id,unit_id",
            privileged=True,
        )

        subject_id = payload.get(
            "subject_id",
            current["subject_id"],
        )

        unit_id = payload.get(
            "unit_id",
            current["unit_id"],
        )

        unit = await supabase_request(
            "GET",
            "units",
            params={
                "id": f"eq.{unit_id}",
                "subject_id": f"eq.{subject_id}",
                "select": "id",
                "limit": "1",
            },
            privileged=True,
        )

        if not unit:
            raise HTTPException(
                status_code=422,
                detail="Unit does not belong to subject.",
            )

    rows = await supabase_request(
        "PATCH",
        "lessons",
        params={"id": f"eq.{lesson_id}"},
        payload=payload,
        privileged=True,
    )

    return rows[0] if rows else {}


@app.delete("/api/admin/lessons/{lesson_id}")
async def admin_delete_lesson(
    lesson_id: int,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    dependencies = [
        "lesson_content_blocks",
        "lesson_assets",
        "learning_objectives",
        "lesson_vocabulary",
        "lesson_concepts",
        "lesson_source_refs",
        "question_lessons",
        "game_definitions",
        "lesson_progress",
        "learning_events",
        "content_versions",
        "content_generation_jobs",
    ]

    for table in dependencies:
        rows = await supabase_request(
            "GET",
            table,
            params={
                "lesson_id": f"eq.{lesson_id}",
                "select": "lesson_id",
                "limit": "1",
            },
            privileged=True,
        )

        if rows:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Lesson cannot be deleted because "
                    f"dependent records exist in {table}."
                ),
            )

    rows = await supabase_request(
        "DELETE",
        "lessons",
        params={"id": f"eq.{lesson_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "lesson_id": lesson_id,
    }


# ---------------------------------------------------------------------
# Admin lesson content blocks
# ---------------------------------------------------------------------

@app.post("/api/admin/content-blocks")
async def admin_create_content_block(
    data: AdminContentBlockCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    await get_one(
        "lessons",
        data.lesson_id,
        select="id",
        privileged=True,
    )

    rows = await supabase_request(
        "POST",
        "lesson_content_blocks",
        payload=data.model_dump(),
        privileged=True,
    )

    return rows[0] if rows else {}


@app.patch(
    "/api/admin/content-blocks/{block_id}"
)
async def admin_update_content_block(
    block_id: str,
    data: AdminContentBlockUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump().items()
        if value is not None
    }

    rows = await supabase_request(
        "PATCH",
        "lesson_content_blocks",
        params={"id": f"eq.{block_id}"},
        payload=payload,
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Content block not found.",
        )

    return rows[0]


@app.delete(
    "/api/admin/content-blocks/{block_id}"
)
async def admin_delete_content_block(
    block_id: str,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    rows = await supabase_request(
        "DELETE",
        "lesson_content_blocks",
        params={"id": f"eq.{block_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "id": block_id,
    }


# ---------------------------------------------------------------------
# Admin lesson assets
# ---------------------------------------------------------------------

@app.post("/api/admin/assets")
async def admin_create_asset(
    data: AdminAssetCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    await get_one(
        "lessons",
        data.lesson_id,
        select="id",
        privileged=True,
    )

    allowed_types = {
        "image",
        "infographic",
        "video",
        "audio",
        "document",
        "game",
        "external",
    }

    if data.asset_type not in allowed_types:
        raise HTTPException(
            status_code=422,
            detail="Invalid asset_type.",
        )

    rows = await supabase_request(
        "POST",
        "lesson_assets",
        payload=data.model_dump(),
        privileged=True,
    )

    return rows[0] if rows else {}


@app.patch("/api/admin/assets/{asset_id}")
async def admin_update_asset(
    asset_id: str,
    data: AdminAssetUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump().items()
        if value is not None
    }

    if (
        "asset_type" in payload
        and payload["asset_type"]
        not in {
            "image",
            "infographic",
            "video",
            "audio",
            "document",
            "game",
            "external",
        }
    ):
        raise HTTPException(
            status_code=422,
            detail="Invalid asset_type.",
        )

    rows = await supabase_request(
        "PATCH",
        "lesson_assets",
        params={"id": f"eq.{asset_id}"},
        payload=payload,
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    return rows[0]


@app.delete("/api/admin/assets/{asset_id}")
async def admin_delete_asset(
    asset_id: str,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    rows = await supabase_request(
        "DELETE",
        "lesson_assets",
        params={"id": f"eq.{asset_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "id": asset_id,
    }


# ---------------------------------------------------------------------
# Admin objectives
# ---------------------------------------------------------------------

@app.post("/api/admin/objectives")
async def admin_create_objective(
    data: AdminObjectiveCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    await get_one(
        "lessons",
        data.lesson_id,
        select="id",
        privileged=True,
    )

    rows = await supabase_request(
        "POST",
        "learning_objectives",
        payload=data.model_dump(),
        privileged=True,
    )

    return rows[0] if rows else {}


@app.patch(
    "/api/admin/objectives/{objective_id}"
)
async def admin_update_objective(
    objective_id: int,
    data: AdminObjectiveUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump().items()
        if value is not None
    }

    rows = await supabase_request(
        "PATCH",
        "learning_objectives",
        params={"id": f"eq.{objective_id}"},
        payload=payload,
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Objective not found.",
        )

    return rows[0]


@app.delete(
    "/api/admin/objectives/{objective_id}"
)
async def admin_delete_objective(
    objective_id: int,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    rows = await supabase_request(
        "DELETE",
        "learning_objectives",
        params={"id": f"eq.{objective_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "id": objective_id,
    }


# ---------------------------------------------------------------------
# Admin vocabulary
# ---------------------------------------------------------------------

@app.post("/api/admin/vocabulary")
async def admin_create_vocabulary(
    data: AdminVocabularyCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    await get_one(
        "lessons",
        data.lesson_id,
        select="id",
        privileged=True,
    )

    rows = await supabase_request(
        "POST",
        "lesson_vocabulary",
        payload=data.model_dump(),
        privileged=True,
    )

    return rows[0] if rows else {}


@app.patch(
    "/api/admin/vocabulary/{vocabulary_id}"
)
async def admin_update_vocabulary(
    vocabulary_id: int,
    data: AdminVocabularyUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump().items()
        if value is not None
    }

    rows = await supabase_request(
        "PATCH",
        "lesson_vocabulary",
        params={"id": f"eq.{vocabulary_id}"},
        payload=payload,
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Vocabulary item not found.",
        )

    return rows[0]


@app.delete(
    "/api/admin/vocabulary/{vocabulary_id}"
)
async def admin_delete_vocabulary(
    vocabulary_id: int,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    rows = await supabase_request(
        "DELETE",
        "lesson_vocabulary",
        params={"id": f"eq.{vocabulary_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "id": vocabulary_id,
    }


# ---------------------------------------------------------------------
# Admin concepts
# ---------------------------------------------------------------------

@app.post("/api/admin/concepts")
async def admin_create_concept(
    data: AdminConceptCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    await get_one(
        "subjects",
        data.subject_id,
        select="id",
        privileged=True,
    )

    rows = await supabase_request(
        "POST",
        "concepts",
        payload=data.model_dump(),
        privileged=True,
    )

    return rows[0] if rows else {}


@app.patch(
    "/api/admin/concepts/{concept_id}"
)
async def admin_update_concept(
    concept_id: int,
    data: AdminConceptUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump().items()
        if value is not None
    }

    rows = await supabase_request(
        "PATCH",
        "concepts",
        params={"id": f"eq.{concept_id}"},
        payload=payload,
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Concept not found.",
        )

    return rows[0]


@app.delete(
    "/api/admin/concepts/{concept_id}"
)
async def admin_delete_concept(
    concept_id: int,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    dependencies = [
        "lesson_concepts",
        "question_concepts",
        "concept_mastery",
        "learning_events",
        "learning_recommendations",
    ]

    for table in dependencies:
        rows = await supabase_request(
            "GET",
            table,
            params={
                "concept_id": f"eq.{concept_id}",
                "select": "concept_id",
                "limit": "1",
            },
            privileged=True,
        )

        if rows:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Concept is referenced by {table}."
                ),
            )

    rows = await supabase_request(
        "DELETE",
        "concepts",
        params={"id": f"eq.{concept_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "id": concept_id,
    }


# ---------------------------------------------------------------------
# Admin curriculum sources
# ---------------------------------------------------------------------

@app.post("/api/admin/sources")
async def admin_create_source(
    data: AdminSourceCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    allowed_types = {
        "official",
        "licensed",
        "teacher_created",
        "ai_generated",
        "other",
    }

    if data.source_type not in allowed_types:
        raise HTTPException(
            status_code=422,
            detail="Invalid source_type.",
        )

    rows = await supabase_request(
        "POST",
        "curriculum_sources",
        payload=data.model_dump(),
        privileged=True,
    )

    return rows[0] if rows else {}


@app.patch(
    "/api/admin/sources/{source_id}"
)
async def admin_update_source(
    source_id: str,
    data: AdminSourceUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump().items()
        if value is not None
    }

    if (
        "source_type" in payload
        and payload["source_type"]
        not in {
            "official",
            "licensed",
            "teacher_created",
            "ai_generated",
            "other",
        }
    ):
        raise HTTPException(
            status_code=422,
            detail="Invalid source_type.",
        )

    rows = await supabase_request(
        "PATCH",
        "curriculum_sources",
        params={"id": f"eq.{source_id}"},
        payload=payload,
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Source not found.",
        )

    return rows[0]


@app.delete(
    "/api/admin/sources/{source_id}"
)
async def admin_delete_source(
    source_id: str,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    rows = await supabase_request(
        "DELETE",
        "curriculum_sources",
        params={"id": f"eq.{source_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "id": source_id,
    }


# ---------------------------------------------------------------------
# Admin questions
# ---------------------------------------------------------------------

@app.post("/api/admin/questions")
async def admin_create_question(
    data: AdminQuestionCreate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    question_payload = {
        "question_type": data.question_type,
        "difficulty": data.difficulty,
        "prompt": data.prompt,
        "explanation": data.explanation,
        "correct_answer": data.correct_answer,
        "metadata": data.metadata,
        "source": data.source,
        "status": data.status,
        "skill_type": data.skill_type,
        "generation_source": data.generation_source,
    }

    rows = await supabase_request(
        "POST",
        "questions",
        payload=question_payload,
        privileged=True,
    )

    if not rows:
        raise HTTPException(
            status_code=502,
            detail="Question could not be created.",
        )

    question = rows[0]
    question_id = question["id"]

    for option in data.options:
        await supabase_request(
            "POST",
            "question_options",
            payload={
                "question_id": question_id,
                **option.model_dump(),
            },
            privileged=True,
        )

    for lesson_id in data.lesson_ids:
        await get_one(
            "lessons",
            lesson_id,
            select="id",
            privileged=True,
        )

        await supabase_request(
            "POST",
            "question_lessons",
            payload={
                "question_id": question_id,
                "lesson_id": lesson_id,
                "relevance": 1.0,
            },
            privileged=True,
        )

    return await admin_get_question_record(
        str(question_id)
    )


async def admin_get_question_record(
    question_id: str,
) -> dict[str, Any]:
    question = await get_one(
        "questions",
        question_id,
        select=(
            "id,question_type,difficulty,prompt,"
            "explanation,correct_answer,metadata,"
            "source,status,skill_type,generation_source,"
            "created_at,updated_at"
        ),
        privileged=True,
    )

    options = await supabase_request(
        "GET",
        "question_options",
        params={
            "question_id": f"eq.{question_id}",
            "select": (
                "id,question_id,option_key,option_text,"
                "is_correct,sort_order,metadata"
            ),
            "order": "sort_order.asc",
        },
        privileged=True,
    )

    lessons = await supabase_request(
        "GET",
        "question_lessons",
        params={
            "question_id": f"eq.{question_id}",
            "select": "question_id,lesson_id,relevance",
        },
        privileged=True,
    )

    question["options"] = options
    question["lessons"] = lessons

    return question


@app.get(
    "/api/admin/questions/{question_id}"
)
async def admin_get_question(
    question_id: str,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)
    return await admin_get_question_record(question_id)


@app.patch(
    "/api/admin/questions/{question_id}"
)
async def admin_update_question(
    question_id: str,
    data: AdminQuestionUpdate,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    payload = {
        key: value
        for key, value in data.model_dump(
            exclude={"lesson_ids", "options"}
        ).items()
        if value is not None
    }

    if payload:
        rows = await supabase_request(
            "PATCH",
            "questions",
            params={"id": f"eq.{question_id}"},
            payload={
                **payload,
                "updated_at": now_iso(),
            },
            privileged=True,
        )

        if not rows:
            raise HTTPException(
                status_code=404,
                detail="Question not found.",
            )

    if data.options is not None:
        await supabase_request(
            "DELETE",
            "question_options",
            params={
                "question_id": f"eq.{question_id}"
            },
            privileged=True,
        )

        for option in data.options:
            await supabase_request(
                "POST",
                "question_options",
                payload={
                    "question_id": question_id,
                    **option.model_dump(),
                },
                privileged=True,
            )

    if data.lesson_ids is not None:
        await supabase_request(
            "DELETE",
            "question_lessons",
            params={
                "question_id": f"eq.{question_id}"
            },
            privileged=True,
        )

        for lesson_id in data.lesson_ids:
            await get_one(
                "lessons",
                lesson_id,
                select="id",
                privileged=True,
            )

            await supabase_request(
                "POST",
                "question_lessons",
                payload={
                    "question_id": question_id,
                    "lesson_id": lesson_id,
                    "relevance": 1.0,
                },
                privileged=True,
            )

    return await admin_get_question_record(
        question_id
    )


@app.delete(
    "/api/admin/questions/{question_id}"
)
async def admin_delete_question(
    question_id: str,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    dependencies = [
        "question_options",
        "question_lessons",
        "question_concepts",
        "game_definition_questions",
        "game_session_questions",
        "challenge_questions",
    ]

    for table in dependencies:
        rows = await supabase_request(
            "GET",
            table,
            params={
                "question_id": f"eq.{question_id}",
                "select": "question_id",
                "limit": "1",
            },
            privileged=True,
        )

        if rows:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Question is referenced by {table}."
                ),
            )

    rows = await supabase_request(
        "DELETE",
        "questions",
        params={"id": f"eq.{question_id}"},
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "id": question_id,
    }


# ---------------------------------------------------------------------
# Admin lesson relationships
# ---------------------------------------------------------------------

@app.post(
    "/api/admin/lessons/{lesson_id}/concepts/{concept_id}"
)
async def admin_attach_concept(
    lesson_id: int,
    concept_id: int,
    is_primary: bool = False,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    await get_one(
        "lessons",
        lesson_id,
        select="id",
        privileged=True,
    )

    await get_one(
        "concepts",
        concept_id,
        select="id",
        privileged=True,
    )

    rows = await supabase_request(
        "POST",
        "lesson_concepts",
        payload={
            "lesson_id": lesson_id,
            "concept_id": concept_id,
            "is_primary": is_primary,
        },
        privileged=True,
    )

    return rows[0] if rows else {}


@app.delete(
    "/api/admin/lessons/{lesson_id}/concepts/{concept_id}"
)
async def admin_detach_concept(
    lesson_id: int,
    concept_id: int,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    rows = await supabase_request(
        "DELETE",
        "lesson_concepts",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "concept_id": f"eq.{concept_id}",
        },
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "lesson_id": lesson_id,
        "concept_id": concept_id,
    }


@app.post(
    "/api/admin/lessons/{lesson_id}/sources/{source_id}"
)
async def admin_attach_source(
    lesson_id: int,
    source_id: str,
    locator: str | None = None,
    notes: str | None = None,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    await get_one(
        "lessons",
        lesson_id,
        select="id",
        privileged=True,
    )

    await get_one(
        "curriculum_sources",
        source_id,
        select="id",
        privileged=True,
    )

    rows = await supabase_request(
        "POST",
        "lesson_source_refs",
        payload={
            "lesson_id": lesson_id,
            "source_id": source_id,
            "locator": locator,
            "notes": notes,
        },
        privileged=True,
    )

    return rows[0] if rows else {}


@app.delete(
    "/api/admin/lessons/{lesson_id}/sources/{source_id}"
)
async def admin_detach_source(
    lesson_id: int,
    source_id: str,
    authorization: str | None = Header(default=None),
):
    await require_admin(authorization)

    rows = await supabase_request(
        "DELETE",
        "lesson_source_refs",
        params={
            "lesson_id": f"eq.{lesson_id}",
            "source_id": f"eq.{source_id}",
        },
        privileged=True,
    )

    return {
        "deleted": bool(rows),
        "lesson_id": lesson_id,
        "source_id": source_id,
    }