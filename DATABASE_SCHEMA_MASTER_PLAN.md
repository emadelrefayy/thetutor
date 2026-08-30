# 🗄️ المخطط الكامل (Blueprint) - قاعدة بيانات نظام LMS

> **الغرض من هذا الملف:** توثيق كامل لهيكل قاعدة البيانات (PostgreSQL) المستخدمة في منصة التعلم. يشرح هذا الملف جميع الجداول، الأعمدة، أنواع البيانات، القيود (Primary/Foreign Keys)، والعلاقات بين الجداول. هذا هو المرجع الأساسي لأي مطور أو وكيل ذكاء اصطناعي للتعامل مع قاعدة البيانات.

---

## 📌 وسوم إيضاح القيود (Legend)
- **PK**: المفتاح الأساسي (Primary Key)
- **FK**: المفتاح الأجنبي (Foreign Key) - يشير إلى جدول آخر
- **NN**: لا يقبل القيم الفارغة (NOT NULL)
- **UQ**: قيمة فريدة (Unique)

----

## 🏗️ 1. النواة والهوية (Core & Identity)

### 📄 `tenants` (المستأجرون/المدارس)
يمثل كيان المستأجر (مدرسة أو منصة فرعية). كل البيانات الأخرى مرتبطة به ضمناً عبر الـ `profiles`.

| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | المعرف الفريد للمستأجر |
| `name` | `text` | **NN** | اسم المدرسة/المستأجر |
| `subdomain` | `text` | **NN, UQ** | النطاق الفرعي (subdomain) الفريد |
| `plan` | `text` | `default: 'basic'` | الباقة المشترك فيها |
| `is_active` | `boolean` | `default: true` | حالة النشاط |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

### 📄 `profiles` (الملفات الشخصية للمستخدمين)
يمثل جميع أنواع المستخدمين (طالب، ولي أمر، معلم، أدمن).

| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | المعرف الفريد (مرتبط بـ `auth.users` عادة) |
| `name` | `text` | **NN** | الاسم الكامل |
| `role` | `text` | **NN, CHECK** | الدور: `student`, `parent`, `teacher`, `admin`, `super_admin` |
| `grade_id` | `integer` | **FK** → `grades(id)` | الصف الدراسي (إن وجد) |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |
| `invitation_code` | `text` | **UQ** | كود الدعوة الفريد |
| `is_code_used` | `boolean` | `default: false` | هل تم استخدام الكود؟ |

**العلاقات:**
- كل `profile` قد يكون له صف دراسي واحد (`grades`).
- كل `profile` يمكن أن يكون `student_profiles` (طالب) أو `parent_students` (ولي أمر).

---

### 📄 `student_profiles` (الملف التعليمي للطالب)
تفاصيل إضافية خاصة بالطالب فقط.

| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `profile_id` | `uuid` | **PK, FK** → `profiles(id)` | معرف ملف الطالب (1:1) |
| `grade_id` | `bigint` | **FK** → `grades(id)` | الصف الدراسي الحالي |
| `display_name` | `text` | - | الاسم المعروض (يمكن تغييره) |
| `date_of_birth` | `date` | - | تاريخ الميلاد |
| `avatar_url` | `text` | - | رابط الصورة الشخصية |
| `xp` | `bigint` | `default: 0, CHECK >=0` | نقاط الخبرة الكلية |
| `level` | `integer` | `default: 1, CHECK >=1` | المستوى الحالي |
| `is_active` | `boolean` | `default: true` | هل الحساب نشط؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |
| `updated_at` | `timestamptz` | `default: now()` | تاريخ آخر تحديث |

---

### 📄 `parent_students` (ربط ولي الأمر بالطالب)
جدول وسيط (Many-to-Many) بين ولي الأمر والطلاب.

| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `parent_profile_id` | `uuid` | **PK, FK** → `profiles(id)` | معرف ولي الأمر |
| `student_profile_id` | `uuid` | **PK, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `relationship` | `text` | `default: 'parent'` | نوع العلاقة |
| `is_primary` | `boolean` | `default: false` | ولي الأمر الأساسي؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الربط |

---

### 📄 `parent_invitations` (دعوات أولياء الأمور)
دعوات لإضافة ولي أمر لطالب.

| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الدعوة |
| `student_profile_id` | `uuid` | **FK** → `student_profiles(profile_id)` | الطالب المدعو له |
| `code` | `text` | **NN, UQ** | كود الدعوة الفريد |
| `created_by` | `uuid` | **FK** → `profiles(id)` | من أنشأ الدعوة |
| `expires_at` | `timestamptz` | - | تاريخ انتهاء الصلاحية |
| `used_at` | `timestamptz` | - | تاريخ الاستخدام |
| `used_by` | `uuid` | **FK** → `profiles(id)` | من استخدم الدعوة |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

## 📚 2. الهيكل الأكاديمي (Curriculum Structure)

### 📄 `grades` (الصفوف الدراسية)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | **PK** | معرف الصف |
| `title` | `text` | **NN** | اسم الصف (مثال: الصف الأول) |
| `level_code` | `integer` | `default: 1` | كود المستوى (ترتيبي) |
| `code` | `text` | **NN, UQ** | كود مختصر فريد |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `subjects` (المواد الدراسية)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | **PK** | معرف المادة |
| `term_id` | `bigint` | **FK** → `terms(id)` | الفصل الدراسي التابعة له |
| `title` | `text` | **NN** | اسم المادة (رياضيات، علوم) |
| `code` | `text` | **NN** | كود المادة |
| `icon_name` | `text` | `default: '📚'` | أيقونة المادة |
| `color_theme` | `text` | `default: 'blue'` | لون المادة المميز |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `units` (الوحدات الدراسية)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | **PK**, `GENERATED ALWAYS AS IDENTITY` | معرف الوحدة |
| `subject_id` | `bigint` | **NN, FK** → `subjects(id)` | المادة التابعة لها |
| `unit_number` | `integer` | **NN** | رقم الوحدة (1، 2، 3) |
| `title` | `text` | **NN** | عنوان الوحدة |
| `description` | `text` | - | وصف الوحدة |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |

---

### 📄 `lessons` (الدروس)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | **PK** | معرف الدرس |
| `subject_id` | `bigint` | **FK** → `subjects(id)` | المادة التابعة لها |
| `unit_id` | `bigint` | **FK** → `units(id)` | الوحدة التابعة لها |
| `title` | `text` | **NN** | عنوان الدرس |
| `unit_number` | `integer` | `default: 1` | رقم الوحدة (تكرار للسرعة) |
| `lesson_number` | `integer` | `default: 1` | رقم الدرس داخل الوحدة |
| `content_summary` | `text` | `default: ''` | ملخص محتوى الدرس |
| `video_url` | `text` | `default: ''` | رابط الفيديو الرئيسي |
| `infographic_url` | `text` | `default: ''` | رابط الإنفوجرافيك |
| `game_url` | `text` | `default: ''` | رابط اللعبة |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

**العلاقات:**
- كل `lesson` ينتمي لـ `subject` واحد.
- كل `lesson` ينتمي لـ `unit` واحد (اختياري).

---

### 📄 `concepts` (المفاهيم التعليمية)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | **PK**, `GENERATED ALWAYS AS IDENTITY` | معرف المفهوم |
| `subject_id` | `bigint` | **FK** → `subjects(id)` | المادة التابعة لها |
| `name` | `text` | **NN** | اسم المفهوم (مثال: "الكسور المتكافئة") |
| `description` | `text` | - | وصف المفهوم |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |

---

### 📄 `lesson_concepts` (ربط الدروس بالمفاهيم)
جدول وسيط (Many-to-Many) بين الدروس والمفاهيم.

| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `lesson_id` | `bigint` | **PK, FK** → `lessons(id)` | معرف الدرس |
| `concept_id` | `bigint` | **PK, FK** → `concepts(id)` | معرف المفهوم |
| `is_primary` | `boolean` | `default: false` | هل هو المفهوم الأساسي للدرس؟ |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الربط |

---

### 📄 `courses` (الكورسات/المناهج)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الكورس |
| `title` | `varchar` | **NN** | عنوان الكورس |
| `subject_code` | `varchar` | **NN** | كود المادة |
| `grade_level` | `varchar` | `default: 'Grade 1'` | المستوى الدراسي |
| `term` | `varchar` | `default: 'Term 1'` | الفصل الدراسي |
| `description` | `text` | - | وصف الكورس |
| `icon` | `varchar` | - | أيقونة الكورس |
| `is_experimental` | `boolean` | `default: true` | هل هو تجريبي؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `course_modules` (وحدات الكورس)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الوحدة |
| `course_id` | `uuid` | **NN, FK** → `courses(id)` | الكورس التابع له |
| `title` | `text` | **NN** | عنوان الوحدة |
| `description` | `text` | - | وصف الوحدة |
| `sort_order` | `integer` | `default: 0` | ترتيب الوحدة |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `course_lessons` (دروس الكورس)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف درس الكورس |
| `module_id` | `uuid` | **NN, FK** → `course_modules(id)` | الوحدة التابعة لها |
| `title` | `text` | **NN** | عنوان الدرس |
| `description` | `text` | - | وصف الدرس |
| `content` | `jsonb` | `default: '{}'` | محتوى الدرس (مرن) |
| `sort_order` | `integer` | `default: 0` | ترتيب الدرس |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `curriculum_sources` (مصادر المنهج)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف المصدر |
| `name` | `text` | **NN** | اسم المصدر (وزارة، منصة) |
| `source_type` | `text` | **NN, CHECK** | `official`, `licensed`, `teacher_created`, `ai_generated`, `other` |
| `publisher` | `text` | - | الناشر |
| `source_url` | `text` | - | رابط المصدر |
| `edition` | `text` | - | الإصدار |
| `academic_year` | `text` | - | العام الدراسي |
| `language` | `text` | `default: 'ar'` | اللغة |
| `rights_notes` | `text` | - | ملاحظات الحقوق |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `lesson_source_refs` (ربط الدروس بالمصادر)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `lesson_id` | `bigint` | **PK, FK** → `lessons(id)` | معرف الدرس |
| `source_id` | `uuid` | **PK, FK** → `curriculum_sources(id)` | معرف المصدر |
| `locator` | `text` | - | موقع المرجع (صفحة، جزء) |
| `notes` | `text` | - | ملاحظات إضافية |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الربط |

---

## 📝 3. المحتوى والأصول (Content & Assets)

### 📄 `learning_objectives` (الأهداف التعليمية)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | **PK**, `GENERATED ALWAYS AS IDENTITY` | معرف الهدف |
| `lesson_id` | `bigint` | **NN, FK** → `lessons(id)` | الدرس التابع له |
| `objective_code` | `text` | - | كود الهدف (مثل: LO.1.1) |
| `statement` | `text` | **NN** | نص الهدف |
| `cognitive_level` | `text` | - | المستوى المعرفي (تذكر، فهم، تطبيق) |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |

---

### 📄 `lesson_vocabulary` (المفردات اللغوية للدرس)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | **PK**, `GENERATED ALWAYS AS IDENTITY` | معرف المفردة |
| `lesson_id` | `bigint` | **NN, FK** → `lessons(id)` | الدرس التابع له |
| `term` | `text` | **NN** | المصطلح |
| `definition` | `text` | - | التعريف |
| `pronunciation` | `text` | - | طريقة النطق |
| `example` | `text` | - | مثال توضيحي |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |

---

### 📄 `lesson_assets` (أصول الدرس)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الأصل |
| `lesson_id` | `bigint` | **NN, FK** → `lessons(id)` | الدرس التابع له |
| `asset_type` | `text` | **NN, CHECK** | `image`, `infographic`, `video`, `audio`, `document`, `game`, `external` |
| `title` | `text` | - | عنوان الأصل |
| `url` | `text` | **NN** | رابط الأصل |
| `storage_path` | `text` | - | مسار التخزين الداخلي |
| `alt_text` | `text` | - | نص بديل (للوصولية) |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية (حجم، طول) |
| `sort_order` | `integer` | `default: 0` | ترتيب العرض |
| `is_published` | `boolean` | `default: false` | هل منشور؟ |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |

---

### 📄 `lesson_content_blocks` (كتل المحتوى التفاعلي)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الكتلة |
| `lesson_id` | `bigint` | **NN, FK** → `lessons(id)` | الدرس التابع له |
| `block_type` | `text` | **NN, CHECK** | `text`, `heading`, `image`, `infographic`, `video`, `audio`, `example`, `tip`, `warning`, `vocabulary`, `activity`, `quiz`, `game`, `embed` |
| `content` | `jsonb` | `default: '{}'` | محتوى الكتلة (نص، بيانات) |
| `asset_id` | `uuid` | **FK** → `lesson_assets(id)` | الأصل المرتبط (إن وجد) |
| `sort_order` | `integer` | `default: 0` | ترتيب الكتلة |
| `is_published` | `boolean` | `default: false` | هل منشور؟ |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |

---

## ❓ 4. بنك الأسئلة (Question Bank)

### 📄 `questions` (الأسئلة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف السؤال |
| `question_type` | `text` | **NN, CHECK** | `multiple_choice`, `true_false`, `matching`, `ordering`, `fill_blank`, `short_answer`, `image_choice`, `drag_drop` |
| `difficulty` | `text` | `default: 'medium', CHECK` | `easy`, `medium`, `hard` |
| `prompt` | `text` | **NN** | نص السؤال |
| `explanation` | `text` | - | شرح الإجابة |
| `correct_answer` | `jsonb` | `default: '{}'` | الإجابة الصحيحة (مرن حسب النوع) |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية |
| `skill_type` | `text` | - | نوع المهارة |
| `generation_source` | `text` | - | مصدر التوليد (يدوي/ذكاء) |
| `source` | `text` | `default: 'manual', CHECK` | `manual`, `ai`, `imported` |
| `status` | `text` | `default: 'draft', CHECK` | `draft`, `review`, `approved`, `published`, `archived` |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |
| `updated_at` | `timestamptz` | **NN**, `default: now()` | تاريخ آخر تحديث |

---

### 📄 `question_options` (خيارات الأسئلة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الخيار |
| `question_id` | `uuid` | **NN, FK** → `questions(id)` | السؤال التابع له |
| `option_key` | `text` | **NN** | مفتاح الخيار (A, B, C) |
| `option_text` | `text` | **NN** | نص الخيار |
| `is_correct` | `boolean` | `default: false` | هل هو صحيح؟ |
| `sort_order` | `integer` | `default: 0` | ترتيب الخيار |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية (مثل رابط الصورة) |

---

### 📄 `question_lessons` (ربط الأسئلة بالدروس)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `question_id` | `uuid` | **PK, FK** → `questions(id)` | معرف السؤال |
| `lesson_id` | `bigint` | **PK, FK** → `lessons(id)` | معرف الدرس |
| `relevance` | `numeric` | `default: 1.0` | درجة الصلة (0-1) |

---

### 📄 `question_concepts` (ربط الأسئلة بالمفاهيم)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `question_id` | `uuid` | **PK, FK** → `questions(id)` | معرف السؤال |
| `concept_id` | `bigint` | **PK, FK** → `concepts(id)` | معرف المفهوم |
| `relevance` | `numeric` | `default: 1.0` | درجة الصلة (0-1) |

---

## 🎮 5. الألعاب والتحديات (Gamification & Challenges)

### 📄 `game_templates` (قوالب الألعاب)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف القالب |
| `code` | `text` | **NN, UQ** | كود القالب الفريد |
| `name` | `text` | **NN** | اسم اللعبة |
| `description` | `text` | - | وصف اللعبة |
| `game_type` | `text` | **NN** | نوع اللعبة |
| `supported_question_types` | `ARRAY` | `default: ['multiple_choice']` | أنواع الأسئلة المدعومة |
| `configuration` | `jsonb` | `default: '{}'` | إعدادات القالب |
| `frontend_url` | `text` | - | رابط الواجهة الأمامية |
| `thumbnail_url` | `text` | - | صورة مصغرة |
| `is_active` | `boolean` | `default: true` | هل القالب نشط؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `game_definitions` (تعريفات الألعاب - حالات استخدام القالب)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف تعريف اللعبة |
| `template_id` | `uuid` | **NN, FK** → `game_templates(id)` | القالب المستخدم |
| `scope_type` | `text` | **NN, CHECK** | `lesson`, `unit`, `subject`, `course`, `challenge` |
| `lesson_id` | `bigint` | **FK** → `lessons(id)` | نطاق الدرس |
| `unit_id` | `bigint` | **FK** → `units(id)` | نطاق الوحدة |
| `subject_id` | `bigint` | **FK** → `subjects(id)` | نطاق المادة |
| `course_id` | `uuid` | **FK** → `courses(id)` | نطاق الكورس |
| `challenge_id` | `uuid` | **FK** → `challenges(id)` | نطاق التحدي |
| `title` | `text` | **NN** | عنوان اللعبة |
| `settings` | `jsonb` | `default: '{}'` | إعدادات خاصة |
| `is_active` | `boolean` | `default: true` | هل اللعبة نشطة؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `game_definition_questions` (ربط الأسئلة بتعريف اللعبة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `game_definition_id` | `uuid` | **PK, FK** → `game_definitions(id)` | معرف تعريف اللعبة |
| `question_id` | `uuid` | **PK, FK** → `questions(id)` | معرف السؤال |
| `sort_order` | `integer` | `default: 0` | ترتيب السؤال |
| `points` | `integer` | `default: 10, CHECK >=0` | النقاط المخصصة للسؤال |

---

### 📄 `game_sessions` (جلسات اللعب)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الجلسة |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | الطالب اللاعب |
| `game_definition_id` | `uuid` | **NN, FK** → `game_definitions(id)` | تعريف اللعبة |
| `started_at` | `timestamptz` | **NN**, `default: now()` | وقت البدء |
| `completed_at` | `timestamptz` | - | وقت الانتهاء |
| `status` | `text` | `default: 'started', CHECK` | `started`, `completed`, `abandoned` |
| `score` | `integer` | `default: 0, CHECK >=0` | النقاط المحققة |
| `max_score` | `integer` | `default: 0, CHECK >=0` | أقصى نقاط ممكنة |
| `accuracy` | `numeric` | - | نسبة الدقة |
| `xp_earned` | `integer` | `default: 0, CHECK >=0` | نقاط الخبرة المكتسبة |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية |

---

### 📄 `game_session_questions` (أسئلة الجلسة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف السؤال في الجلسة |
| `session_id` | `uuid` | **NN, FK** → `game_sessions(id)` | الجلسة التابعة لها |
| `question_id` | `uuid` | **NN, FK** → `questions(id)` | السؤال الأصلي |
| `sequence_no` | `integer` | **NN** | رقم تسلسل السؤال |
| `points_possible` | `integer` | `default: 10, CHECK >=0` | النقاط الممكنة لهذا السؤال |

---

### 📄 `question_attempts` (محاولات الإجابة على الأسئلة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف المحاولة |
| `session_question_id` | `uuid` | **NN, FK** → `game_session_questions(id)` | سؤال الجلسة المرتبط |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | الطالب المجيب |
| `answer` | `jsonb` | `default: '{}'` | إجابة الطالب |
| `is_correct` | `boolean` | **NN** | هل الإجابة صحيحة؟ |
| `points_awarded` | `integer` | `default: 0` | النقاط المكتسبة |
| `response_time_ms` | `integer` | - | زمن الاستجابة (مللي) |
| `answered_at` | `timestamptz` | **NN**, `default: now()` | وقت الإجابة |
| `feedback` | `jsonb` | `default: '{}'` | ملاحظات/تغذية راجعة |

---

### 📄 `challenges` (التحديات/المسابقات)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف التحدي |
| `title` | `text` | **NN** | عنوان التحدي |
| `description` | `text` | - | وصف التحدي |
| `grade_id` | `bigint` | **FK** → `grades(id)` | الصف المستهدف |
| `starts_at` | `timestamptz` | **NN** | وقت البدء |
| `ends_at` | `timestamptz` | **NN** | وقت الانتهاء |
| `status` | `text` | `default: 'scheduled', CHECK` | `draft`, `scheduled`, `live`, `finished`, `cancelled` |
| `settings` | `jsonb` | `default: '{}'` | إعدادات التحدي |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `challenge_questions` (أسئلة التحدي)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `challenge_id` | `uuid` | **PK, FK** → `challenges(id)` | معرف التحدي |
| `question_id` | `uuid` | **PK, FK** → `questions(id)` | معرف السؤال |
| `sort_order` | `integer` | `default: 0` | ترتيب السؤال |
| `points` | `integer` | `default: 10, CHECK >=0` | النقاط المخصصة |

---

### 📄 `challenge_participants` (مشاركي التحدي)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `challenge_id` | `uuid` | **PK, FK** → `challenges(id)` | معرف التحدي |
| `student_profile_id` | `uuid` | **PK, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `joined_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الانضمام |
| `finished_at` | `timestamptz` | - | تاريخ الانتهاء |
| `score` | `integer` | `default: 0` | النقاط المحققة |
| `rank` | `integer` | - | الترتيب النهائي |

---

### 📄 `challenge_attempts` (محاولات التحدي)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف المحاولة |
| `challenge_id` | `uuid` | **NN, FK** → `challenges(id)` | التحدي المرتبط |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | الطالب المجيب |
| `question_id` | `uuid` | **NN, FK** → `questions(id)` | السؤال المجاب عليه |
| `answer` | `jsonb` | `default: '{}'` | الإجابة |
| `is_correct` | `boolean` | **NN** | صحيح؟ |
| `points_awarded` | `integer` | `default: 0` | النقاط المكتسبة |
| `response_time_ms` | `integer` | - | زمن الاستجابة |
| `answered_at` | `timestamptz` | **NN**, `default: now()` | وقت الإجابة |

---

### 📄 `achievements` (الإنجازات)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الإنجاز |
| `code` | `text` | **NN, UQ** | كود الإنجاز الفريد |
| `name` | `text` | **NN** | اسم الإنجاز |
| `description` | `text` | - | وصف الإنجاز |
| `icon_url` | `text` | - | رابط الأيقونة |
| `criteria` | `jsonb` | `default: '{}'` | شروط الحصول عليه |
| `xp_reward` | `integer` | `default: 0, CHECK >=0` | مكافأة النقاط |
| `is_active` | `boolean` | `default: true` | هل الإنجاز متاح؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `student_achievements` (إنجازات الطلاب)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `student_profile_id` | `uuid` | **PK, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `achievement_id` | `uuid` | **PK, FK** → `achievements(id)` | معرف الإنجاز |
| `earned_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الحصول عليه |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية |

---

### 📄 `student_streaks` (التكرار اليومي)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `student_profile_id` | `uuid` | **PK, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `current_streak` | `integer` | `default: 0, CHECK >=0` | التكرار الحالي (أيام متتالية) |
| `longest_streak` | `integer` | `default: 0, CHECK >=0` | أطول تكرار تم تحقيقه |
| `last_activity_date` | `date` | - | تاريخ آخر نشاط |
| `updated_at` | `timestamptz` | **NN**, `default: now()` | تاريخ آخر تحديث |

---

### 📄 `xp_transactions` (معاملات نقاط الخبرة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف المعاملة |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `amount` | `integer` | **NN** | قيمة النقاط (موجب/سالب) |
| `reason` | `text` | **NN** | سبب المعاملة |
| `source_type` | `text` | - | مصدر النقاط (مثلاً: 'lesson', 'game') |
| `source_id` | `uuid` | - | معرف المصدر |
| `created_at` | `timestamptz` | `default: now()` | تاريخ المعاملة |

---

## 📈 6. التقدم والتحليلات (Progress & Analytics)

### 📄 `lesson_progress` (تقدم الطالب في الدروس)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف السجل |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `lesson_id` | `bigint` | **NN, FK** → `lessons(id)` | معرف الدرس |
| `status` | `text` | `default: 'not_started', CHECK` | `not_started`, `in_progress`, `completed` |
| `completion_percent` | `numeric` | `default: 0, CHECK 0-100` | نسبة الإنجاز |
| `first_started_at` | `timestamptz` | - | تاريخ أول بداية |
| `completed_at` | `timestamptz` | - | تاريخ الإكمال |
| `last_accessed_at` | `timestamptz` | - | تاريخ آخر وصول |
| `time_spent_seconds` | `integer` | `default: 0, CHECK >=0` | إجمالي الوقت المستغرق |
| `updated_at` | `timestamptz` | **NN**, `default: now()` | تاريخ آخر تحديث |

---

### 📄 `learning_events` (أحداث التعلم)
سجل للأحداث التفاعلية (مشاهدة فيديو، حل سؤال).
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الحدث |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `event_type` | `text` | **NN** | نوع الحدث |
| `lesson_id` | `bigint` | **FK** → `lessons(id)` | الدرس المرتبط |
| `concept_id` | `bigint` | **FK** → `concepts(id)` | المفهوم المرتبط |
| `metadata` | `jsonb` | `default: '{}'` | بيانات الحدث |
| `occurred_at` | `timestamptz` | **NN**, `default: now()` | وقت الحدوث |

---

### 📄 `concept_mastery` (إتقان المفاهيم)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `student_profile_id` | `uuid` | **PK, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `concept_id` | `bigint` | **PK, FK** → `concepts(id)` | معرف المفهوم |
| `mastery_score` | `numeric` | `default: 0, CHECK 0-100` | درجة الإتقان |
| `attempts_count` | `integer` | `default: 0` | عدد المحاولات |
| `correct_count` | `integer` | `default: 0` | عدد الإجابات الصحيحة |
| `last_attempt_at` | `timestamptz` | - | تاريخ آخر محاولة |
| `updated_at` | `timestamptz` | **NN**, `default: now()` | تاريخ آخر تحديث |

---

### 📄 `learning_recommendations` (توصيات التعلم)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف التوصية |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `recommendation_type` | `text` | **NN, CHECK** | `lesson`, `concept`, `practice`, `vocabulary`, `game`, `course` |
| `lesson_id` | `bigint` | **FK** → `lessons(id)` | الدرس الموصى به |
| `concept_id` | `bigint` | **FK** → `concepts(id)` | المفهوم الموصى به |
| `game_definition_id` | `uuid` | **FK** → `game_definitions(id)` | اللعبة الموصى بها |
| `title` | `text` | **NN** | عنوان التوصية |
| `reason` | `text` | - | سبب التوصية |
| `priority` | `numeric` | `default: 0` | أولوية التوصية |
| `generated_by` | `text` | `default: 'analytics'` | مصدر التوليد |
| `is_dismissed` | `boolean` | `default: false` | هل تم تجاهلها؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |
| `expires_at` | `timestamptz` | - | تاريخ الانتهاء |

---

### 📄 `student_subject_metrics` (إحصائيات الطالب لكل مادة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `student_profile_id` | `uuid` | **PK, FK** → `student_profiles(profile_id)` | معرف الطالب |
| `subject_id` | `bigint` | **PK, FK** → `subjects(id)` | معرف المادة |
| `lessons_total` | `integer` | `default: 0` | إجمالي الدروس في المادة |
| `lessons_completed` | `integer` | `default: 0` | الدروس المكتملة |
| `questions_answered` | `integer` | `default: 0` | الأسئلة المجاب عنها |
| `questions_correct` | `integer` | `default: 0` | الأسئلة الصحيحة |
| `accuracy` | `numeric` | `default: 0, CHECK 0-100` | نسبة الدقة |
| `mastery_score` | `numeric` | `default: 0, CHECK 0-100` | درجة الإتقان العامة |
| `xp_earned` | `bigint` | `default: 0` | نقاط الخبرة في هذه المادة |
| `last_activity_at` | `timestamptz` | - | تاريخ آخر نشاط |
| `updated_at` | `timestamptz` | **NN**, `default: now()` | تاريخ آخر تحديث |

---

## 👥 7. التواصل الاجتماعي (Social & Messaging)

### 📄 `friendships` (الصداقات)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الصداقة |
| `requester_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | من أرسل الطلب |
| `addressee_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | المُرسَل إليه |
| `status` | `text` | `default: 'pending', CHECK` | `pending`, `accepted`, `blocked`, `declined` |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |
| `updated_at` | `timestamptz` | **NN**, `default: now()` | تاريخ آخر تحديث |

---

### 📄 `conversations` (المحادثات)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف المحادثة |
| `conversation_type` | `text` | `default: 'direct', CHECK` | `direct`, `group`, `challenge` |
| `title` | `text` | - | عنوان المحادثة (للمجموعات) |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `conversation_members` (أعضاء المحادثة)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `conversation_id` | `uuid` | **PK, FK** → `conversations(id)` | معرف المحادثة |
| `student_profile_id` | `uuid` | **PK, FK** → `student_profiles(profile_id)` | معرف العضو |
| `joined_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الانضمام |

---

### 📄 `messages` (الرسائل)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الرسالة |
| `conversation_id` | `uuid` | **NN, FK** → `conversations(id)` | المحادثة التابعة لها |
| `sender_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | المرسل |
| `body` | `text` | **NN, CHECK (length <= 4000)** | نص الرسالة |
| `message_type` | `text` | `default: 'text', CHECK` | `text`, `result_share`, `system` |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية |
| `created_at` | `timestamptz` | `default: now()` | وقت الإرسال |

---

## 🤖 8. توليد المحتوى بالذكاء الاصطناعي (AI Content Generation)

### 📄 `content_generation_jobs` (مهام توليد المحتوى)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف المهمة |
| `lesson_id` | `bigint` | **FK** → `lessons(id)` | الدرس المستهدف |
| `job_type` | `text` | **NN, CHECK** | `lesson_content`, `questions`, `explanations`, `vocabulary`, `concepts`, `objectives`, `infographic_brief`, `infographic_image`, `full_lesson` |
| `status` | `text` | `default: 'queued', CHECK` | `queued`, `running`, `review`, `approved`, `published`, `failed`, `cancelled` |
| `model_provider` | `text` | - | مزود النموذج (OpenAI, Gemini) |
| `model_name` | `text` | - | اسم النموذج |
| `prompt_version` | `text` | - | نسخة البرومبت |
| `input_payload` | `jsonb` | `default: '{}'` | البيانات المُدخلة |
| `output_payload` | `jsonb` | `default: '{}'` | البيانات المُخرجة |
| `validation_errors` | `jsonb` | `default: '[]'` | أخطاء التحقق |
| `validation_report` | `jsonb` | - | تقرير التحقق |
| `entity_type` | `text` | - | نوع الكيان المرتبط |
| `entity_id` | `bigint` | - | معرف الكيان المرتبط |
| `input_snapshot` | `jsonb` | - | لقطة من المدخلات وقت التشغيل |
| `created_by` | `uuid` | **FK** → `profiles(id)` | من أنشأ المهمة |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |
| `started_at` | `timestamptz` | - | تاريخ البدء |
| `completed_at` | `timestamptz` | - | تاريخ الانتهاء |

---

### 📄 `content_versions` (نسخ المحتوى)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف النسخة |
| `lesson_id` | `bigint` | **NN, FK** → `lessons(id)` | الدرس المرتبط |
| `version_number` | `integer` | **NN** | رقم النسخة |
| `content` | `jsonb` | `default: '{}'` | محتوى النسخة |
| `source_type` | `text` | `default: 'ai', CHECK` | `manual`, `ai`, `imported` |
| `generation_job_id` | `uuid` | **FK** → `content_generation_jobs(id)` | المهمة التي أنتجتها |
| `status` | `text` | `default: 'draft', CHECK` | `draft`, `review`, `approved`, `published`, `archived` |
| `created_at` | `timestamptz` | **NN**, `default: now()` | تاريخ الإنشاء |

---

## 💳 9. الفوترة والاشتراكات (Billing)

### 📄 `plans` (الباقات)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الباقة |
| `code` | `text` | **NN, UQ** | كود الباقة الفريد |
| `name` | `text` | **NN** | اسم الباقة |
| `description` | `text` | - | وصف الباقة |
| `price` | `numeric` | `default: 0, CHECK >=0` | السعر |
| `currency` | `text` | `default: 'EGP'` | العملة |
| `billing_interval` | `text` | `default: 'monthly', CHECK` | `monthly`, `quarterly`, `yearly`, `one_time` |
| `features` | `jsonb` | `default: '{}'` | مميزات الباقة |
| `is_active` | `boolean` | `default: true` | هل الباقة متاحة؟ |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

### 📄 `subscriptions` (اشتراكات الطلاب)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف الاشتراك |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | الطالب المشترك |
| `plan_id` | `uuid` | **NN, FK** → `plans(id)` | الباقة المشترك فيها |
| `status` | `text` | `default: 'active', CHECK` | `trialing`, `active`, `past_due`, `paused`, `cancelled`, `expired` |
| `starts_at` | `timestamptz` | **NN**, `default: now()` | تاريخ البدء |
| `ends_at` | `timestamptz` | - | تاريخ الانتهاء |
| `provider` | `text` | - | مزود الدفع (Stripe, etc.) |
| `external_reference` | `text` | - | المرجع الخارجي |
| `metadata` | `jsonb` | `default: '{}'` | بيانات إضافية |
| `created_at` | `timestamptz` | `default: now()` | تاريخ الإنشاء |

---

## 🔗 10. علاقات الكورسات (Course Enrollments)

### 📄 `course_enrollments` (تسجيل الطلاب في الكورسات)
| العمود | النوع | القيد | الوصف |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK**, `default: gen_random_uuid()` | معرف التسجيل |
| `course_id` | `uuid` | **NN, FK** → `courses(id)` | الكورس المسجل فيه |
| `student_profile_id` | `uuid` | **NN, FK** → `student_profiles(profile_id)` | الطالب المسجل |
| `status` | `text` | `default: 'active', CHECK` | `active`, `completed`, `cancelled` |
| `enrolled_at` | `timestamptz` | **NN**, `default: now()` | تاريخ التسجيل |
| `completed_at` | `timestamptz` | - | تاريخ الإكمال |

---

## 🏁 نهاية التوثيق
هذا المستند يغطي **جميع الجداول (53 جدولاً)** والعلاقات في قاعدة البيانات. تم تنظيمه ليسهل على المطورين ووكلاء الذكاء الاصطناعي فهم النموذج البياني (Data Model) بسرعة ودقة. يمكن استخدام هذا الملف كمرجع أساسي لإنشاء استعلامات SQL، أو تطوير واجهات برمجة التطبيقات (APIs)، أو ترحيل البيانات.