import os
import secrets
import string
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()


# ------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------

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
    raise RuntimeError(
        "Missing SUPABASE_URL."
    )

if not SUPABASE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_KEY."
    )

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


# ------------------------------------------------------------------
# Application
# ------------------------------------------------------------------

app = FastAPI(
    title="The Tutor API",
    version="1.0.0",
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


# ------------------------------------------------------------------
# Authentication
# ------------------------------------------------------------------

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


# ------------------------------------------------------------------
# Supabase REST
# ------------------------------------------------------------------

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
                "message": (
                    "Supabase request failed."
                ),
                "status": response.status_code,
                "response": response.text,
            },
        )

    if not response.content:
        return []

    return response.json()


# ------------------------------------------------------------------
# Health
# ------------------------------------------------------------------

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


# ------------------------------------------------------------------
# Curriculum
# ------------------------------------------------------------------

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


@app.get(
    "/api/grades/{grade_id}/terms"
)
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


@app.get(
    "/api/terms/{term_id}/subjects"
)
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


@app.get(
    "/api/subjects/{subject_id}"
)
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


@app.get(
    "/api/subjects/{subject_id}/units"
)
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


@app.get(
    "/api/units/{unit_id}"
)
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


@app.get(
    "/api/units/{unit_id}/lessons"
)
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
                "title,"
                "unit_number,"
                "lesson_number,"
                "content_summary,"
                "video_url,"
                "infographic_url,"
                "game_url,"
                "created_at"
            ),
            "order": "lesson_number.asc",
        },
    )


@app.get(
    "/api/lessons/{lesson_id}"
)
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
                "title,"
                "unit_number,"
                "lesson_number,"
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


# ------------------------------------------------------------------
# Lesson Content
# ------------------------------------------------------------------

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
                "lesson_id,"
                "concept_id,"
                "is_primary,"
                "created_at"
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

        if not concepts:
            continue

        concept = concepts[0]
        concept["is_primary"] = (
            link.get("is_primary", False)
        )

        result.append(concept)

    return result


# ------------------------------------------------------------------
# Questions
# ------------------------------------------------------------------

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
            "questions",
            params={
                "id": f"eq.{question_id}",
                "status": "eq.published",
                "select": (
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
                    "generation_source"
                ),
                "limit": "1",
            },
        )

        if not questions:
            continue

        options = await supabase_request(
            "GET",
            "question_options",
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
        "questions",
        params={
            "id": f"eq.{question_id}",
            "status": "eq.published",
            "select": (
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
                "generation_source"
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
        "question_options",
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


# ------------------------------------------------------------------
# Student
# ------------------------------------------------------------------

async def require_student(
    student_profile_id: str,
    authorization: str | None,
) -> str:
    auth = require_bearer(authorization)

    user = await supabase_auth_user(auth)

    if user.get("id") != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return auth


@app.get(
    "/api/students/{student_profile_id}"
)
async def get_student(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth = await require_student(
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
    "/api/students/{student_profile_id}/progress"
)
async def get_student_progress(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth = await require_student(
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
            "select": (
                "id,"
                "student_profile_id,"
                "lesson_id,"
                "status,"
                "completion_percent,"
                "first_started_at,"
                "completed_at,"
                "last_accessed_at,"
                "time_spent_seconds,"
                "updated_at"
            ),
            "order": "updated_at.desc",
        },
        authorization=auth,
    )


@app.get(
    "/api/students/{student_profile_id}/analytics"
)
async def get_student_analytics(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth = await require_student(
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
            "order": "updated_at.desc",
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
            "order": "updated_at.desc",
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


# ------------------------------------------------------------------
# Student Learning Events
# ------------------------------------------------------------------

@app.post(
    "/api/students/{student_profile_id}/events"
)
async def create_learning_event(
    student_profile_id: str,
    event: dict,
    authorization: str | None = Header(
        default=None
    ),
):
    auth = await require_student(
        student_profile_id,
        authorization,
    )

    payload = {
        "student_profile_id": student_profile_id,
        "event_type": event.get(
            "event_type"
        ),
        "lesson_id": event.get(
            "lesson_id"
        ),
        "concept_id": event.get(
            "concept_id"
        ),
        "metadata": event.get(
            "metadata",
            {},
        ),
        "occurred_at": event.get(
            "occurred_at"
        ),
    }

    if not payload["event_type"]:
        raise HTTPException(
            status_code=400,
            detail="event_type is required.",
        )

    if not payload["occurred_at"]:
        payload.pop("occurred_at")

    rows = await supabase_request(
        "POST",
        "learning_events",
        payload=payload,
        authorization=auth,
    )

    return rows[0] if rows else {}


# ------------------------------------------------------------------
# Parent Invitations
# ------------------------------------------------------------------

def generate_invitation_code():
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


@app.post(
    "/api/parent/invitations"
)
async def create_parent_invitation(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth = require_bearer(authorization)

    user = await supabase_auth_user(auth)

    created_by = user.get("id")

    if not created_by:
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user.",
        )

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
        privileged=False,
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
    auth = require_bearer(authorization)

    user = await supabase_auth_user(auth)

    parent_profile_id = user.get("id")

    if not parent_profile_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user.",
        )

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
                "eq."
                + invitation[
                    "student_profile_id"
                ]
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
            detail=(
                "Relationship already exists."
            ),
        )

    relationship = await supabase_request(
        "POST",
        "parent_students",
        payload={
            "parent_profile_id": (
                parent_profile_id
            ),
            "student_profile_id": (
                invitation[
                    "student_profile_id"
                ]
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
            "used_at": datetime.now(
                timezone.utc
            ).isoformat(),
        },
        privileged=True,
    )

    if not updated:
        raise HTTPException(
            status_code=409,
            detail=(
                "Invitation was already "
                "claimed."
            ),
        )

    return {
        "status": "success",
        "student_profile_id": (
            invitation[
                "student_profile_id"
            ]
        ),
        "relationship": relationship,
    }