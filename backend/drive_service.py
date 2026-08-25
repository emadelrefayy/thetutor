import os
from dotenv import load_dotenv

load_dotenv()

class DriveService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_DRIVE_API_KEY", "")

    def get_file_stream_url(self, file_id: str) -> str:
        """
        توليد رابط مباشر لاستعراض الملفات التعليمية
        """
        if not file_id:
            return ""
        return f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media&key={self.api_key}"

drive_service = DriveService()
