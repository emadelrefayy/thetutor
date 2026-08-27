rm -f injector_auto.py && cat << 'EOF' > injector_auto.py
import os
import re
import json
import sys
import requests
import dns.resolver
from supabase import create_client, Client

sys.stdout.reconfigure(encoding='utf-8')

def custom_resolver(domain):
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ['8.8.8.8', '1.1.1.1']
    try:
        answers = resolver.resolve(domain, 'A')
        return answers[0].to_text()
    except Exception:
        return None

custom_resolver("xsfjlzneykogdltuiwno.supabase.co")
custom_resolver("openrouter.ai")

SUPABASE_URL = "https://xsfjlzneykogdltuiwno.supabase.co"
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
OPENROUTER_API_KEY = os.environ["OPENROUTER_API_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def call_openrouter(prompt_text):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://thetutor.app",
        "X-Title": "TheTutor App",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "openrouter/free",
        "messages": [
            {
                "role": "system",
                "content": "You are a professional educational JSON generator. Output ONLY a raw JSON object. Do not add markdown backticks, no code blocks, and no thinking text."
            },
            {"role": "user", "content": prompt_text}
        ]
    }
    res = requests.post(url, headers=headers, json=payload, timeout=60)
    if res.status_code == 200:
        res_data = res.json()
        if 'choices' in res_data and len(res_data['choices']) > 0:
            content = res_data['choices'][0]['message']['content']
            if content and len(content.strip()) > 0:
                return content
    raise Exception(f"OpenRouter Call Failed. Status: {res.status_code}, Response: {res.text}")

def clean_and_parse_json(raw_text):
    text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL)
    text = re.sub(r'```json\s*|\s*```', '', text).strip()
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1:
        text = text[start_idx:end_idx+1]
    return json.loads(text, strict=False)

def run_auto_injector():
    print("🔍 جاري جلب الدروس التي تحتاج إلى محتوى من قاعدة البيانات...")
    response = supabase.table("lessons").select("*").or_("content_summary.is.null,content_summary.eq.''").execute()
    lessons = response.data

    if not lessons:
        print("🎉 رائع جداً! لا توجد دروس فارغة، جميع الدروس تم حقن محتواها مسبقاً.")
        return

    print(f"📦 تم العثور على {len(lessons)} درس يحتاج إلى حقن المحتوى. بدء العملية...\n")

    for lesson in lessons:
        lesson_id = lesson['id']
        title = lesson['title']
        unit_num = lesson['unit_number']
        les_num = lesson['lesson_number']
        
        print(f"🚀 معالجة الدرس [ID: {lesson_id}] - {title} (الوحدة {unit_num}, الدرس {les_num})")

        prompt = f"""
        Act as an expert curriculum developer for primary school students. Create educational content for this lesson:
        - Lesson Title: {title}
        - Unit Number: {unit_num}
        - Lesson Number: {les_num}

        Return ONLY valid JSON with this exact schema:
        {{
            "mental_hook": "Engaging introductory sentence in Arabic",
            "explanation_text": "Detailed educational lesson body in Arabic (150-200 words)",
            "memory_anchor": "Catchy memory tip or mnemonic in Arabic",
            "quizzes": [
                {{
                    "question": "Question text in Arabic",
                    "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
                    "correct_option": 0,
                    "difficulty": "easy",
                    "explanation": "Why this answer is correct in Arabic"
                }}
            ]
        }}
        """
        try:
            raw_content = call_openrouter(prompt)
            data = clean_and_parse_json(raw_content)

            full_summary = (
                f"### Mental Hook\n{data['mental_hook']}\n\n"
                f"### Lesson Explanation\n{data['explanation_text']}\n\n"
                f"![Infographic](https://placehold.co/600x400)\n\n"
                f"### Memory Anchor\n{data['memory_anchor']}"
            )

            supabase.table("lessons").update({
                "content_summary": full_summary
            }).eq("id", lesson_id).execute()

            for q in data['quizzes']:
                quiz_payload = {
                    "lesson_id": lesson_id,
                    "question": q['question'],
                    "options": {
                        "choices": q['options'],
                        "difficulty": q['difficulty'],
                        "explanation": q['explanation']
                    },
                    "correct_option": q['correct_option']
                }
                supabase.table("quizzes").insert(quiz_payload).execute()

            print(f"✅ تم بنجاح تحديث الدرس ID: {lesson_id} وإضافة أسئلته.\n")

        except Exception as e:
            print(f"❌ حدث خطأ أثناء معالجة الدرس {lesson_id}: {e}\n")
            continue

if __name__ == "__main__":
    run_auto_injector()
EOF
python3 injector_auto.py
