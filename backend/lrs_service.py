import json
from datetime import datetime

class LRSClient:
    """
    خدمة تتبع التعلم المتقدمة LRS وفق معيار xAPI (Tin Can API)
    تُسجل الأنشطة بصيغة: Actor (الطالب) - Verb (التفاعل) - Object (الدرس/اللعبة)
    """
    def __init__(self, endpoint: str = "https://lrs.thetutor.eg/xapi/", key: str = "tutor_key"):
        self.endpoint = endpoint
        self.key = key

    def send_statement(self, student_name: str, student_email: str, verb: str, activity_name: str, score: int = None) -> dict:
        statement = {
            "actor": {
                "name": student_name,
                "mbox": f"mailto:{student_email}",
                "objectType": "Agent"
            },
            "verb": {
                "id": f"http://adlnet.gov/expapi/verbs/{verb}",
                "display": {"ar-EG": verb}
            },
            "object": {
                "id": f"http://thetutor.eg/activities/{activity_name.replace(' ', '_')}",
                "definition": {
                    "name": {"ar-EG": activity_name}
                },
                "objectType": "Activity"
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

        if score is not None:
            statement["result"] = {
                "score": {"raw": score, "min": 0, "max": 100},
                "completion": True
            }

        # محاكاة إرسال الـ Statement إلى LRS Server
        return {
            "status": "stored",
            "statement_id": f"xapi-uuid-{hash(datetime.utcnow().isoformat())}",
            "statement": statement
        }

if __name__ == "__main__":
    lrs = LRSClient()
    res = lrs.send_statement("أحمد علي", "ahmed@thetutor.eg", "completed", "اختبار الدرس الأول علوم", score=90)
    print("✅ تم اختبار إرسال بيان xAPI إلى LRS بنجاح:")
    print(json.dumps(res, ensure_ascii=False, indent=2))
