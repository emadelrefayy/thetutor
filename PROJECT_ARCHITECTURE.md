TheTutor — Application Architecture

1. Purpose

TheTutor is a multi-tenant educational SaaS platform for Egyptian primary-school students in the Experimental Languages curriculum.

The platform serves four primary authenticated user experiences:

1. Platform Super Admin
2. Tenant Admin
3. Parent
4. Student

The public website contains a marketing landing page and authentication entry point.

Curriculum learning content is not public. Curriculum access starts after authentication and authorization.

---

2. High-Level Architecture

                         ┌──────────────────────┐
                         │     Landing Page     │
                         │   Public Marketing   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                              ┌───────────┐
                              │   Login   │
                              └─────┬─────┘
                                    │
                                    ▼
                           Supabase Authentication
                                    │
                                    ▼
                           Resolve Application Role
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Platform Super Admin   Tenant Admin            Parent
              │                     │                     │
              ▼                     ▼                     ▼
       Platform Dashboard    Tenant Dashboard      Parent Dashboard
                                                            │
                                                            ▼
                                                       Children
                                                            │
                                                            ▼
                                                      Student Data

                                    │
                                    ▼
                                 Student
                                    │
                                    ▼
                           Student Dashboard
                                    │
                                    ▼
                                  Grade
                                    │
                                    ▼
                                  Term
                                    │
                                    ▼
                                Subject
                                    │
                                    ▼
                                  Unit
                                    │
                                    ▼
                                 Lesson
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
                 Content          Video         Infographic
                    │
                    ▼
                  Game

---

3. Technology Stack

Frontend

- React
- TypeScript
- Vite
- React Router
- Supabase JavaScript Client

Backend / Platform

- Supabase Auth
- Supabase PostgreSQL
- Row Level Security
- Supabase Realtime
- Supabase Storage
- Supabase RPCs
- Supabase Edge Functions where server-side execution is required

Analytics

Learning events, game attempts, progress, XP, mastery and aggregate metrics are stored in PostgreSQL and are intended to feed the analytics layer.

Python-based analytics processing may be introduced as a separate backend/worker layer without changing the core database contract.

---

4. Authentication Architecture

Supabase Auth is the identity provider.

The authenticated user's identity is represented by:

auth.users.id
        │
        ▼
public.profiles.id

The application must never use client-editable user metadata as an authorization source.

Authorization is determined from trusted database records and RLS policies.

---

5. Role Model

5.1 Platform Super Admin

The platform-level administrator is represented by:

public.profiles.role = 'super_admin'

The Super Admin operates outside normal tenant administration.

Responsibilities include:

- Tenant management
- Tenant creation
- Subscription/package management
- Platform-level monitoring
- Platform administration
- Support operations
- Platform-wide reporting
- Managing tenant administrators

The Super Admin must not be treated as an ordinary tenant member.

---

5.2 Tenant Admin

Tenant administration is represented by:

public.tenant_memberships

with:

role = 'tenant_admin'
status = 'active'

Tenant Admin permissions are tenant-scoped.

A Tenant Admin can manage the operational data belonging to the tenant, subject to RLS and application authorization.

Tenant Admin does not become a platform Super Admin.

---

5.3 Parent

Parents are authenticated users with tenant membership:

tenant_memberships.role = 'parent'

Parent/student relationships are represented through:

tenant_parent_students

This relationship allows one parent to be associated with multiple students.

The application must therefore never assume:

one parent → one student

The correct model is:

Parent
  │
  ├── Student A
  ├── Student B
  ├── Student C
  └── ...

A parent may have children in different grades and may potentially have children associated with different tenants.

The Parent Dashboard must therefore load the parent's authorized student relationships rather than assuming a single current student.

---

5.4 Student

Students have tenant-scoped educational identities through:

tenant_student_profiles

The important relationship is:

tenant_student_profiles
├── tenant_id
├── profile_id
├── student_code
├── display_name
├── grade_id
├── avatar_url
├── xp
├── level
└── is_active

This allows the same global identity to have a tenant-specific educational profile.

The Student Dashboard must resolve the student's active tenant context before loading curriculum data.

---

6. Tenant Isolation

Tenant isolation is mandatory.

Tenant-owned records contain:

tenant_id

where appropriate.

Examples include:

- grades
- terms
- subjects
- units
- lessons
- questions
- games
- game sessions
- learning events
- lesson progress
- achievements
- recommendations
- analytics
- challenges
- social data
- subscriptions
- content pipeline data

The frontend must never attempt to bypass RLS.

The client uses the publishable Supabase key only.

Service-role credentials must never be shipped to the browser.

---

7. Authorization Flow

The application follows this sequence:

User opens application
        │
        ▼
Landing Page
        │
        ▼
Login
        │
        ▼
Supabase Auth
        │
        ▼
Authenticated session
        │
        ▼
Load trusted profile / membership context
        │
        ▼
Resolve role
        │
        ├── super_admin
        │       ↓
        │   Platform Dashboard
        │
        ├── tenant_admin
        │       ↓
        │   Tenant Dashboard
        │
        ├── parent
        │       ↓
        │   Parent Dashboard
        │
        └── student
                ↓
          Student Dashboard

The role must be resolved before protected application routes are rendered.

---

8. Route Architecture

Public Routes

/

Landing page.

/login

Authentication page.

---

9. Protected Dashboard Routes

Super Admin

/dashboard/super-admin

Future sections may include:

/dashboard/super-admin/tenants
/dashboard/super-admin/plans
/dashboard/super-admin/subscriptions
/dashboard/super-admin/users
/dashboard/super-admin/audit

---

Tenant Admin

/dashboard/tenant-admin

Future sections may include:

/dashboard/tenant-admin/students
/dashboard/tenant-admin/parents
/dashboard/tenant-admin/teachers
/dashboard/tenant-admin/curriculum
/dashboard/tenant-admin/games
/dashboard/tenant-admin/content
/dashboard/tenant-admin/reports

All tenant-admin routes must operate inside the authenticated tenant context.

---

Parent

/dashboard/parent

Future sections:

/dashboard/parent/children
/dashboard/parent/children/:studentId
/dashboard/parent/progress
/dashboard/parent/performance
/dashboard/parent/recommendations

The parent may switch between authorized children.

---

Student

/dashboard/student

The Student Dashboard is the entry point to the learning experience.

---

10. Student Curriculum Navigation

The student curriculum flow is:

Student Dashboard
       │
       ▼
Current Student Grade
       │
       ▼
Terms
       │
       ├── Term 1
       │
       └── Term 2
       │
       ▼
Subjects
       │
       ▼
Units
       │
       ▼
Lessons
       │
       ▼
Lesson

The student must not browse arbitrary curriculum records.

Curriculum queries are filtered by the student's authorized tenant and grade context through RLS and application logic.

---

11. Curriculum Database Hierarchy

The canonical hierarchy is:

tenants
   │
   ▼
grades
   │
   ▼
terms
   │
   ▼
subjects
   │
   ▼
units
   │
   ▼
lessons

Relationships are represented by the existing database foreign keys.

The frontend must respect this hierarchy instead of creating duplicate client-side curriculum models.

---

12. Existing Curriculum Pages

The current curriculum pages are:

GradesPage
TermsPage
SubjectsPage
UnitsPage
LessonPage

They are learning-content components.

They are not public pages.

They should ultimately be rendered inside the authenticated Student Dashboard flow.

---

13. Lesson Experience

The Lesson page is the complete learning experience for a single lesson.

It can contain:

Lesson
├── Title
├── Summary
├── Progress
├── Video
├── Infographic
├── Structured Content
├── Lesson Assets
├── Vocabulary
├── Learning Objectives
├── Activities
└── Lesson Game

The database already supports lesson content through:

lessons
lesson_assets
lesson_content_blocks
content_versions
lesson_vocabulary
learning_objectives
lesson_concepts

The frontend should use these canonical sources.

---

14. Video

Lesson video is represented by the existing lesson/content asset model.

The current lesson model also contains:

video_url

The frontend may render a YouTube embed when the URL is a valid YouTube URL.

External video URLs must open safely using appropriate browser security attributes.

---

15. Infographics

Infographics are represented through:

lesson_assets

with:

asset_type = 'infographic'

The existing lesson model also contains:

infographic_url

The application should support both the canonical asset model and the existing lesson compatibility field while the content model is being normalized.

---

16. Lesson Progress

Student lesson progress is represented by:

lesson_progress

Important fields include:

student_profile_id
lesson_id
status
completion_percent
first_started_at
completed_at
last_accessed_at
time_spent_seconds
tenant_id

Supported lesson states:

not_started
in_progress
completed

The Lesson page displays the student's progress.

Progress belongs to the student and tenant context and must never be exposed across tenants.

---

17. Game Architecture

The game system is hierarchical.

Subject Game
Unit Game
Lesson Game

The database model uses:

game_templates
        │
        ▼
game_definitions
        │
        ▼
game_definition_questions
        │
        ▼
questions

Game scope is represented by:

game_definitions.scope_type

Supported scopes include:

lesson
unit
subject
course
challenge

---

18. Game Eligibility

Games must respect learning progression.

A game must only use questions that the student is authorized to access.

Lesson-level game questions are connected through:

question_lessons

The game engine is responsible for applying eligibility and question-selection rules.

The frontend must not implement authorization by filtering question data after downloading unauthorized records.

---

19. Game Runtime

Runtime data is represented by:

game_sessions
game_session_questions
question_attempts

The runtime flow is:

Student
   │
   ▼
Game Definition
   │
   ▼
Start Game
   │
   ▼
Game Session
   │
   ▼
Session Questions
   │
   ▼
Question
   │
   ▼
Answer
   │
   ▼
Question Attempt
   │
   ▼
Complete Game
   │
   ▼
Score / Accuracy / XP

Game state changes must be performed through the authorized database/game runtime contract.

---

20. Game Difficulty

The question bank supports difficulty classifications including:

easy
medium
hard

and compatible levels:

beginner
intermediate
advanced

Game templates determine how questions are rendered and how the available question types are presented.

---

21. Analytics

Learning analytics are derived from:

learning_events
lesson_progress
game_sessions
question_attempts
concept_mastery
student_subject_metrics
analytics_daily_student
analytics_concept_daily

The system can calculate:

- lesson completion
- question accuracy
- game scores
- XP
- mastery
- time spent
- streaks
- subject performance
- concept performance
- recommendations

---

22. Parent Analytics

The Parent Dashboard consumes authorized student data.

The parent experience should provide:

Children
   │
   ├── Grade
   ├── Subject Progress
   ├── Lesson Completion
   ├── Game Performance
   ├── Accuracy
   ├── Mastery
   ├── XP
   ├── Achievements
   └── Recommendations

A parent may switch between children.

The backend/RLS layer remains the authority for which children the parent can see.

---

23. Super Admin Architecture

The Super Admin is platform-level.

The Super Admin Dashboard should eventually provide:

Platform Overview
├── Tenants
├── Tenant Status
├── Plans
├── Subscriptions
├── Platform Users
├── Usage
├── Audit Logs
├── Content Pipeline
└── Platform Health

Super Admin operations must be separated from normal tenant operations.

---

24. Tenant Admin Architecture

The Tenant Admin Dashboard manages one tenant.

Expected areas:

Tenant Overview
├── Students
├── Parents
├── Teachers / Staff
├── Curriculum
├── Lessons
├── Games
├── Challenges
├── Content
├── Reports
└── Tenant Settings

Every operation must remain tenant-scoped.

---

25. Parent-Student Linking

Parent/student linking uses:

parent_invitations
tenant_parent_students

The invitation flow is:

Tenant Admin
     │
     ▼
Create Parent Invitation
     │
     ▼
Parent receives / enters invitation
     │
     ▼
Authenticated Parent
     │
     ▼
Validate invitation
     │
     ▼
Create parent ↔ student relationship

A parent can subsequently have multiple authorized children.

---

26. Realtime and Social Features

The database already contains infrastructure for:

friendships
conversations
conversation_members
messages
game_rooms
game_room_players

These features will use Supabase Realtime where appropriate.

Social features must remain tenant-scoped and student-authorized.

---

27. Weekly Challenges

Challenges are represented by:

challenges
challenge_questions
challenge_participants
challenge_attempts

A challenge may be associated with a grade and has:

starts_at
ends_at
status
recurrence
timezone

The default timezone currently represented in the schema is:

Africa/Cairo

The challenge system supports scheduled/live/finished lifecycle states.

---

28. Content Pipeline

The content system supports controlled curriculum content generation and import.

Relevant tables include:

curriculum_sources
lesson_source_refs
content_import_batches
content_generation_jobs
content_versions
lesson_assets
lesson_content_blocks

Content must pass validation before publication.

The content pipeline is:

Source
   │
   ▼
Import / Generation
   │
   ▼
Validation
   │
   ▼
Review
   │
   ▼
Approval
   │
   ▼
Publication
   │
   ▼
Student Learning Experience

---

29. Security Model

RLS is mandatory.

Every exposed public-schema table has RLS enabled.

Authorization must be based on:

auth.uid()
trusted profile data
tenant membership
tenant-scoped student identity
parent/student relationship

Never use editable client metadata as an authorization source.

Never expose:

service_role
secret keys
privileged database credentials

to the frontend.

---

30. Frontend Authorization Boundaries

The frontend must implement route guards:

PublicRoute
ProtectedRoute
RoleRoute
TenantRoute
StudentRoute
ParentRoute

However, frontend guards are only UX/security boundaries at the client level.

The database RLS policies remain the authoritative security boundary.

---

31. Route Guard Behavior

If no authenticated session exists:

Protected route
      ↓
/login

If the authenticated user's role does not match the route:

Unauthorized
      ↓
appropriate dashboard

If the user has no valid tenant context:

Tenant-scoped route
      ↓
tenant selection / access error

If a student attempts to access another student's data:

RLS
 ↓
deny

The frontend must not attempt to work around this denial.

---

32. Application Layout

The future React structure should evolve toward:

src/
├── app/
│   ├── App.tsx
│   ├── routes/
│   └── guards/
│
├── components/
│
├── layouts/
│   ├── PublicLayout
│   ├── PlatformAdminLayout
│   ├── TenantAdminLayout
│   ├── ParentLayout
│   └── StudentLayout
│
├── pages/
│   ├── LandingPage
│   ├── LoginPage
│   ├── dashboards/
│   │   ├── SuperAdminDashboard
│   │   ├── TenantAdminDashboard
│   │   ├── ParentDashboard
│   │   └── StudentDashboard
│   │
│   └── curriculum/
│       ├── GradesPage
│       ├── TermsPage
│       ├── SubjectsPage
│       ├── UnitsPage
│       └── LessonPage
│
├── lib/
│   ├── database.ts
│   ├── curriculum.ts
│   ├── auth.ts
│   └── games.ts
│
└── main.tsx

The current repository may temporarily keep the existing flat "pages" structure while the dashboard layer is introduced.

---

33. Current Repository Integration

The existing curriculum implementation remains the foundation for the Student learning flow.

Current pages:

GradesPage
TermsPage
SubjectsPage
UnitsPage
LessonPage

Current database integration:

src/lib/database.ts
src/lib/curriculum.ts

These files must remain aligned with the actual Supabase schema.

No duplicate schema definitions should be introduced into page components.

---

34. App Router Direction

The final "App.tsx" should evolve from the current curriculum-only router into a role-aware application router.

Target structure:

/
└── LandingPage

/login
└── LoginPage

/dashboard
├── super-admin
├── tenant-admin
├── parent
└── student

/dashboard/student
└── curriculum flow

/dashboard/student/grades
└── Grades

/dashboard/student/grades/:gradeId/terms
└── Terms

/dashboard/student/grades/:gradeId/terms/:termId/subjects
└── Subjects

/dashboard/student/grades/:gradeId/terms/:termId/subjects/:subjectId/units
└── Units

/dashboard/student/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons
└── Lessons

/dashboard/student/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons/:lessonId
└── Lesson

The curriculum pages should eventually be nested under the Student layout.

---

35. Migration Strategy

The application must be built incrementally.

Phase 1 — Foundation

- Supabase client
- Auth session
- Role resolution
- Protected routes
- Public landing page
- Login page

Phase 2 — Dashboards

Build:

1. Super Admin Dashboard
2. Tenant Admin Dashboard
3. Parent Dashboard
4. Student Dashboard

Phase 3 — Student Curriculum

Integrate the existing:

Grades
Terms
Subjects
Units
Lessons

inside the Student Dashboard.

Phase 4 — Game Runtime

Build:

- Lesson Game
- Unit Game
- Subject Game
- Game runtime
- Game results
- Progress integration

Phase 5 — Parent Analytics

Build:

- child switching
- progress
- performance
- mastery
- recommendations
- achievements

Phase 6 — Tenant Administration

Build:

- student management
- parent management
- staff
- curriculum administration
- content
- games
- challenges
- reports

Phase 7 — Platform Administration

Build:

- tenant management
- plans
- subscriptions
- platform analytics
- audit
- support tooling

Phase 8 — Social / Realtime

Build:

- friends
- messaging
- multiplayer rooms
- weekly challenges

---

36. Current Development Rule

The project must not enter uncontrolled modification cycles.

Before changing a file:

1. Read the current repository version.
2. Read the relevant database schema.
3. Verify the actual table/function/column names.
4. Make the smallest coherent change.
5. Run typecheck.
6. Run lint.
7. Run build.
8. Commit.
9. Push.
10. Verify the resulting repository state.
11. Continue to the next architectural layer.

No assumptions should be made about files, functions, routes, database columns, or database policies without verifying them against the actual repository or live Supabase schema.

---

37. Source of Truth

For database structure:

Supabase PostgreSQL schema

For frontend implementation:

Git repository

For authentication identity:

Supabase Auth

For authorization:

PostgreSQL RLS + trusted database relationships

For application routing:

React Router

For curriculum hierarchy:

grades
→ terms
→ subjects
→ units
→ lessons

For student-specific educational identity:

tenant_student_profiles

For parent-child relationships:

tenant_parent_students

For tenant membership:

tenant_memberships

For lesson progress:

lesson_progress

For games:

game_templates
→ game_definitions
→ game_definition_questions
→ questions

For game runtime:

game_sessions
→ game_session_questions
→ question_attempts

---

38. Non-Negotiable Architecture Rules

Rule 1

Curriculum is authenticated content.

Do not grant anonymous access to curriculum tables merely to make the landing page render.

Rule 2

Tenant isolation is mandatory.

Every tenant-scoped operation must respect "tenant_id".

Rule 3

The Super Admin is platform-level.

Do not treat the Super Admin as an ordinary tenant member.

Rule 4

Tenant Admin is tenant-scoped.

Its authority comes from an active "tenant_memberships" record.

Rule 5

Parents can have multiple children.

Never hard-code one-parent/one-student behavior.

Rule 6

Students use tenant-scoped educational identities.

Use "tenant_student_profiles" for student learning context.

Rule 7

RLS is authoritative.

Frontend route guards do not replace database authorization.

Rule 8

Do not duplicate the database schema in React.

The database contract is the source of truth.

Rule 9

Games must use the game engine contract.

Do not expose raw question-bank access to students.

Rule 10

Do not modify working curriculum pages without first checking their current repository implementation and database contract.

---

39. Current Status

The current repository has the curriculum navigation layer implemented:

Grades
  ↓
Terms
  ↓
Subjects
  ↓
Units
  ↓
Lessons

The current database already provides the required multi-tenant identity model:

Profiles
Tenant Memberships
Tenant Student Profiles
Tenant Parent Students

The next implementation layer is therefore:

Authentication
      ↓
Role Resolution
      ↓
Protected Routing
      ↓
Dashboards
      ↓
Student Curriculum Integration

The existing curriculum pages should be reused rather than rewritten unnecessarily.

---

40. Architectural Goal

The final platform should behave as:

                    TheTutor
                       │
             ┌─────────┴─────────┐
             │                   │
          Public              Authenticated
          Website                 │
             │                    ▼
          Landing              Role
             │                    │
             ▼          ┌────────┼────────┐
           Login         │        │        │
                        ▼        ▼        ▼
                    Platform   Tenant   Parent
                    Admin      Admin      │
                                          ▼
                                      Children
                                          
                             Student
                                │
                                ▼
                          Student Dashboard
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
              Learning                       Games
                 │                             │
        Grade → Term → Subject           Lesson / Unit /
                 → Unit → Lesson            Subject Games
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
                           Analytics
                                │
                         ┌──────┴──────┐
                         ▼             ▼
                      Student       Parent
                      Insights      Insights

This architecture preserves the existing database foundation while adding the missing application-level authentication, role-based routing, dashboards, and student learning experience.