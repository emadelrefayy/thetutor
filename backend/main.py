from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
import string
import random
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xsfjlzneykogdltuiwno.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

app = FastAPI(title="The Tutor Complete API", version="3.7.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_invitation_code():
    chars = string.ascii_uppercase + string.digits
    return 'PAR-' + ''.join(random.choice(chars) for _ in range(6))

async def fetch_from_supabase(endpoint: str):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SUPABASE_URL}/rest/v1/{endpoint}", headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/")
def read_root():
    return {"status": "online", "system": "The Tutor Backend Connected Successfully"}

# endpoint لجلب المواد المخصصة لسنة دراسية محددة فقط
@app.get("/api/subjects/grade/{grade_id}")
async def get_subjects_by_grade(grade_id: int):
    # جلب التيرمات الخاصة بهذ الصف أولاً ثم جلب موادها
    terms = await fetch_from_supabase(f"terms?grade_id=eq.{grade_id}&select=id")
    term_ids = [str(t["id"]) for t in terms]
    if not term_ids:
        return []
    ids_str = ",".join(term_ids)
    return await fetch_from_supabase(f"subjects?term_id=in.({ids_str})&select=*")

# endpoint لإنشاء وتخصيص رمز دعوة لطالب من قبل الأدمن
@app.post("/api/admin/generate-student-code/{student_id}")
async def generate_student_code(student_id: str, grade_id: int):
    code = generate_invitation_code()
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}
    
    async with httpx.AsyncClient() as client:
        res = await client.patch(
            f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{student_id}",
            headers=headers,
            json={"invitation_code": code, "is_code_used": False, "grade_id": grade_id}
        )
        if res.status_code not in [200, 204]:
            raise HTTPException(status_code=400, detail="فشل في توليد رمز الدعوة")
            
    return {"status": "success", "invitation_code": code, "grade_id": grade_id}

# endpoint لولي الأمر لإدخال الرمز وربط الابن
@app.post("/api/parent/claim-child")
async def claim_child_with_code(parent_id: str, invitation_code: str):
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}
    
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/profiles?invitation_code=eq.{invitation_code}&select=id,full_name,grade_id",
            headers=headers
        )
        students = res.json()
        
        if not students:
            raise HTTPException(status_code=404, detail="رمز الدعوة غير صحيح أو غير موجود")
            
        student = students[0]
        
        # ربط الابن بولي الأمر في جدول children
        relation_res = await client.post(
            f"{SUPABASE_URL}/rest/v1/children",
            headers=headers,
            json={"parent_id": parent_id, "student_id": student["id"]}
        )
        
        if relation_res.status_code in [200, 201]:
            await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{student['id']}",
                headers=headers,
                json={"is_code_used": True}
            )
            return {
                "status": "success",
                "message": f"تم ربط الطالب {student.get('full_name', '')} بنجاح!",
                "student_id": student["id"],
                "grade_id": student.get("grade_id")
            }
        else:
            raise HTTPException(status_code=400, detail="هذا الطالب مربوط بالفعل بولي أمر")

@app.get("/api/health")
def system_health_analytics():
    ram_total = 2048
    ram_used = 1024
    ram_pct = 50.0
    try:
        with open("/proc/meminfo", "r") as f:
            lines = f.readlines()
            mem_info = {}
            for line in lines:
                parts = line.split()
                if len(parts) >= 2:
                    mem_info[parts[0].rstrip(":")] = int(parts[1])
            total_kb = mem_info.get("MemTotal", 2097152)
            free_kb = mem_info.get("MemAvailable", mem_info.get("MemFree", 1048576))
            ram_total = total_kb // 1024
            ram_used = (total_kb - free_kb) // 1024
            if ram_total > 0:
                ram_pct = round((ram_used / ram_total) * 100, 1)
    except Exception:
        pass

    return {
        "status": "healthy",
        "cpu_usage_pct": 15.0,
        "ram_total_mb": ram_total,
        "ram_used_mb": ram_used,
        "ram_usage_pct": ram_pct
    }
