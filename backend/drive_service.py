import os
from urllib.parse import quote

from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")

if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL.")


class DriveService:
    """
    Compatibility service for existing asset references.

    TheTutor uses Supabase Storage as the primary asset storage.
    This service does not contain API keys or credentials.
    """

    def __init__(self):
        self.supabase_url = SUPABASE_URL.rstrip("/")

    def get_file_stream_url(
        self,
        file_id: str,
        bucket: str = "lesson-assets",
    ) -> str:
        """
        Return the public Supabase Storage URL for an asset.

        `file_id` is treated as the Storage object path.
        """
        if not file_id:
            return ""

        safe_bucket = quote(
            bucket.strip("/"),
            safe="",
        )

        safe_path = quote(
            file_id.lstrip("/"),
            safe="/",
        )

        return (
            f"{self.supabase_url}"
            f"/storage/v1/object/public/"
            f"{safe_bucket}/{safe_path}"
        )


drive_service = DriveService()