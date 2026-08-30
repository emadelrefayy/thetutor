

# 🏗️ TheTutor - Architecture Reference

> **Purpose**: Complete technical reference for TheTutor platform. This document explains system design, data flows, business logic, API structure, security, and deployment strategy. For database schema details, refer to `DATABASE_BLUEPRINT.md`.

---

## 📌 Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Layer Responsibilities](#4-layer-responsibilities)
5. [Core Business Logic](#5-core-business-logic)
6. [API Layer Structure](#6-api-layer-structure)
7. [Data Flow Examples](#7-data-flow-examples)
8. [Security & Authorization](#8-security--authorization)
9. [AI Content Pipeline](#9-ai-content-pipeline)
10. [Parent Dashboard Flow](#10-parent-dashboard-flow)
11. [Game Engine Flow](#11-game-engine-flow)
12. [Social & Realtime](#12-social--realtime)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Development Guidelines](#14-development-guidelines)

---

## 1. System Overview

TheTutor is an **educational platform** for Egyptian language-school students (Grades 1–6). It delivers:

- **Structured curriculum** (Grades → Subjects → Units → Lessons)
- **Interactive content** (Text, infographics, videos, activities)
- **Smart question bank** (Multiple types, difficulty levels, linked to concepts)
- **Educational games** (Configurable templates with eligibility rules)
- **Progress tracking** (Lesson completion, concept mastery, XP, streaks)
- **Parent dashboard** (Mobile-first, simple insights, actionable tips)
- **Admin panel** (Curriculum management, monitoring, AI pipeline)
- **AI content generation** (Controlled pipeline with validation)
- **Social features** (Chat, friendships, challenge-based interaction)
- **Billing & subscriptions** (Plans, payments, external provider integration)

---

## 2. Technology Stack

### Backend (Application Layer)
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Language | Python 3.10+ | Core business logic |
| Framework | FastAPI 0.100+ | REST API, validation, async |
| Database Access | Supabase Python Client | DB operations |
| Validation | Pydantic 2.0+ | Request/response models |
| HTTP Client | httpx | External API calls |
| Analytics | pandas, numpy (optional) | Aggregations |

### Frontend (Presentation Layer)
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Language | TypeScript 5.0+ | Type-safe code |
| Framework | React 18.0+ | UI rendering |
| Build Tool | Vite 4.0+ | Dev server & builds |
| Styling | Tailwind CSS 3.0+ | Responsive UI |
| Routing | React Router 6.0+ | Navigation |
| API Client | Axios 1.0+ | HTTP requests |
| Supabase Client | @supabase/supabase-js | Auth, Realtime |

### Data Layer
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Cloud Platform | Supabase | Auth, PostgreSQL, Storage, Realtime |
| Database | PostgreSQL 15+ | Relational data |
| Auth | Supabase Auth | JWT authentication |
| Storage | Supabase Storage | File uploads |
| Realtime | Supabase Realtime | WebSocket live updates |
| Security | RLS Policies | Data-level authorization |

---

## 3. Architecture Diagram

```

┌─────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Frontend)                   │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │   Student   │  │   Parent    │  │    Admin    │  │   Game   │ │
│  │   UI Pages  │  │   UI Pages  │  │   UI Pages  │  │   UI     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │         React + TypeScript + Vite + Tailwind CSS              │ │
│  │  - React Router (Navigation)                                  │ │
│  │  - Axios (API Client)                                         │ │
│  │  - Supabase Client (Auth, Realtime)                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              │ HTTPS / REST (JSON)                 │
│                              ▼                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Backend)                     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                      FastAPI (Python)                         │ │
│  │                                                               │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────────────┐│ │
│  │  │  Auth     │  │  Lessons  │  │  Game Engine              ││ │
│  │  │  Routes   │  │  Routes   │  │  - Eligibility Check      ││ │
│  │  │  - Login  │  │  - Get    │  │  - Session Creation      ││ │
│  │  │  - Verify │  │  - Content│  │  - Score Calculation     ││ │
│  │  │  - Refresh│  │  - Progress│  │  - XP Distribution       ││ │
│  │  └───────────┘  └───────────┘  └───────────────────────────┘│ │
│  │                                                               │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────────────┐│ │
│  │  │ Analytics │  │  AI       │  │  Parent Dashboard         ││ │
│  │  │ Routes    │  │  Pipeline │  │  - Weekly Summary         ││ │
│  │  │ - Mastery │  │  - Generate│  │  - Insights              ││ │
│  │  │ - Progress│  │  - Validate│  │  - Recommendations       ││ │
│  │  │ - Trends  │  │  - Publish │  └───────────────────────────┘│ │
│  │  └───────────┘  └───────────┘                                 │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │            Pydantic Models (Validation)                 │ │ │
│  │  │  StudentSchema, LessonSchema, GameSessionSchema, etc.  │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              │ Supabase Client / SQL               │
│                              ▼                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER (Supabase)                        │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL 15+ Database                     │ │
│  │  - 53 tables across 9 domains (see DATABASE_BLUEPRINT.md)    │ │
│  │  - RLS Policies for data security                            │ │
│  │  - Foreign keys for relationships                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────────────┐│
│  │ Supabase   │  │ Supabase   │  │ Supabase Realtime              ││
│  │ Auth (JWT) │  │ Storage    │  │ (WebSocket - Chat/Notif.)     ││
│  └────────────┘  └────────────┘  └────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

```

---

## 4. Layer Responsibilities

### Frontend (React + TypeScript)
**Responsibilities:**
- Render UI components
- Handle user interactions
- Manage client-side state
- Navigation & routing
- Form validation (basic)
- Display loading/error states
- Real-time subscriptions (chat)

**NOT Responsible:**
- Business logic validation
- Score/XP calculation
- Question eligibility
- Security enforcement

---

### Backend (FastAPI)
**Responsibilities:**
- Authentication verification
- Authorization (business rules)
- Data validation (Pydantic)
- Question eligibility logic
- Game session management
- Score & XP calculation
- Analytics aggregation
- AI content generation
- External API integrations
- Error handling & logging

**NOT Responsible:**
- UI rendering
- Client-side state

---

### Database (Supabase/PostgreSQL)
**Responsibilities:**
- Data persistence
- Data integrity (constraints)
- Row Level Security (RLS)
- Indexing for performance
- Stored procedures/functions
- Realtime subscriptions

**NOT Responsible:**
- Business logic
- UI presentation

---

## 5. Core Business Logic

### 5.1 Question Eligibility Rule (NON-NEGOTIABLE)

> **"A student must only be tested on material that the student has completed."**

#### Implementation Logic:
```python
def get_eligible_questions(student_id: str, scope_type: str, scope_id: int):
    # Step 1: Get completed lesson IDs
    completed_lessons = db.query(
        "SELECT lesson_id FROM lesson_progress "
        "WHERE student_profile_id = %s AND status = 'completed'",
        student_id
    )
    
    # Step 2: Get questions linked to completed lessons
    eligible_questions = db.query(
        "SELECT DISTINCT q.id, q.* FROM questions q "
        "JOIN question_lessons ql ON q.id = ql.question_id "
        "WHERE ql.lesson_id IN %s",
        completed_lessons
    )
    
    # Step 3: Filter by scope (lesson/unit/subject/course/challenge)
    if scope_type == 'lesson':
        eligible_questions = filter_by_lesson(eligible_questions, scope_id)
    elif scope_type == 'unit':
        eligible_questions = filter_by_unit(eligible_questions, scope_id)
    elif scope_type == 'subject':
        eligible_questions = filter_by_subject(eligible_questions, scope_id)
    
    # Step 4: Shuffle and return
    return shuffle(eligible_questions)
```

---

5.2 XP & Scoring System

```python
def calculate_xp(student_id: str, question: dict, attempt: dict):
    # Base XP
    base_xp = 10
    
    # Difficulty multiplier
    difficulty_map = {'easy': 1, 'medium': 2, 'hard': 3}
    difficulty_multiplier = difficulty_map.get(question['difficulty'], 1)
    
    # Time bonus (faster = more XP)
    time_bonus = max(0, 5 - (attempt['response_time_ms'] / 1000))
    
    # Calculate base XP
    xp_earned = base_xp * difficulty_multiplier + time_bonus
    
    # Double for correct answers
    if attempt['is_correct']:
        xp_earned *= 2
    
    # Update student's total XP
    db.query(
        "UPDATE student_profiles SET xp = xp + %s, level = calculate_level(xp + %s) "
        "WHERE profile_id = %s",
        xp_earned, xp_earned, student_id
    )
    
    # Record transaction
    db.query(
        "INSERT INTO xp_transactions (student_profile_id, amount, reason, source_type, source_id) "
        "VALUES (%s, %s, 'Game Session', 'game_session', %s)",
        student_id, xp_earned, attempt['session_id']
    )
    
    return xp_earned
```

---

5.3 Lesson Completion Logic

```python
def check_lesson_completion(student_id: str, lesson_id: int):
    # Get progress
    progress = db.query(
        "SELECT * FROM lesson_progress "
        "WHERE student_profile_id = %s AND lesson_id = %s",
        student_id, lesson_id
    )
    
    if not progress:
        return False
    
    # Count published content blocks
    total_blocks = db.query(
        "SELECT COUNT(*) FROM lesson_content_blocks "
        "WHERE lesson_id = %s AND is_published = true",
        lesson_id
    )
    
    # Count viewed blocks via learning_events
    viewed_blocks = db.query(
        "SELECT COUNT(DISTINCT metadata->>'block_id') FROM learning_events "
        "WHERE student_profile_id = %s AND lesson_id = %s "
        "AND event_type = 'content_viewed'",
        student_id, lesson_id
    )
    
    # Completion requires 90%+ content viewed + interactive question answered
    if viewed_blocks / total_blocks >= 0.9:
        db.query(
            "UPDATE lesson_progress SET status = 'completed', completed_at = NOW() "
            "WHERE student_profile_id = %s AND lesson_id = %s",
            student_id, lesson_id
        )
        return True
    
    return False
```

---

6. API Layer Structure

6.1 API Endpoints Organization

```
/api/
├── auth/
│   ├── POST /login          # Supabase Auth login
│   ├── POST /register       # Create profile + auth user
│   ├── POST /verify         # Verify JWT
│   └── POST /refresh        # Refresh token
│
├── lessons/
│   ├── GET /{lesson_id}              # Full lesson content
│   ├── GET /{lesson_id}/progress     # Student progress
│   ├── POST /{lesson_id}/start       # Start lesson
│   └── POST /{lesson_id}/complete    # Mark complete
│
├── game/
│   ├── POST /session/start           # Start game session
│   ├── POST /session/attempt         # Submit answer
│   ├── GET /session/{id}             # Get session results
│   └── GET /template/{id}            # Get game template
│
├── analytics/
│   ├── GET /parent/{student_id}      # Parent dashboard data
│   ├── GET /admin/performance        # Learning metrics
│   └── GET /admin/health             # Platform health
│
├── ai/
│   ├── POST /generate/lesson         # Generate lesson
│   ├── POST /generate/questions      # Generate questions
│   └── POST /validate/content        # Validate AI output
│
├── social/
│   ├── GET /conversations            # User conversations
│   ├── POST /messages                # Send message
│   ├── GET /friendships              # Friends list
│   └── POST /friendships/request     # Send friend request
│
├── billing/
│   ├── GET /plans                    # Available plans
│   ├── POST /subscribe               # Create subscription
│   └── GET /subscriptions            # User subscriptions
│
└── admin/
    ├── GET /dashboard                # Admin overview
    ├── POST /curriculum              # Add/update curriculum
    └── GET /errors                   # System errors log
```

---

7. Data Flow Examples

7.1 Student Completing a Lesson

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Student opens lesson page                                       │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Frontend calls GET /lessons/{lesson_id}?student_id=X          │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Backend:                                                       │
│    - Fetch lesson content, blocks, assets, vocabulary            │
│    - Fetch student progress for this lesson                      │
│    - Return combined data                                        │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Frontend renders lesson with all content blocks               │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Student views content (tracks via learning_events)            │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Student answers interactive question                          │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Frontend calls POST /lessons/{lesson_id}/complete              │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. Backend:                                                       │
│    - Validates completion criteria (90%+ viewed + answer)        │
│    - Updates lesson_progress to 'completed'                      │
│    - Awards XP                                                   │
│    - Updates student_subject_metrics                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

7.2 Student Playing a Game

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Student clicks "Play Game" on lesson page                     │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Frontend calls POST /game/session/start                        │
│    Body: { student_id, game_definition_id }                      │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Backend:                                                       │
│    - Get game definition & template                              │
│    - Check eligibility: Is lesson completed?                     │
│    - Fetch eligible questions                                    │
│    - Create game_session record                                  │
│    - Create game_session_questions records                       │
│    - Return session_id + questions (without answers)            │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Frontend renders game with first question                     │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Student answers question                                       │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Frontend calls POST /game/session/attempt                      │
│    Body: { session_question_id, student_id, answer, time }       │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Backend:                                                       │
│    - Verify answer against correct_answer                        │
│    - Calculate XP                                                │
│    - Save question_attempt                                       │
│    - Update game_session score                                   │
│    - Update concept_mastery                                      │
│    - Return result (correct/incorrect, XP earned)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

7.3 Parent Viewing Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Parent opens dashboard in mobile browser                      │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Frontend calls GET /analytics/parent/{student_id}              │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Backend:                                                       │
│    - Verify parent-student relationship                          │
│    - Fetch student profile & basic info                          │
│    - Fetch weekly summary via aggregation                        │
│    - Fetch subject performance data                              │
│    - Fetch recent achievements                                   │
│    - Generate AI insights (strengths/weaknesses)                │
│    - Fetch recommendations                                       │
│    - Return dashboard data                                       │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Frontend renders:                                              │
│    - Student summary card                                        │
│    - Weekly summary (plain language)                            │
│    - Key metrics (completed lessons, accuracy, XP)             │
│    - Subject performance bars                                    │
│    - AI insights (strengths/weaknesses)                        │
│    - Recommendations                                            │
│    - Actionable tip                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

8. Security & Authorization

8.1 Authentication (Supabase Auth)

```
┌─────────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW                                               │
├─────────────────────────────────────────────────────────────────────┤
│ 1. User submits email + password                                  │
│ 2. Supabase Auth validates credentials                            │
│ 3. Supabase returns JWT access_token + refresh_token             │
│ 4. Frontend stores token in localStorage                         │
│ 5. All API requests include: Authorization: Bearer {token}      │
│ 6. Backend verifies token via Supabase Python client            │
│ 7. Token validated → proceed; invalid → 401 Unauthorized        │
└─────────────────────────────────────────────────────────────────────┘
```

8.2 Authorization (Supabase RLS Policies)

```sql
-- Students: See only own progress
CREATE POLICY "Students can view own progress" ON lesson_progress
FOR SELECT USING (auth.uid() = student_profile_id);

-- Parents: See their children's progress
CREATE POLICY "Parents can view children's progress" ON lesson_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_students 
    WHERE parent_profile_id = auth.uid() 
    AND student_profile_id = lesson_progress.student_profile_id
  )
);

-- Teachers: See students in their grade
CREATE POLICY "Teachers view grade students" ON student_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'teacher'
    AND p.grade_id = student_profiles.grade_id
  )
);

-- Admins: Full access
CREATE POLICY "Admins have full access" ON ALL TABLES
FOR ALL USING (auth.role() = 'admin');
```

8.3 Business Authorization (Backend)

```python
def verify_parent_access(parent_id: str, student_id: str):
    """Check if parent has access to this student"""
    result = supabase.table("parent_students").select("*").eq("parent_profile_id", parent_id).eq("student_profile_id", student_id).execute()
    if not result.data:
        raise HTTPException(403, "Access denied")
    return True

def verify_student_owns_session(student_id: str, session_id: str):
    """Check if student owns this game session"""
    result = supabase.table("game_sessions").select("*").eq("id", session_id).eq("student_profile_id", student_id).execute()
    if not result.data:
        raise HTTPException(403, "Access denied")
    return True
```

---

9. AI Content Pipeline

9.1 Pipeline Flow

```
┌─────────────┐
│ 1. Request  │  Admin requests content generation
└──────┬──────┘
       ▼
┌─────────────┐
│ 2. Queue    │  status = 'queued' (content_generation_jobs)
└──────┬──────┘
       ▼
┌─────────────┐
│ 3. Process  │  Job worker calls LLM API
└──────┬──────┘
       ▼
┌─────────────┐
│ 4. Validate │  Check word count, language, accuracy
└──────┬──────┘
       ▼
┌─────────────┐
│ 5. Review   │  status = 'review' (Admin reviews)
└──────┬──────┘
       ▼
┌─────────────┐
│ 6. Approve  │  Admin approves or modifies
└──────┬──────┘
       ▼
┌─────────────┐
│ 7. Publish  │  content_versions status = 'published'
└─────────────┘
```

9.2 Validation Rules

```python
def validate_ai_lesson(content, grade_level):
    checks = {
        'word_count': validate_word_count(content, grade_level),
        'language_balance': validate_language_balance(content, grade_level),
        'has_hook': 'hook' in content and len(content['hook']) > 10,
        'has_explanation': 'explanation' in content and len(content['explanation']) > 50,
        'has_objectives': 'objectives' in content and len(content['objectives']) > 0,
        'has_vocabulary': 'vocabulary' in content and len(content['vocabulary']) > 0,
        'has_interactive': 'interactive_question' in content,
        'no_broken_links': validate_links(content),
        'age_appropriate': validate_age_appropriateness(content, grade_level)
    }
    
    if all(checks.values()):
        return {'valid': True}
    else:
        return {'valid': False, 'errors': checks}
```

9.3 Word Count Targets

```python
WORD_COUNTS = {
    'Grade 1': (100, 160),
    'Grade 2': (120, 180),
    'Grade 3': (150, 220),
    'Grade 4': (180, 260),
    'Grade 5': (220, 320),
    'Grade 6': (250, 350)
}
```

---

10. Parent Dashboard Flow

10.1 Data Aggregation (Backend)

```python
@app.get("/analytics/parent/{student_id}")
async def get_parent_dashboard(student_id: str, parent_id: str):
    # 1. Verify access
    verify_parent_access(parent_id, student_id)
    
    # 2. Get student profile
    student = get_student_profile(student_id)
    
    # 3. Weekly summary
    weekly_summary = db.query("""
        SELECT 
            COUNT(DISTINCT lp.lesson_id) AS lessons_completed,
            COUNT(DISTINCT qa.id) AS questions_answered,
            AVG(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) AS accuracy,
            SUM(xp.amount) AS xp_earned
        FROM lesson_progress lp
        LEFT JOIN question_attempts qa ON qa.student_profile_id = lp.student_profile_id
        LEFT JOIN xp_transactions xp ON xp.student_profile_id = lp.student_profile_id
        WHERE lp.student_profile_id = %s
        AND lp.completed_at > NOW() - INTERVAL '7 days'
        AND lp.status = 'completed'
    """, student_id)
    
    # 4. Subject performance
    subject_performance = db.query("""
        SELECT 
            s.title AS subject_name,
            ssm.mastery_score,
            ssm.accuracy,
            ssm.lessons_completed,
            ssm.lessons_total
        FROM student_subject_metrics ssm
        JOIN subjects s ON s.id = ssm.subject_id
        WHERE ssm.student_profile_id = %s
        ORDER BY ssm.mastery_score DESC
    """, student_id)
    
    # 5. Recent achievements
    achievements = db.query("""
        SELECT a.name, a.icon_url, sa.earned_at
        FROM student_achievements sa
        JOIN achievements a ON a.id = sa.achievement_id
        WHERE sa.student_profile_id = %s
        ORDER BY sa.earned_at DESC
        LIMIT 5
    """, student_id)
    
    # 6. AI-generated insights
    insights = generate_insights(student_id)
    
    # 7. Recommendations
    recommendations = db.query("""
        SELECT * FROM learning_recommendations
        WHERE student_profile_id = %s
        AND is_dismissed = false
        ORDER BY priority DESC
        LIMIT 5
    """, student_id)
    
    # 8. Actionable tip
    parent_tip = generate_parent_tip(insights)
    
    return {
        "student": student,
        "weekly_summary": weekly_summary[0],
        "subject_performance": subject_performance,
        "achievements": achievements,
        "insights": insights,
        "recommendations": recommendations,
        "parent_tip": parent_tip
    }
```

10.2 Frontend Mobile-First Implementation

```tsx
// ParentDashboard.tsx (Mobile-First)

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getParentDashboard } from '../api/analytics';

export function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadDashboard(user.id);
  }, [user]);

  const loadDashboard = async (studentId: string) => {
    try {
      const result = await getParentDashboard(studentId);
      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-xl font-bold">👨‍👩‍👦 لوحة ولي الأمر</h1>
        <p className="text-sm text-gray-600">متابعة {data.student.name}</p>
      </header>

      {/* Weekly Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <p className="text-sm text-blue-800">
          {data.weekly_summary.message}
        </p>
      </div>

      {/* Key Metrics - Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard 
          label="📚 دروس مكتملة"
          value={`${data.student.lessons_completed}/${data.student.lessons_total}`}
        />
        <MetricCard 
          label="🎯 متوسط الدقة"
          value={`${data.student.accuracy}%`}
        />
        <MetricCard 
          label="🎮 ألعاب هذا الأسبوع"
          value={data.weekly_summary.games_played}
        />
        <MetricCard 
          label="⭐ نقاط الخبرة"
          value={data.student.xp}
        />
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow">
        <h3 className="font-semibold text-sm mb-3">📊 أداء المواد</h3>
        {data.subject_performance.map((subject) => (
          <SubjectProgressBar
            key={subject.subject_name}
            subject={subject.subject_name}
            mastery={subject.mastery_score}
            accuracy={subject.accuracy}
          />
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow">
        <h3 className="font-semibold text-sm mb-3">💡 نقاط القوة والتحسين</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-green-600">
            <span>✅</span>
            <span className="text-sm">{data.insights.strengths}</span>
          </div>
          <div className="flex items-start gap-2 text-orange-600">
            <span>📈</span>
            <span className="text-sm">{data.insights.areas_for_improvement}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow">
        <h3 className="font-semibold text-sm mb-3">📌 توصيات</h3>
        {data.recommendations.map((rec) => (
          <RecommendationItem key={rec.id} {...rec} />
        ))}
      </div>

      {/* Actionable Tip */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
        <p className="text-sm text-purple-800">
          💡 {data.parent_tip}
        </p>
      </div>
    </div>
  );
}

// Reusable Components (Mobile-Optimized)
function MetricCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow text-center">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function SubjectProgressBar({ subject, mastery, accuracy }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm">
        <span>{subject}</span>
        <span>{mastery}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mastery}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        دقة: {accuracy}%
      </div>
    </div>
  );
}
```

---

11. Game Engine Flow

11.1 Game Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAME SESSION LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 1. START                    status = 'started'              │  │
│  │    - Student requests game                                 │  │
│  │    - Backend checks eligibility                            │  │
│  │    - Creates game_session record                           │  │
│  │    - Creates game_session_questions                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 2. PLAYING                  status = 'started'              │  │
│  │    - Student answers each question                         │  │
│  │    - Each answer creates question_attempt                  │  │
│  │    - Score accumulates                                     │  │
│  │    - XP is awarded for correct answers                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 3. COMPLETE                  status = 'completed'           │  │
│  │    - All questions answered                                │  │
│  │    - Final score calculated                                │  │
│  │    - Accuracy computed                                     │  │
│  │    - Total XP awarded                                     │  │
│  │    - game_session.completed_at = NOW()                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 4. UPDATE ANALYTICS                                        │  │
│  │    - Update concept_mastery for each concept              │  │
│  │    - Update student_subject_metrics                       │  │
│  │    - Create learning_event record                         │  │
│  │    - Check and award achievements                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

11.2 Question Selection Algorithm

```python
def select_game_questions(game_definition, student_id):
    # Get game scope
    scope_type = game_definition['scope_type']
    scope_id = game_definition[f'{scope_type}_id']
    
    # Step 1: Get questions from completed lessons
    questions = db.query("""
        SELECT DISTINCT q.* FROM questions q
        JOIN question_lessons ql ON q.id = ql.question_id
        JOIN lesson_progress lp ON lp.lesson_id = ql.lesson_id
        WHERE lp.student_profile_id = %s
        AND lp.status = 'completed'
        AND q.status = 'published'
    """, student_id)
    
    # Step 2: Filter by scope
    if scope_type == 'lesson':
        questions = [q for q in questions if q['lesson_id'] == scope_id]
    elif scope_type == 'unit':
        questions = [q for q in questions if q['unit_id'] == scope_id]
    elif scope_type == 'subject':
        questions = [q for q in questions if q['subject_id'] == scope_id]
    
    # Step 3: Limit number (configurable in game template)
    max_questions = game_definition['settings'].get('max_questions', 10)
    
    # Step 4: Balance by difficulty
    difficulty_weights = {'easy': 0.2, 'medium': 0.5, 'hard': 0.3}
    selected = balance_by_difficulty(questions, difficulty_weights, max_questions)
    
    # Step 5: Shuffle for randomness
    random.shuffle(selected)
    
    return selected[:max_questions]
```

---

12. Social & Realtime

12.1 Chat Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CHAT FLOW (Realtime)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐              │
│  │  Student A │    │  Supabase  │    │  Student B │              │
│  │  (Sender)  │    │  Realtime  │    │ (Receiver) │              │
│  └─────┬──────┘    └─────┬──────┘    └─────┬──────┘              │
│        │                │                │                       │
│        │ POST /messages │                │                       │
│        │───────────────>│                │                       │
│        │                │                │                       │
│        │                │ INSERT INTO    │                       │
│        │                │ messages       │                       │
│        │                │                │                       │
│        │                │ Broadcast to   │                       │
│        │                │ conversation   │                       │
│        │                │───────────────>│                       │
│        │                │                │                       │
│        │                │  WebSocket     │                       │
│        │                │  (Realtime)    │                       │
│        │                │<───────────────│                       │
│        │                │                │                       │
│        │ 200 OK         │                │                       │
│        │<───────────────│                │                       │
│        │                │                │                       │
└─────────────────────────────────────────────────────────────────────┘
```

12.2 Frontend Realtime Subscription

```typescript
// ChatView.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export function ChatView({ conversationId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: newMessage,
      message_type: 'text'
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isOwn={msg.sender_id === user.id}
          />
        ))}
      </div>
      <div className="border-t p-4 flex gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالة..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-blue-500 text-white rounded-full px-4 py-2"
          onClick={sendMessage}
        >
          إرسال
        </button>
      </div>
    </div>
  );
}
```

---

13. Deployment Strategy

13.1 Environment Variables

Backend (.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
CORS_ORIGINS=http://localhost:5173,https://your-frontend.com
```

Frontend (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api
```

13.2 Deploy Commands

Backend (Render / Railway)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Frontend (Vercel / Netlify)

```bash
cd frontend
npm install
npm run build
# Deploy the 'dist' folder
```

13.3 Docker (Optional)

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

14. Development Guidelines

14.1 Coding Standards

Backend:

· Follow PEP 8
· Use type hints
· Document with docstrings
· Use Pydantic for validation

Frontend:

· Use TypeScript strictly
· Functional components with hooks
· Tailwind for styling
· Follow React best practices

14.2 Git Workflow

```
main (production)
 ↑
develop (staging)
 ↑
feature/xxx (feature branches)
```

Commit Messages:

· feat: - New feature
· fix: - Bug fix
· docs: - Documentation
· refactor: - Code refactor
· test: - Tests
· chore: - Build/tooling

14.3 Testing

Backend:

· pytest for unit tests
· FastAPI TestClient for integration
· Mock Supabase for DB tests

Frontend:

· Vitest for unit tests
· React Testing Library for components
· MSW for API mocking

14.4 Error Handling

```python
# Backend error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

```typescript
// Frontend API error handling
try {
  const data = await api.get('/lessons/123');
} catch (error) {
  if (error.response?.status === 404) {
    toast.error('الدرس غير موجود');
  } else {
    toast.error('حدث خطأ، حاول مرة أخرى');
  }
}
```

---

📌 Summary

TheTutor is a production-ready educational platform with:

Area Status
Frontend React + TypeScript + Vite + Tailwind
Backend FastAPI (Python)
Database PostgreSQL (Supabase)
Auth Supabase Auth (JWT)
Storage Supabase Storage
Realtime Supabase Realtime
AI Pipeline OpenAI/Gemini with validation
Security RLS + Business Authorization
Parent Experience Mobile-first, simple insights
Game Engine Configurable templates
Social Chat + Friendships

---

