import os
import re
import json
import sys
import socket
import requests
import dns.resolver
from supabase import create_client, Client

sys.stdout.reconfigure(encoding='utf-8')

# --- إجبار بيئة Python على استخدام Google DNS مباشرة ---
def custom_resolver(domain):
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ['8.8.8.8', '1.1.1.1']
    try:
        answers = resolver.resolve(domain, 'A')
        return answers[0].to_text()
    except Exception as e:
        print(f"⚠️ DNS Custom Resolve Failed for {domain}: {e}")
        return None

# إصلاح الاتصال بـ Supabase و OpenRouter تلقائياً
print("🔍 جاري فحص وتوجيه الـ DNS من داخل Python...")
supabase_domain = "xsfjlzneykogdltuiwno.supabase.co"
openrouter_domain = "openrouter.ai"

supabase_ip = custom_resolver(supabase_domain)
openrouter_ip = custom_resolver(openrouter_domain)

if supabase_ip:
    print(f"✅ Supabase Resolved -> {supabase_ip}")
if openrouter_ip:
    print(f"✅ OpenRouter Resolved -> {openrouter_ip}")

# --- البيانات والاعتمادات ---
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
                "content": "You are a JSON generator. Output ONLY a raw JSON object. Do not add markdown backticks, no code blocks, and no thinking text."
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

def run_injector():
    md_path = "master_lessons.md"
    if not os.path.exists(md_path):
        print(f"Error: {md_path} not found.")
        return

    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    full_text = "".join(lines)
    instructions = full_text.split("# LESSONS MANIFEST")[0]

    for idx, line in enumerate(lines):
        if line.strip().startswith("- [ ]"):
            print(f"🚀 Processing Lesson: {line.strip()}")

            lesson_id = re.search(r"ID:\s*(\d+)", line).group(1)
            subj_id = re.search(r"Subj:\s*(\d+)", line).group(1)
            unit_num = re.search(r"Unit:\s*(\d+)", line).group(1)
            les_num = re.search(r"Les:\s*(\d+)", line).group(1)
            title = re.search(r"Title:\s*([^|]+)", line).group(1).strip()
            vid_url = re.search(r"Vid:\s*([^|]+)", line).group(1).strip()
            info_img = re.search(r"InfoImg:\s*([^\s]+)", line).group(1).strip()

            prompt = f"""
            {instructions}

            Target Lesson Details:
            - Lesson Title: {title}
            - Unit Number: {unit_num}
            - Lesson Number: {les_num}

            Return ONLY valid JSON with this exact schema:
            {{
                "mental_hook": "Engaging sentence",
                "explanation_text": "Detailed lesson body (150-200 words)",
                "memory_anchor": "Catchy memory mnemonic",
                "quizzes": [
                    {{
                        "question": "Question text",
                        "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
                        "correct_option": 0,
                        "difficulty": "easy",
                        "explanation": "Educational reason"
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
                    f"![Infographic]({info_img})\n\n"
                    f"### Memory Anchor\n{data['memory_anchor']}"
                )

                lesson_payload = {
                    "id": int(lesson_id),
                    "subject_id": int(subj_id),
                    "unit_number": int(unit_num),
                    "lesson_number": int(les_num),
                    "title": title,
                    "content_summary": full_summary,
                    "video_url": vid_url,
                    "game_url": f"/games/lesson/{lesson_id}"
                }
                supabase.table("lessons").upsert(lesson_payload).execute()

                for q in data['quizzes']:
                    quiz_payload = {
                        "lesson_id": int(lesson_id),
                        "question": q['question'],
                        "options": {
                            "choices": q['options'],
                            "difficulty": q['difficulty'],
                            "explanation": q['explanation']
                        },
                        "correct_option": q['correct_option']
                    }
                    supabase.table("quizzes").insert(quiz_payload).execute()

                lines[idx] = line.replace("- [ ]", "- [x]", 1)
                with open(md_path, "w", encoding="utf-8") as f:
                    f.writelines(lines)
                
                print(f"✅ SUCCESS: Injected Lesson ID: {lesson_id}\n")

            except Exception as e:
                import traceback
                print(f"❌ ERROR processing lesson {lesson_id}:")
                traceback.print_exc()
                break

if __name__ == "__main__":
    run_injector()
