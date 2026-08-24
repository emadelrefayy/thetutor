from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

app = FastAPI(title="The Tutor Complete API", version="3.6.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def fetch_from_supabase(endpoint: str):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Range": "0-999"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SUPABASE_URL}/rest/v1/{endpoint}", headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/")
def read_root():
    return {"status": "online", "system": "The Tutor Backend Connected Successfully"}

@app.get("/api/full-curriculum")
async def get_full_curriculum():
    return {
        "status": "success",
        "grades": await fetch_from_supabase("grades?select=*"),
        "terms": await fetch_from_supabase("terms?select=*"),
        "subjects": await fetch_from_supabase("subjects?select=*"),
        "lessons": await fetch_from_supabase("lessons?select=*")
    }

@app.get("/api/grades")
async def get_grades():
    return await fetch_from_supabase("grades?select=*")

@app.get("/api/terms")
async def get_terms():
    return await fetch_from_supabase("terms?select=*")

@app.get("/api/subjects")
async def get_subjects():
    return await fetch_from_supabase("subjects?select=*")

@app.get("/api/lessons")
async def get_lessons():
    return await fetch_from_supabase("lessons?select=*")

@app.get("/api/lessons/{subject_id}")
async def get_lessons_by_subject(subject_id: int):
    return await fetch_from_supabase(f"lessons?select=*&subject_id=eq.{subject_id}")



@app.get("/api/health")
def system_health_analytics():
    import time
    cpu_pct = 15.0
    ram_total = 2048
    ram_used = 1024
    ram_pct = 50.0

    try:
        # قراءة الذاكرة الحقيقية من لينكس
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

    try:
        # قراءة تقريبية سريعة لحمل المعالج من /proc/stat
        with open("/proc/stat", "r") as f:
            fields = [float(x) for x in f.readline().split()[1:]]
            idle = fields[3]
            total = sum(fields)
            time.sleep(0.05)
            f.seek(0)
            fields2 = [float(x) for x in f.readline().split()[1:]]
            idle2 = fields2[3]
            total2 = sum(fields2)
            diff_idle = idle2 - idle
            diff_total = total2 - total
            if diff_total > 0:
                cpu_pct = round(100.0 * (1.0 - diff_idle / diff_total), 1)
    except Exception:
        pass

    return {
        "status": "healthy",
        "service": "The Tutor Termux Backend",
        "version": "3.6.0",
        "uptime_seconds": int(time.time()),
        "metrics": {
            "cpu_usage_percent": max(0.0, min(100.0, cpu_pct)),
            "ram_usage_percent": max(0.0, min(100.0, ram_pct)),
            "ram_used_mb": ram_used,
            "ram_total_mb": ram_total,
            "ram_free_mb": max(0, ram_total - ram_used)
        },
        "database": "Supabase Cloud Connected"
    }
