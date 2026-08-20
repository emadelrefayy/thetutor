-- 1. تفعيل الإضافات المطلوب
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول البروفايل للمستخدمين (طالب / ولي أمر / سوبر أدمن / معلم)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(20) CHECK (role IN ('student', 'parent', 'teacher', 'admin')) DEFAULT 'student',
    grade_level INT CHECK (grade_level BETWEEN 1 AND 6),
    avatar_url TEXT,
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_type VARCHAR(20) DEFAULT 'annual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. جدول المواد الدراسية (Subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(50),
    min_grade INT DEFAULT 1,
    max_grade INT DEFAULT 6
);

-- 4. جدول الدروس (Lessons)
CREATE TABLE IF NOT EXISTS public.lessons (
    id SERIAL PRIMARY KEY,
    subject_id INT REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade_level INT CHECK (grade_level BETWEEN 1 AND 6) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    youtube_url TEXT,
    term INT CHECK (term IN (1, 2)) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول أسئلة الألعاب (Game Questions)
CREATE TABLE IF NOT EXISTS public.game_questions (
    id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES public.lessons(id) ON DELETE CASCADE,
    subject_id INT REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade_level INT CHECK (grade_level BETWEEN 1 AND 6),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL,
    is_general_challenge BOOLEAN DEFAULT FALSE
);

-- 6. تفعيل سياسات الأمان RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- سياسة: الطالب يقرأ دروس صفه الدراسي فقط
CREATE POLICY "Student Grade Filter Policy" ON public.lessons
    FOR SELECT
    USING (
        grade_level = (
            SELECT grade_level FROM public.profiles WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- إدراج المواد الدراسية الـ 9 الأساسية
INSERT INTO public.subjects (name_ar, name_en, code, icon, color, min_grade, max_grade) VALUES
('اللغة العربية', 'Arabic', 'arabic', '📖', 'bg-amber-100 text-amber-800', 1, 6),
('الرياضيات', 'Math', 'math', '📐', 'bg-blue-100 text-blue-800', 1, 6),
('العلوم', 'Science', 'science', '🔬', 'bg-emerald-100 text-emerald-800', 1, 6),
('اللغة الإنجليزية', 'Connect', 'connect', '🇬🇧', 'bg-purple-100 text-purple-800', 1, 6),
('المستوى الرفيع', 'Connect Plus', 'connect_plus', '🌟', 'bg-indigo-100 text-indigo-800', 1, 6),
('تكنولوجيا المعلومات', 'ICT', 'ict', '💻', 'bg-cyan-100 text-cyan-800', 1, 6),
('الدراسات الاجتماعية', 'Social Studies', 'social_studies', '🌍', 'bg-orange-100 text-orange-800', 4, 6),
('المهارات المهنية', 'Professional Skills', 'pro_skills', '🛠️', 'bg-rose-100 text-rose-800', 4, 6),
('التربية الدينية', 'Religion', 'religion', '🕌', 'bg-teal-100 text-teal-800', 1, 6)
ON CONFLICT (code) DO NOTHING;
