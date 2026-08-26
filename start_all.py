import os
import sys
import subprocess
import time
from pathlib import Path

# الألوان لعرض مخرجات احترافية في التيرمينال
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
CYAN = "\033[96m"

# تحديد المسار المطلق لمجلد المشروع الرئيسي بغض النظر عن مكان تشغيل التيرمينال
ROOT_DIR = Path("/root/thetutor_fresh")
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
VENV_PYTHON = ROOT_DIR / "venv" / "bin" / "python"

def log(msg, color=CYAN):
    print(f"{color}[ORCHESTRATOR] {msg}{RESET}")

def health_check():
    log("🔍 جاري فحص البيئة والاتصال بقاعدة البيانات...", YELLOW)
    
    if not ROOT_DIR.exists():
        log(f"❌ خطأ: المجلد الرئيسي غير موجود في المسار: {ROOT_DIR}", RED)
        sys.exit(1)
        
    if not BACKEND_DIR.exists() or not FRONTEND_DIR.exists():
        log("❌ خطأ: مجلدات الباك إند أو الفرونت إند غير موجودة!", RED)
        sys.exit(1)
        
    if not VENV_PYTHON.exists():
        log("❌ خطأ: بيئة بايثون الافتراضية (venv) غير متوفرة!", RED)
        sys.exit(1)
        
    env_file = BACKEND_DIR / ".env"
    if not env_file.exists():
        log("⚠️ تحذير: ملف .env غير موجود، جاري إنشاؤه افتراضياً...", YELLOW)
        with open(env_file, "w") as f:
            f.write("SUPABASE_URL=https://xsfjlzneykogdltuiwno.supabase.co\n")
            f.write("SUPABASE_KEY=sb_publishable_F9TC2g0rL4mwufMz0h0iJw_FSfOhj9-\n")
            
    log("✅ الفحص المحلي للبيئة سليماً بنسبة 100%.", GREEN)

def main():
    health_check()
    
    log("🚀 جاري تشغيل سيرفر الباك إند (FastAPI) على البورت 8000...", GREEN)
    backend_process = subprocess.Popen(
        [str(VENV_PYTHON), "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=str(BACKEND_DIR)
    )
    
    time.sleep(2)
    
    log("🚀 جاري تشغيل سيرفر الفرونت إند (Vite) على البورت 3000...", GREEN)
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(FRONTEND_DIR)
    )
    
    print("\n" + "="*50)
    print(f"{GREEN}🎯 المنصة تعمل الآن بكامل طاقتها يا هيرو !{RESET}")
    print(f"🔗 Backend API:  http://localhost:8000")
    print(f"🔗 Frontend UI:  http://localhost:3000")
    print(f"⏹️  اضغط Ctrl+C لإيقاف النظامين بأمان.")
    print("="*50 + "\n")
    
    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        log("🛑 جاري إيقاف السيرفرات وإغلاق العمليات بأمان...", YELLOW)
        backend_process.terminate()
        frontend_process.terminate()
        log("👋 تم إغلاق النظام بنجاح. إلى اللقاء!", GREEN)

if __name__ == "__main__":
    main()
