🎓 TheTutor

Interactive Multi-Tenant Educational SaaS for Egyptian Primary Education

TheTutor is a multi-tenant educational platform designed for Egyptian primary-school students, with a strong focus on interactive learning, educational games, measurable progress, mastery, analytics, and parent visibility.

The platform is designed primarily for Grades 1–6 and can support multiple educational organizations (schools, educational centers, and other tenants), each with its own learning environment, users, curriculum, content, progress, games, and analytics.

---

🎯 Vision

TheTutor aims to transform learning from passive memorization into an interactive learning journey:

Learn
  ↓
Practice
  ↓
Play
  ↓
Measure
  ↓
Understand
  ↓
Improve

The platform combines structured curriculum content with educational games, learning analytics, mastery tracking, personalized recommendations, and parent-facing progress insights.

---

🧭 Core Architecture

TheTutor is built as a multi-tenant educational SaaS.

                    TheTutor Platform
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Tenant A         Tenant B         Tenant C
          │                │                │
       Learning         Learning         Learning
       Environment      Environment      Environment
          │                │                │
      Students         Students         Students
      Curriculum       Curriculum       Curriculum
      Games            Games            Games
      Progress         Progress         Progress
      Analytics        Analytics        Analytics

A tenant may represent:

- A school.
- An educational center.
- Another educational organization.

Tenant isolation is a security boundary.

PostgreSQL Row Level Security (RLS) is used to enforce database-level isolation.

---

🏗️ Technology Stack

Layer| Technology
Frontend| React + TypeScript
Build Tool| Vite
Styling| Tailwind CSS
Routing| React Router
Server State| TanStack Query
Runtime Validation| Zod
Backend| Python + FastAPI
Validation| Pydantic
HTTP| HTTPX
Analytics| pandas + numpy
Database| Supabase PostgreSQL
Authentication| Supabase Auth
Storage| Supabase Storage
Realtime| Supabase Realtime
Security| PostgreSQL RLS

The stack may evolve, but architectural responsibilities remain governed by the project's architecture contracts.

---

👥 Identity and Multi-Tenancy

TheTutor separates global identity from tenant-specific educational identity.

Global Authentication Identity
              │
              ▼
       Tenant Membership
              │
              ▼
   Tenant-Specific Profile
              │
              ▼
       Learning Context

A single authenticated user may belong to multiple tenants.

A student's:

- Grade
- Curriculum
- Progress
- XP
- Achievements
- Games
- Analytics
- Learning history

are associated with the appropriate tenant-specific learning context.

---

📚 Curriculum Architecture

The authoritative curriculum hierarchy is:

Tenant
  ↓
Curriculum
  ↓
Grade
  ↓
Term
  ↓
Subject
  ↓
Unit
  ↓
Lesson

This allows different tenants to operate different curricula while preserving a consistent application architecture.

The initial target is Egyptian primary education, Grades 1–6, including the Experimental Languages / language-school context.

---

📖 Learning Experience

A lesson can contain multiple educational content types:

- Text.
- Video.
- Infographic.
- Images.
- Audio.
- Interactive activities.
- Learning exercises.
- Questions.
- Supporting educational assets.

Content follows a controlled lifecycle:

Draft
  ↓
Validation
  ↓
Review
  ↓
Approved
  ↓
Published
  ↓
Archived

AI-generated content is treated as draft content until it passes the appropriate validation and review process.

---

🎮 Educational Games

Games are a core part of TheTutor.

The platform is designed to support games at multiple scopes:

Lesson Game
     ↓
Unit Game
     ↓
Subject Game
     ↓
Challenge Game
     ↓
Multiplayer Game

Games are driven by configurable game definitions, question banks, difficulty levels, sessions, attempts, scoring, XP, and analytics.

Initial difficulty levels:

Easy
Medium
Hard

The architecture is designed so additional game types can be introduced without redesigning the entire platform.

---

🔐 Critical Learning Rule

One of the most important platform invariants is:

«A student must only be tested on learning material that the student has completed.»

Question eligibility is determined by trusted backend/database logic.

Student
  ↓
Completed Learning
  ↓
Eligible Questions
  ↓
Game Scope
  ↓
Difficulty
  ↓
Game Session

The frontend cannot override this rule.

---

🛡️ Server-Authoritative Learning

The browser is not trusted to determine authoritative learning results.

The backend controls:

- Authorization.
- Tenant validation.
- Lesson completion.
- Question eligibility.
- Game session creation.
- Question selection.
- Answer validation.
- Score calculation.
- XP calculation.
- Achievement evaluation.
- Streak calculation.
- Mastery.
- Analytics.
- Recommendations.
- Content publication.
- Administrative operations.

The database enforces the underlying security model through PostgreSQL RLS.

---

📊 Progress, Mastery and Analytics

TheTutor does not treat game scores as the complete definition of learning progress.

The platform separates:

Learning Progress
      +
Game Performance
      +
Question Performance
      +
Learning Events
      ↓
Analytics
      ↓
Mastery
      ↓
Recommendations

Analytics may evaluate:

- Lesson completion.
- Accuracy.
- Concept mastery.
- Weak concepts.
- Strong concepts.
- Difficulty performance.
- Learning trends.
- XP.
- Streaks.
- Time-on-task where available.
- Question-level performance.
- Subject-level performance.

Python analytics tooling may be used for advanced analysis and aggregation.

---

🏆 Gamification

The platform supports learning-focused gamification including:

- XP.
- Levels.
- Achievements.
- Streaks.
- Leaderboards.
- Challenge participation.
- Game rewards.

XP and rewards are server-authoritative.

The client cannot directly assign itself XP, scores, achievements, or rewards.

---

👨‍👩‍👧 Parent Experience

Parents receive a dedicated experience for monitoring explicitly linked children.

The parent experience is designed around meaningful educational information rather than raw data.

Parents can eventually see:

- Lesson completion.
- Subject progress.
- Performance trends.
- Mastery.
- Strengths.
- Areas requiring improvement.
- Recent learning activity.
- Recommendations.
- Achievements.
- Relevant notifications.

Parent access is restricted to explicitly authorized children.

---

⚔️ Challenges and Multiplayer

TheTutor supports configurable educational challenges.

Challenges can define:

- Schedule.
- Time zone.
- Grade.
- Subject.
- Eligibility.
- Questions.
- Scoring.
- Ranking.
- Recurrence.

The platform also supports multiplayer educational games using Supabase Realtime for synchronization and communication.

Realtime is a delivery/synchronization mechanism — it is not the authorization boundary.

---

💬 Educational Social Features

The platform includes educational social capabilities such as:

- Friend relationships.
- Educational chat.
- Game invitations.
- Challenge participation.
- Multiplayer interaction.

Social functionality is tenant-scoped and designed around the educational purpose of the platform.

Future moderation and safety controls are part of the architecture's extensibility.

---

🤖 AI-Assisted Content

AI is used as a controlled content-production capability.

Potential AI-generated assets include:

- Lessons.
- Explanations.
- Questions.
- Activities.
- Game content.
- Supporting metadata.

The intended pipeline is:

Generation Request
       ↓
AI Generation
       ↓
Draft
       ↓
Validation
       ↓
Human / System Review
       ↓
Approval
       ↓
Publication

AI output is never assumed to be production-ready simply because it was generated successfully.

---

🏢 SaaS Model

TheTutor is designed as a SaaS platform.

Platform-level administration may manage:

- Tenants.
- Plans.
- Subscriptions.
- Tenant status.
- Platform configuration.
- Controlled support operations.

Tenant administrators manage their own educational environment according to their permissions.

A tenant administrator must never gain access to another tenant's data.

---

🔒 Security Model

Security is built into the architecture rather than added later.

Core security principles include:

Tenant Isolation

PostgreSQL RLS protects tenant-scoped data.

Authentication

Supabase Auth provides global authentication identity.

Authorization

Authorization considers:

Authentication
      ↓
Tenant Membership
      ↓
Role
      ↓
Resource Ownership
      ↓
Business Rules

Student Data

Student learning data is tenant-scoped.

Parent Data

Parents can access only explicitly linked children.

Game Security

The client cannot authoritatively determine:

Correctness
Score
XP
Rewards
Eligibility
Game Results

Question Security

Correct answers must never be exposed to normal student-facing APIs before answer evaluation.

---

🧱 Project Architecture

The project is organized around clear frontend/backend/domain boundaries.

Conceptually:

Frontend
   │
   │ HTTPS / JSON
   ▼
FastAPI
   │
   ▼
Domain Services
   │
   ▼
Repositories / Integrations
   │
   ▼
Supabase PostgreSQL
   │
   ▼
RLS

The frontend is responsible for presentation and interaction.

The backend is responsible for application business logic.

PostgreSQL is the system of record and security boundary for tenant data.

---

📂 Target Repository Structure

The architecture is evolving toward:

thetutor/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── styles/
│   ├── tests/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── db/
│   │   ├── domains/
│   │   ├── integrations/
│   │   ├── jobs/
│   │   └── schemas/
│   ├── tests/
│   └── requirements.txt
│
├── content_injector/
│
├── DATABASE_SCHEMA_MASTER_PLAN.md
├── PROJECT_ARCHITECTURE.md
├── FRONTEND_ARCHITECTURE.md
├── BACKEND_ARCHITECTURE.md
├── API_CONTRACT.md
└── README.md

The exact implementation structure may evolve without changing the underlying architectural responsibilities.

---

📐 Architecture Documents

The project uses dedicated architecture contracts.

Document| Responsibility
"DATABASE_SCHEMA_MASTER_PLAN.md"| Database model, relationships, constraints, RLS and persistence contract
"PROJECT_ARCHITECTURE.md"| Overall system architecture and responsibility boundaries
"FRONTEND_ARCHITECTURE.md"| React/frontend architecture
"BACKEND_ARCHITECTURE.md"| FastAPI/backend architecture
"API_CONTRACT.md"| Frontend ↔ Backend API communication contract
"README.md"| Project introduction, orientation and development entry point

The authority relationship is:

DATABASE_SCHEMA_MASTER_PLAN.md
              ↓
PROJECT_ARCHITECTURE.md
              ↓
 ┌────────────┴────────────┐
 ↓                         ↓
FRONTEND              BACKEND
ARCHITECTURE           ARCHITECTURE
 └────────────┬────────────┘
              ↓
       API_CONTRACT.md

Lower-level implementation documents must not contradict higher-level contracts.

---

🛠️ Development Principles

Development should follow a vertical-slice approach.

The first critical learning slice is:

Authentication
      ↓
Tenant Membership
      ↓
Student
      ↓
Curriculum
      ↓
Lesson
      ↓
Lesson Completion
      ↓
Progress
      ↓
Question Eligibility
      ↓
Game Session
      ↓
Answer Submission
      ↓
Score
      ↓
XP
      ↓
Learning Events
      ↓
Analytics

After the core learning loop is stable, the platform can expand into:

Parent Experience
Challenges
Notifications
Social
Multiplayer
AI Content
Billing
Advanced Analytics

---

🧪 Quality and Testing

The platform requires testing at multiple levels.

Unit Tests
    ↓
Integration Tests
    ↓
API Tests
    ↓
Security Tests
    ↓
End-to-End Tests

Critical security tests include:

- Cross-tenant access attempts.
- Role escalation.
- Unauthorized student access.
- Unauthorized parent-child access.
- Question-answer leakage.
- Game manipulation.
- XP manipulation.
- Score manipulation.
- Unauthorized administrative operations.

---

🚦 Development Status

The project is currently in the architecture and foundation phase.

The architecture contracts are being established before rebuilding the application implementation around them.

The intended sequence is:

Database Contract
       ↓
Project Architecture
       ↓
Frontend Architecture
       ↓
Backend Architecture
       ↓
API Contract
       ↓
Implementation
       ↓
Testing
       ↓
Deployment

Existing/legacy implementation should be audited before being replaced or removed.

---

📋 Current Architectural Priorities

1. Finalize the database contract.
2. Finalize system architecture.
3. Finalize frontend architecture.
4. Finalize backend architecture.
5. Define the API contract.
6. Rebuild the backend around the approved architecture.
7. Rebuild the frontend around the approved architecture.
8. Implement the first complete learning vertical slice.
9. Implement game/question security.
10. Implement progress and analytics.
11. Expand parent, challenge, social, multiplayer and AI capabilities.

---

🚀 Long-Term Platform Direction

TheTutor is designed to evolve beyond a basic curriculum website into an adaptive educational platform.

The long-term architecture supports:

Curriculum
    +
Interactive Content
    +
Educational Games
    +
Learning Events
    +
Analytics
    +
Mastery
    +
Recommendations
    +
Parent Insights
    +
Social Learning
    +
AI-Assisted Content

The goal is not simply to track whether a student opened a lesson.

The goal is to understand:

«What did the student learn, how well did they learn it, where are the gaps, and what should happen next?»

---

📄 License

License and distribution terms will be defined as the project approaches public release.

---

🔗 Project

TheTutor

Interactive educational SaaS platform for Egyptian primary education.

Primary target: Grades 1–6

Architecture: Multi-Tenant Educational SaaS

Frontend: React + TypeScript

Backend: Python + FastAPI

Database: Supabase PostgreSQL

Security: PostgreSQL RLS

---

TheTutor — Learn. Practice. Play. Improve.