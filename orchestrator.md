# 🧱 خطة بناء مشروع "The Tutor" (المنصة التعليمية الذكية)

---

## المرحلة 1: هيكل المشروع والبيئة
**MODEL:** `gemini`  
**المطلوب:**
- إنشاء مجلدات `frontend/` و `backend/` و `docs/`.
- إنشاء ملفات `README.md` و `.env.example` و `requirements.txt` (فارغة حالياً).
- عمل `git add .` و `git commit -m "Phase 1: Project structure"`.
- كتابة الرقم `2` في ملف `.build-state/current-phase.txt`.

---

## المرحلة 2: قاعدة البيانات (Supabase Schema)
**MODEL:** `openai`  
**المطلوب:**
- إنشاء ملف `backend/supabase_schema.sql` يحتوي على كود SQL لإنشاء الجداول:  
  `students`, `subjects`, `lessons`, `progress`, `daily_challenges`.
- كتابة تعليمات في `README.md` عن كيفية تنفيذ الـ SQL في Supabase.
- عمل `commit` وتحديث الحالة إلى `3`.

---

## المرحلة 3: الباك إند (FastAPI)
**MODEL:** `openai`  
**المطلوب:**
- كتابة `backend/main.py` مع:
  - تشغيل سيرفر على port 8000 مع CORS.
  - Endpoint تجريبي `/api/health` يرد بـ `{"status": "ok"}`.
  - Endpoint `/api/lessons/{id}` يرجع بيانات وهمية للدرس.
- كتابة `requirements.txt` يحتوي على `fastapi`, `uvicorn`, `python-dotenv`, `supabase`.
- عمل `commit` وتحديث الحالة إلى `4`.

---

## المرحلة 4: الفرونت إند (React + TypeScript + Tailwind)
**MODEL:** `gemini`  
**المطلوب:**
- إنشاء مشروع React بـ TypeScript في مجلد `frontend/`.
- تثبيت `tailwindcss` و `shadcn/ui`.
- إنشاء مكونات: `Layout`, `LoginPage`, `Dashboard`, `LessonPage`.
- عمل `commit` وتحديث الحالة إلى `5`.

---

## المرحلة 5: الربط بين الفرونت إند والباك إند
**MODEL:** `openai`  
**المطلوب:**
- في `frontend/src/api/`، إنشاء `apiClient.ts` يستخدم `axios` للتواصل مع الباك إند.
- في صفحة الدرس، جلب البيانات الفعلية من `/api/lessons/{id}` وعرضها.
- عمل `commit` وتحديث الحالة إلى `6`.

---

## المرحلة 6: الذكاء الاصطناعي (القصة والتحليل)
**MODEL:** `gemini`  
**المطلوب:**
- في `backend/ai_service.py`:
  - دالة `generate_story(topic)` تستخدم Gemini API لتوليد قصة تفاعلية.
  - دالة `analyze_answers(answers)` لتوليد ملخص نقاط القوة والضعف.
- إضافة Endpoints: `/api/ai/story` و `/api/ai/analyze`.
- عمل `commit` وتحديث الحالة إلى `7`.

---

## المرحلة 7: التحدي اليومي والمكافآت
**MODEL:** `gemini`  
**المطلوب:**
- في الباك إند، إنشاء جدول `daily_challenges` (إن لم يكن موجوداً).
- Endpoint `/api/challenge/today` يُرجع تحدي اليوم.
- في الفرونت إند، عرض التحدي في الـ Dashboard وحلّه.
- عمل `commit` وتحديث الحالة إلى `8` (مكتمل).