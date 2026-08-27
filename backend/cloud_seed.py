import os

from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL.")

if not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_KEY.")


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
)


print(
    "Connecting to Supabase Cloud..."
)


# ------------------------------------------------------------------
# Basic curriculum seed
# ------------------------------------------------------------------

grades_data = [
    {
        "id": 1,
        "name": "الصف الأول الابتدائي",
    },
    {
        "id": 2,
        "name": "الصف الثاني الابتدائي",
    },
    {
        "id": 3,
        "name": "الصف الثالث الابتدائي",
    },
    {
        "id": 4,
        "name": "الصف الرابع الابتدائي",
    },
    {
        "id": 5,
        "name": "الصف الخامس الابتدائي",
    },
    {
        "id": 6,
        "name": "الصف السادس الابتدائي",
    },
]


try:
    response = (
        supabase
        .table("grades")
        .upsert(grades_data)
        .execute()
    )

    print(
        "Grades seeded successfully."
    )

except Exception as exc:
    print(
        f"Seed operation failed: {exc}"
    )