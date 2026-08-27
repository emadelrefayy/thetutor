import asyncio
import json
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
    )

BASE_URL = f"{SUPABASE_URL.rstrip('/')}/rest/v1"

HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


async def get(client, table, params):
    response = await client.get(
        f"{BASE_URL}/{table}",
        headers=HEADERS,
        params=params,
    )
    response.raise_for_status()
    return response.json()


async def post(client, table, payload):
    response = await client.post(
        f"{BASE_URL}/{table}",
        headers=HEADERS,
        json=payload,
    )
    response.raise_for_status()
    return response.json()


def load_source(path):
    file_path = Path(path)

    if not file_path.exists():
        raise FileNotFoundError(path)

    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


async def find_existing_question(client, prompt):
    rows = await get(
        client,
        "questions",
        {
            "prompt": f"eq.{prompt}",
            "select": "id,prompt",
            "limit": "1",
        },
    )
    return rows[0] if rows else None


async def create_question(client, question):
    existing = await find_existing_question(
        client,
        question["prompt"],
    )

    if existing:
        return existing, False

    payload = {
        "question_type": question.get(
            "question_type",
            "multiple_choice",
        ),
        "difficulty": question.get("difficulty"),
        "prompt": question["prompt"],
        "explanation": question.get("explanation"),
        "correct_answer": question.get("correct_answer"),
        "metadata": question.get("metadata", {}),
        "source": question.get(
            "source",
            "content_injector_auto",
        ),
        "status": question.get("status", "draft"),
        "skill_type": question.get("skill_type"),
        "generation_source": question.get(
            "generation_source",
            "automatic",
        ),
    }

    rows = await post(
        client,
        "questions",
        payload,
    )

    if not rows:
        raise RuntimeError("Question insert returned no row.")

    return rows[0], True


async def create_options(client, question_id, options):
    if not options:
        return

    existing = await get(
        client,
        "question_options",
        {
            "question_id": f"eq.{question_id}",
            "select": "id",
            "limit": "1",
        },
    )

    if existing:
        return

    payload = []

    for index, option in enumerate(options):
        payload.append(
            {
                "question_id": question_id,
                "option_key": option.get(
                    "option_key",
                    chr(65 + index),
                ),
                "option_text": option["option_text"],
                "is_correct": bool(
                    option.get("is_correct", False)
                ),
                "sort_order": option.get(
                    "sort_order",
                    index,
                ),
                "metadata": option.get(
                    "metadata",
                    {},
                ),
            }
        )

    await post(
        client,
        "question_options",
        payload,
    )


async def link_lesson(client, question_id, lesson_id):
    existing = await get(
        client,
        "question_lessons",
        {
            "question_id": f"eq.{question_id}",
            "lesson_id": f"eq.{lesson_id}",
            "select": "question_id",
            "limit": "1",
        },
    )

    if existing:
        return

    await post(
        client,
        "question_lessons",
        {
            "question_id": question_id,
            "lesson_id": lesson_id,
            "relevance": 1.0,
        },
    )


async def run(input_file):
    data = load_source(input_file)

    lesson_id = data.get("lesson_id")
    questions = data.get("questions", [])

    if not isinstance(questions, list):
        raise ValueError("'questions' must be a list.")

    async with httpx.AsyncClient(timeout=60) as client:
        for index, question in enumerate(
            questions,
            start=1,
        ):
            question, created = await create_question(
                client,
                question,
            )

            await create_options(
                client,
                question["id"],
                data.get("options", [])
                if "options" not in question
                else question["options"],
            )

            current_lesson_id = question.get(
                "lesson_id",
                lesson_id,
            )

            if current_lesson_id is not None:
                await link_lesson(
                    client,
                    question["id"],
                    int(current_lesson_id),
                )

            state = "created" if created else "existing"

            print(
                f"[{index}/{len(questions)}] "
                f"{state}: {question['id']}"
            )


def main():
    if len(sys.argv) != 2:
        print(
            "Usage: python injector_auto.py <json_file>"
        )
        sys.exit(1)

    asyncio.run(run(sys.argv[1]))


if __name__ == "__main__":
    main()