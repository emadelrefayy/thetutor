# 🧱 خطة بناء مشروع "The Tutor" - نسخة مستوحاة من Midark

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
  `students`, `parents`, `subjects`, `lessons`, `progress`, `daily_challenges`.
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
- كتابة `requirements.txt` يحتوي على `fastapi`, `uvicorn`, `python-dotenv`, `supabase`, `google-generativeai`.
- عمل `commit` وتحديث الحالة إلى `4`.

---

## المرحلة 4: الفرونت إند (React + TypeScript + Tailwind) - مستوحى من Midark
**MODEL:** `gemini`  
**المطلوب:**
- إنشاء مشروع React بـ TypeScript في مجلد `frontend/`.
- تثبيت `tailwindcss`، `shadcn/ui`، `lucide-react` (للأيقونات)، و `framer-motion` (للحركات).
- **استخدام الأيقونة المنفصلة**:
  - استخدم ملف `logo.svg` (الموجود في `frontend/public/`) كأيقونة للمشروع.
  - ضع الأيقونة جنب اسم "The Tutor" في الشريط العلوي.
  - استخدم نفس الأيقونة كـ `favicon` في تبويب المتصفح.
- **تصميم مستوحى من موقع Midark**:
  - **الألوان**: تدرجات أزرق داكن وبنفسجي، مع لمسات ذهبية وبيضاء.
  - **الكروت**: بطاقات كبيرة مدورة، فيها أيقونة المادة، اسمها، وعدد الدروس، مع تأثير Hover بسيط.
  - **الخطوط**: استخدام خط `Inter` (من Google Fonts) مع دعم كامل للغة العربية (`Noto Sans Arabic`).
  - **الوضع المظلم/الفاتح**: إضافة Toggle في الشريط العلوي يغير الألوان كلها.
  - **ثنائية اللغة**: دعم RTL للعربية و LTR للإنجليزي، مع زر تبديل في الشريط العلوي.
  - **الهيكل العام**: شريط علوي ثابت (فيه الشعار، اسم المنصة، زر اللغة، وزر الوضع المظلم)، وشبكة بطاقات في المنتصف، وفوتر بسيط في الأسفل.
- عمل `commit` وتحديث الحالة إلى `5`.

---

## المرحلة 5: الربط بين الفرونت إند والباك إند
**MODEL:** `openai`  
**المطلوب:**
- في `frontend/src/api/`، إنشاء `apiClient.ts` يستخدم `axios` للتواصل مع الباك إند.
- في صفحة الدرس، جلب البيانات الفعلية من `/api/lessons/{id}` وعرضها في تصميم Midark.
- عمل `commit` وتحديث الحالة إلى `6`.

---

## المرحلة 6: الذكاء الاصطناعي (القصة والتحليل والمساعد)
**MODEL:** `gemini`  
**المطلوب:**
- في `backend/ai_service.py`:
  - دالة `generate_story(topic)` تستخدم Gemini API لتوليد قصة تفاعلية.
  - دالة `analyze_answers(answers)` لتوليد ملخص نقاط القوة والضعف.
  - دالة `chat_with_tutor(question)` للرد على أسئلة الطلاب في شات الذكاء الاصطناعي.
- إضافة Endpoints:
  - `/api/ai/story` (توليد القصة).
  - `/api/ai/analyze` (تحليل الإجابات).
  - `/api/ai/chat` (شات الـ AI Tutor).
- عمل `commit` وتحديث الحالة إلى `7`.

---

## المرحلة 7: التحدي اليومي والمكافآت
**MODEL:** `gemini`  
**المطلوب:**
- في الباك إند، إنشاء جدول `daily_challenges` (إن لم يكن موجوداً).
- Endpoint `/api/challenge/today` يُرجع تحدي اليوم.
- في الفرونت إند، عرض التحدي في الـ Dashboard وحلّه.
- عمل `commit` وتحديث الحالة إلى `8` (مكتمل).