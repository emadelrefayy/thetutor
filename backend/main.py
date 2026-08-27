import os
import random
import string

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    )

SUPABASE_REST_URL = f"{SUPABASE_URL.rstrip('/')}/rest/v1"

SUPABASE_HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

app = FastAPI(
    title="The Tutor API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173",
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def supabase_get(
    table: str,
    params: dict,
):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"{SUPABASE_REST_URL}/{table}",
            headers=SUPABASE_HEADERS,
            params=params,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    return response.json()


async def supabase_patch(
    table: str,
    filters: dict,
    payload: dict,
):
    params = {
        f"{key}": f"eq.{value}"
        for key, value in filters.items()
    }

    headers = {
        **SUPABASE_HEADERS,
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.patch(
            f"{SUPABASE_REST_URL}/{table}",
            headers=headers,
            params=params,
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    return response.json()


async def supabase_post(
    table: str,
    payload: dict,
):
    headers = {
        **SUPABASE_HEADERS,
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{SUPABASE_REST_URL}/{table}",
            headers=headers,
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    return response.json()


def generate_invitation_code() -> str:
    chars = string.ascii_uppercase + string.digits

    return "PAR-" + "".join(
        random.choice(chars)
        for _ in range(6)
    )


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "The Tutor API",
    }


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "The Tutor API",
    }


@app.get("/api/subjects/grade/{grade_id}")
async def get_subjects_by_grade(
    grade_id: int,
):
    terms = await supabase_get(
        "terms",
        {
            "grade_id": f"eq.{grade_id}",
            "select": "id",
        },
    )

    if not terms:
        return []

    term_ids = ",".join(
        str(term["id"])
        for term in terms
    )

    return await supabase_get(
        "subjects",
        {
            "term_id": f"in.({term_ids})",
            "select": "*",
            "order": "name.asc",
        },
    )


@app.post(
    "/api/admin/generate-student-code/{student_id}"
)
async def generate_student_code(
    student_id: str,
    grade_id: int,
):
    code = generate_invitation_code()

    rows = await supabase_patch(
        "profiles",
        {"id": student_id},
        {
            "invitation_code": code,
            "is_code_used": False,
            "grade_id": grade_id,
        },
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return {
        "status": "success",
        "invitation_code": code,
        "grade_id": grade_id,
    }


@app.post("/api/parent/claim-child")
async def claim_child(
    parent_id: str,
    invitation_code: str,
):
    students = await supabase_get(
        "profiles",
        {
            "invitation_code": (
                f"eq.{invitation_code}"
            ),
            "select": "id,full_name,grade_id",
            "limit": "1",
        },
    )

    if not students:
        raise HTTPException(
            status_code=404,
            detail="Invalid invitation code.",
        )

    student = students[0]

    relation = await supabase_post(
        "parent_students",
        {
            "parent_id": parent_id,
            "student_id": student["id"],
        },
    )

    await supabase_patch(
        "profiles",
        {"id": student["id"]},
        {"is_code_used": True},
    )

    return {
        "status": "success",
        "student_id": student["id"],
        "student_name": student.get(
            "full_name"
        ),
        "grade_id": student.get(
            "grade_id"
        ),
        "relation": relation,
    }