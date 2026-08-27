import os
import secrets
import string
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

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

SUPABASE_REST_URL = (
    f"{SUPABASE_URL.rstrip('/')}/rest/v1"
)

SUPABASE_AUTH_URL = (
    f"{SUPABASE_URL.rstrip('/')}/auth/v1"
)

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

    return authorization


async def supabase_auth_user(
    authorization: str,
):
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

    return response.json()


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
        bearer = authorization or f"Bearer {key}"

    headers = {
        "apikey": key,
        "Authorization": bearer,
        "Content-Type": "application/json",
    }

    if method in {"POST", "PATCH", "PUT"}:
        headers["Prefer"] = "return=representation"

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

    return response.json()


async def authenticated_user(
    authorization: str | None,
):
    token = require_bearer(authorization)
    return await supabase_auth_user(token)


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
            "order": "unit_number.asc",
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
            "order": "lesson_number.asc",
        },
    )


@app.get("/api/lessons/{lesson_id}")
async def get_lesson(
    lesson_id: int,
):
    rows = await supabase_request(
        "GET",
        "lessons",
        params={
            "id": f"eq.{lesson_id}",
            "select": "*",
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
            "order": "sort_order.asc",
        },
    )


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
            "select": "question_id,relevance",
            "order": "relevance.desc",
        },
    )

    result = []

    for link in links:
        questions = await supabase_request(
            "GET",
            "questions",
            params={
                "id": f"eq.{link['question_id']}",
                "select": (
                    "id,question_type,difficulty,"
                    "prompt,metadata,source,status,"
                    "skill_type,generation_source"
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
                    f"eq.{link['question_id']}"
                ),
                "select": (
                    "id,question_id,option_key,"
                    "option_text,sort_order,metadata"
                ),
                "order": "sort_order.asc",
            },
        )

        question = questions[0]
        question["relevance"] = link["relevance"]
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
            "select": (
                "id,question_type,difficulty,"
                "prompt,metadata,source,status,"
                "skill_type,generation_source"
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
            "question_id": f"eq.{question_id}",
            "select": (
                "id,question_id,option_key,"
                "option_text,sort_order,metadata"
            ),
            "order": "sort_order.asc",
        },
    )

    questions[0]["options"] = options

    return questions[0]


# ------------------------------------------------------------------
# Student
# ------------------------------------------------------------------


@app.get(
    "/api/students/{student_profile_id}"
)
async def get_student(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth = require_bearer(authorization)
    user = await supabase_auth_user(auth)

    if user.get("id") != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    rows = await supabase_request(
        "GET",
        "student_profiles",
        params={
            "profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
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
    auth = require_bearer(authorization)
    user = await supabase_auth_user(auth)

    if user.get("id") != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
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
    "/api/students/{student_profile_id}/analytics"
)
async def get_student_analytics(
    student_profile_id: str,
    authorization: str | None = Header(
        default=None
    ),
):
    auth = require_bearer(authorization)
    user = await supabase_auth_user(auth)

    if user.get("id") != student_profile_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    metrics = await supabase_request(
        "GET",
        "student_subject_metrics",
        params={
            "student_profile_id": (
                f"eq.{student_profile_id}"
            ),
            "select": "*",
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
# Parent invitations
# ------------------------------------------------------------------


def generate_invitation_code():
    alphabet = string.ascii_uppercase + string.digits

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
            "student_profile_id": student_profile_id,
            "created_by": created_by,
            "code": code,
        },
        authorization=auth,
        privileged=True,
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

    invitations = await supabase_request(
        "GET",
        "parent_invitations",
        params={
            "code": f"eq.{code}",
            "used_at": "is.null",
            "select": (
                "id,student_profile_id,"
                "expires_at"
            ),
            "limit": "1",
        },
        authorization=auth,
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
            "select": "parent_profile_id",
            "limit": "1",
        },
        authorization=auth,
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
                invitation[
                    "student_profile_id"
                ]
            ),
            "relationship": "parent",
            "is_primary": False,
        },
        authorization=auth,
        privileged=True,
    )

    await supabase_request(
        "PATCH",
        "parent_invitations",
        params={
            "id": f"eq.{invitation['id']}"
        },
        payload={
            "used_by": parent_profile_id,
            "used_at": datetime.now(
                timezone.utc
            ).isoformat(),
        },
        authorization=auth,
        privileged=True,
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