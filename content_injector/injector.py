import json
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
    )

BASE_URL = f"{SUPABASE_URL.rstrip('/')}/rest/v1"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def load_json(path: str) -> dict:
    file_path = Path(path)

    if not file_path.exists():
        raise FileNotFoundError(f"Input file not found: {file_path}")

    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


async def insert_question(client: httpx.AsyncClient, question: dict) -> dict:
    payload = {
        "question_type": question.get("question_type", "multiple_choice"),
        "difficulty": question.get("difficulty"),
        "prompt": question["prompt"],
        "explanation": question.get("explanation"),
        "correct_answer": question.get("correct_answer"),
        "metadata": question.get("metadata", {}),
        "source": question.get("source", "content_injector"),
        "status": question.get("status", "draft"),
        "skill_type": question.get("skill_type"),
        "generation_source": question.get(
            "generation_source",
            "manual",
        ),
    }

    response = await client.post(
        f"{BASE_URL}/questions",
        headers=HEADERS,
        json=payload,
    )

    response.raise_for_status()
    rows = response.json()

    if not rows:
        raise RuntimeError("Supabase returned no question after insert.")

    return rows[0]


async def insert_options(
    client: httpx.AsyncClient,
    question_id: str,
    options: list[dict],
) -> None:
    if not options:
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
                "is_correct": bool(option.get("is_correct", False)),
                "sort_order": option.get("sort_order", index),
                "metadata": option.get("metadata", {}),
            }
        )

    response = await client.post(
        f"{BASE_URL}/question_options",
        headers=HEADERS,
        json=payload,
    )

    response.raise_for_status()


async def link_question_to_lesson(
    client: httpx.AsyncClient,
    question_id: str,
    lesson_id: int,
    relevance: float = 1.0,
) -> None:
    payload = {
        "question_id": question_id,
        "lesson_id": lesson_id,
        "relevance": relevance,
    }

    response = await client.post(
        f"{BASE_URL}/question_lessons",
        headers=HEADERS,
        json=payload,
    )

    response.raise_for_status()


async def inject_questions(
    input_path: str,
    lesson_id: int | None = None,
) -> None:
    data = load_json(input_path)

    questions = data.get("questions", [])

    if not isinstance(questions, list):
        raise ValueError("'questions' must be a list.")

    if lesson_id is None:
        lesson_id = data.get("lesson_id")

    async with httpx.AsyncClient(timeout=60.0) as client:
        for index, question in enumerate(questions, start=1):
            if "prompt" not in question:
                raise ValueError(
                    f"Question #{index} is missing 'prompt'."
                )

            created = await insert_question(client, question)

            await insert_options(
                client,
                created["id"],
                question.get("options", []),
            )

            question_lesson_id = question.get(
                "lesson_id",
                lesson_id,
            )

            if question_lesson_id is not None:
                await link_question_to_lesson(
                    client,
                    created["id"],
                    int(question_lesson_id),
                    float(question.get("relevance", 1.0)),
                )

            print(
                f"Inserted question {index}/{len(questions)}: "
                f"{created['id']}"
            )


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python injector.py <json_file> [lesson_id]"
        )
        sys.exit(1)

    input_path = sys.argv[1]

    lesson_id = None
    if len(sys.argv) >= 3:
        lesson_id = int(sys.argv[2])

    import asyncio

    asyncio.run(
        inject_questions(
            input_path,
            lesson_id,
        )
    )


if __name__ == "__main__":
    main()