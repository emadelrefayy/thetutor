import os
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
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


async def record_learning_event(
    *,
    student_profile_id: str,
    event_type: str,
    lesson_id: int | None = None,
    concept_id: int | None = None,
    metadata: dict | None = None,
):
    payload = {
        "student_profile_id": student_profile_id,
        "event_type": event_type,
        "lesson_id": lesson_id,
        "concept_id": concept_id,
        "metadata": metadata or {},
        "occurred_at": (
            datetime.now(timezone.utc)
            .isoformat()
        ),
    }

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": (
            f"Bearer "
            f"{SUPABASE_SERVICE_ROLE_KEY}"
        ),
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:
        response = await client.post(
            f"{SUPABASE_REST_URL}/learning_events",
            headers=headers,
            json=payload,
        )

    if response.status_code >= 400:
        raise RuntimeError(
            "Failed to record learning event: "
            f"{response.text}"
        )

    if not response.content:
        return None

    rows = response.json()

    return rows[0] if rows else None