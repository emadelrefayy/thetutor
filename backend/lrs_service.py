import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xsfjlzneykogdltuiwno.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

async def log_learning_statement(user_id: str, verb: str, object_id: str, payload: dict = None):
    """
    تسجيل بيان التعلم (xAPI Statement) لتتبع أداء الطالب
    """
    url = f"{SUPABASE_URL}/rest/v1/learning_analytics"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    data = {
        "user_id": user_id,
        "verb": verb,
        "object_id": object_id,
        "metadata": payload or {}
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)
        return response.status_code in [200, 201]
