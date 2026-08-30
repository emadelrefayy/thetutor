
## ⚙️ متطلبات التشغيل

- Node.js (v18+)
- Python (v3.10+)
- حساب Supabase (للـ Database, Auth, Storage)

## 🏃 تشغيل المشروع محلياً

### 1. إعداد قاعدة البيانات (Supabase)
- أنشئ مشروعاً جديداً على Supabase.
- شغّل ملف `schema.sql` (الموجود في جذر المشروع) في SQL Editor.

### 2. تشغيل Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # أو `venv\Scripts\activate` في ويندوز
pip install -r requirements.txt
# أنشئ ملف .env وضع فيه رابط Supabase ومفاتيح API
uvicorn main:app --reload --port 8000