TheTutor — Project Architecture

Status: FINAL ARCHITECTURE CONTRACT
Version: 1.0
Date: 2026-08-31
Platform: TheTutor
Architecture: Multi-Tenant Educational SaaS
Database: Supabase PostgreSQL
Primary Backend: Python + FastAPI
Primary Frontend: React + TypeScript
Database Contract: "DATABASE_SCHEMA_MASTER_PLAN.md"

---

1. Document Purpose

This document is the authoritative system architecture contract for TheTutor.

It defines how the platform is structured above the database layer.

The architecture must support:

- Multi-tenant educational organizations.
- Egyptian primary education, Grades 1–6.
- Tenant-specific learning environments.
- Global user identity with tenant-specific memberships.
- Students, parents, tenant administrators, and platform administrators.
- Curriculum management.
- Lessons and educational content.
- Videos, infographics, activities, and interactive content.
- Question banks.
- Lesson, unit, subject, and challenge games.
- Difficulty levels.
- Student progress.
- Mastery tracking.
- XP and gamification.
- Achievements and streaks.
- Learning analytics.
- Personalized recommendations.
- Parent dashboards.
- Weekly challenges.
- Friends and educational social features.
- Chat and realtime communication.
- Multiplayer games.
- Notifications.
- AI-assisted content generation.
- SaaS subscriptions and billing.
- Auditability.
- Strong tenant isolation.
- Future extensibility.

This document is a technical contract.

Application code must conform to this architecture and to "DATABASE_SCHEMA_MASTER_PLAN.md".

---

2. Architectural Authority

The project has the following authority hierarchy:

DATABASE_SCHEMA_MASTER_PLAN.md
            │
            ▼
PROJECT_ARCHITECTURE.md
            │
            ├── BACKEND_ARCHITECTURE.md
            │
            ├── FRONTEND_ARCHITECTURE.md
            │
            └── API_CONTRACT.md

The database contract has authority over data structures.

This architecture has authority over system boundaries and responsibilities.

Backend architecture defines backend implementation.

Frontend architecture defines frontend implementation.

API Contract defines communication between frontend and backend.

No lower-level document may contradict a higher-level contract.

---

3. Core Architectural Principles

3.1 Database Contract First

The database is not an implementation detail.

It is a defined contract.

Application code must use the entities, relationships, constraints, and security model defined in:

DATABASE_SCHEMA_MASTER_PLAN.md

Do not create application-level assumptions that contradict the database model.

---

3.2 Multi-Tenancy Is a Security Boundary

TheTutor is a true multi-tenant SaaS platform.

A tenant represents an independent educational environment.

Conceptually:

Platform
│
├── Tenant A
│   ├── Users
│   ├── Students
│   ├── Curriculum
│   ├── Progress
│   ├── Games
│   └── Analytics
│
├── Tenant B
│   ├── Users
│   ├── Students
│   ├── Curriculum
│   ├── Progress
│   ├── Games
│   └── Analytics
│
└── Tenant C
    ├── Users
    ├── Students
    ├── Curriculum
    ├── Progress
    ├── Games
    └── Analytics

Tenant A must never be able to access Tenant B data.

Tenant isolation must be enforced at the database layer through PostgreSQL Row Level Security.

Frontend filtering is not security.

Backend filtering alone is not sufficient security.

---

4. Global Identity and Tenant Identity

The system separates:

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

A single global user may belong to multiple tenants.

Example:

User
│
├── Tenant A
│   └── Student Profile A
│
├── Tenant B
│   └── Student Profile B
│
└── Tenant C
    └── Parent / Staff Membership

The global authentication identity must not be treated as the student's complete educational identity.

Student progress, XP, achievements, games, analytics, and learning context must follow the appropriate tenant-scoped student identity.

---

5. High-Level System Architecture

The system is divided into the following logical layers:

┌───────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│                                                           │
│ React + TypeScript                                        │
│ Student UI | Parent UI | Admin UI | Game UI              │
└───────────────────────────────┬───────────────────────────┘
                                │
                                │ HTTPS / JSON
                                ▼
┌───────────────────────────────────────────────────────────┐
│                     API / APPLICATION                     │
│                                                           │
│ FastAPI                                                    │
│ Authentication | Authorization | Validation                │
│ REST API | Error Handling | Rate Limiting                 │
└───────────────────────────────┬───────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────┐
│                     DOMAIN SERVICES                       │
│                                                           │
│ Curriculum | Lessons | Progress | Games                  │
│ Questions | Analytics | Recommendations                   │
│ Parent | Social | Challenges | AI | Billing              │
└───────────────────────────────┬───────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────┐
│                       DATA ACCESS                          │
│                                                           │
│ Supabase Client / PostgreSQL                              │
│ Transactions | Queries | RPCs                            │
└───────────────────────────────┬───────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                      │
│                                                           │
│ PostgreSQL | Auth | Storage | Realtime                    │
│ RLS | Database Functions                                  │
└───────────────────────────────────────────────────────────┘

---

6. Technology Architecture

6.1 Frontend

Primary stack:

React
TypeScript
Vite
React Router
Tailwind CSS
Supabase JavaScript Client
Axios or equivalent HTTP client

The frontend is responsible for presentation and user interaction.

It is not the authority for security or business-critical calculations.

---

6.2 Backend

Primary stack:

Python 3.11+
FastAPI
Pydantic
Supabase Python Client
httpx
pandas
numpy

The backend is responsible for application business logic.

---

6.3 Database

Supabase
    │
    ├── PostgreSQL
    ├── Auth
    ├── Storage
    ├── Realtime
    └── RLS

PostgreSQL is the system of record.

---

7. Backend Responsibility Boundary

The backend owns business-critical operations.

These include:

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
- Mastery calculations.
- Analytics aggregation.
- Recommendation generation.
- AI content validation.
- Content publishing.
- Billing operations.
- Administrative operations.
- Audit events.

The frontend must never be trusted for these operations.

---

8. Frontend Responsibility Boundary

The frontend is responsible for:

- Rendering UI.
- User interaction.
- Navigation.
- Local UI state.
- Form presentation.
- Loading states.
- Error presentation.
- Accessibility.
- Responsive behavior.
- Realtime UI subscriptions where appropriate.
- Sending authenticated requests to the API.
- Displaying server-authoritative results.

The frontend must not independently determine:

score
XP
eligibility
mastery
lesson completion
authorization
tenant access
correct answers

---

9. Authentication Architecture

Supabase Auth is the authentication authority.

Authentication flow:

User
 │
 ▼
Supabase Auth
 │
 ▼
JWT
 │
 ▼
Frontend
 │
 │ Authorization: Bearer <token>
 ▼
FastAPI
 │
 ▼
JWT Verification
 │
 ▼
Global User Identity
 │
 ▼
Tenant Membership
 │
 ▼
Tenant Context

Authentication answers:

«Who is this user?»

Authorization answers:

«What is this user allowed to do here?»

These are separate concerns.

---

10. Tenant Context

Every authenticated request that accesses tenant data must establish a valid tenant context.

Conceptually:

Request
  │
  ├── JWT
  │
  ├── User ID
  │
  └── Tenant Context
          │
          ▼
   Membership Validation
          │
          ▼
      RLS Boundary

The backend must never blindly trust a tenant ID supplied by the client.

The server must validate that:

authenticated_user
        ↓
has membership
        ↓
in requested tenant
        ↓
with sufficient role/permissions

---

11. Authorization Model

Authorization operates at multiple levels.

Level 1 — Authentication

Is the user authenticated?

Level 2 — Tenant Membership

Does the user belong to this tenant?

Level 3 — Role

Does the user have the required role?

Level 4 — Resource Ownership

Can the user access this specific resource?

Level 5 — Business Rule

Is the requested operation valid according to platform rules?

Example:

Student
  ↓
Authenticated?
  ↓
Member of tenant?
  ↓
Owns student profile?
  ↓
Has completed lesson?
  ↓
Eligible for game?
  ↓
Allowed to start session

---

12. Core Domain Architecture

The application is divided into bounded domains.

domains/
│
├── auth/
├── tenants/
├── memberships/
├── users/
├── students/
├── parents/
├── curriculum/
├── lessons/
├── content/
├── questions/
├── games/
├── progress/
├── mastery/
├── gamification/
├── analytics/
├── recommendations/
├── challenges/
├── social/
├── realtime/
├── notifications/
├── ai/
├── billing/
└── administration/

Each domain should own its business rules.

Domains must not create circular dependencies unnecessarily.

---

13. Curriculum Architecture

The learning hierarchy is conceptually:

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
  ├── Content Blocks
  ├── Questions
  ├── Video
  ├── Infographic
  └── Activities

The exact database relationships are defined by:

DATABASE_SCHEMA_MASTER_PLAN.md

Application code must not introduce a parallel curriculum hierarchy.

---

14. Lesson Architecture

A lesson is a learning unit.

A lesson may contain:

Lesson
│
├── Introduction
├── Text
├── Video
├── Infographic
├── Interactive Content
├── Activity
├── Questions
└── Completion Evaluation

Lesson content must be represented using the database content model.

The frontend renders content blocks according to their type.

The backend controls publication and eligibility.

---

15. Lesson Completion

Lesson completion is a server-side decision.

The architecture must support:

Lesson Started
      │
      ▼
Content Viewed
      │
      ▼
Required Learning Activity
      │
      ▼
Completion Evaluation
      │
      ▼
Lesson Completed

Completion must not be determined solely by:

opening a lesson

or:

client-side button click

The completion rules must conform to the database and backend contract.

---

16. Question Bank Architecture

Questions are reusable learning assets.

A question may be associated with one or more lessons/concepts according to the database model.

Supported question types may include:

multiple_choice
true_false
single_choice
multiple_select
matching
ordering
short_answer

The architecture must remain extensible.

Question correctness must never be exposed to an untrusted client before an answer is submitted.

---

17. Non-Negotiable Question Eligibility Rule

This is a core platform invariant:

«A student must only be tested on learning material that the student has completed.»

Eligibility is calculated server-side.

Conceptually:

Student
   │
   ▼
Completed Lessons
   │
   ▼
Eligible Questions
   │
   ▼
Scope Filter
   │
   ▼
Difficulty Filter
   │
   ▼
Game Selection

Possible game scopes:

lesson
unit
subject
challenge

The backend must never select questions outside the student's eligible learning scope.

---

18. Game Architecture

The game system consists of:

Game Definition
      │
      ▼
Game Template
      │
      ▼
Game Session
      │
      ▼
Question Selection
      │
      ▼
Attempts
      │
      ▼
Score
      │
      ▼
XP / Rewards
      │
      ▼
Analytics

Games must be template-driven where possible.

A game template defines behavior and presentation requirements.

A game session represents one student's actual play instance.

---

19. Game Scopes

The platform supports:

Lesson Game
    ↓
Questions from completed lesson material

Unit Game
    ↓
Questions from eligible completed lessons in unit

Subject Game
    ↓
Questions from eligible completed lessons in subject

Challenge Game
    ↓
Questions selected according to challenge rules

The same eligibility principle applies to every scope.

---

20. Server-Authoritative Game Engine

The backend is authoritative for:

- Session creation.
- Eligible question selection.
- Question ordering where required.
- Correctness validation.
- Score calculation.
- XP calculation.
- Reward calculation.
- Session completion.
- Final results.

The client may display game state.

The client must not be trusted to calculate final results.

---

21. Answer Submission Flow

Student selects answer
        │
        ▼
Frontend
        │
        ▼
POST answer
        │
        ▼
Backend validates:
        │
        ├── authenticated?
        ├── correct tenant?
        ├── valid session?
        ├── valid question?
        ├── question belongs to session?
        └── attempt allowed?
        │
        ▼
Evaluate answer
        │
        ▼
Calculate score
        │
        ▼
Calculate XP
        │
        ▼
Record attempt
        │
        ▼
Update analytics
        │
        ▼
Return result

---

22. Score and XP Architecture

Scoring is server-authoritative.

XP must be recorded as a transaction rather than treated as an arbitrary frontend counter.

Conceptually:

Game Attempt
    │
    ▼
Score Calculation
    │
    ├── Correctness
    ├── Difficulty
    ├── Time
    └── Game Rules
    │
    ▼
XP Calculation
    │
    ▼
XP Transaction
    │
    ▼
Student XP / Level

Any formula may evolve without requiring frontend changes.

---

23. Progress Architecture

Student learning progress exists independently from game scores.

Conceptually:

Student
 │
 ├── Lesson Progress
 │
 ├── Unit Progress
 │
 ├── Subject Progress
 │
 ├── Mastery
 │
 ├── XP
 │
 ├── Achievements
 │
 └── Streaks

Game performance contributes to analytics and mastery but must not automatically be treated as lesson completion unless explicitly defined by the business rules.

---

24. Mastery Architecture

Mastery is derived from learning evidence.

Potential evidence includes:

lesson completion
question attempts
correct answers
difficulty
repeated attempts
game performance
time
historical performance

Mastery calculations belong to the backend/analytics domain.

The frontend only displays the resulting state.

---

25. Analytics Architecture

Analytics should be event/data driven.

Important learning events may include:

lesson_started
content_viewed
lesson_completed
question_answered
game_started
game_completed
achievement_earned
challenge_joined
challenge_completed

Analytics should support:

- Student performance.
- Subject performance.
- Lesson performance.
- Concept mastery.
- Weak areas.
- Strong areas.
- Progress trends.
- Engagement.
- Game performance.
- Parent insights.
- Administrative metrics.

Analytics must remain tenant-scoped.

---

26. Recommendation Architecture

Recommendations are generated from learning evidence.

Conceptually:

Learning Data
      │
      ▼
Analytics
      │
      ▼
Weak / Strong Areas
      │
      ▼
Recommendation Engine
      │
      ▼
Personalized Recommendations

Recommendations may include:

Review this lesson
Practice this concept
Try an easier game
Try a harder game
Complete unfinished content
Repeat a weak topic

Recommendations must never bypass eligibility rules.

---

27. Parent Dashboard Architecture

The parent dashboard is a read-oriented insight layer.

Flow:

Student Activity
      │
      ▼
Analytics
      │
      ▼
Parent Insight Service
      │
      ▼
Parent Dashboard API
      │
      ▼
Parent UI

The parent should see useful summaries such as:

- Lessons completed.
- Subject progress.
- Strong areas.
- Weak areas.
- Game performance.
- Recent activity.
- Learning trends.
- Recommendations.
- Achievements.

The parent must only access students to whom the parent has a valid relationship according to the database model.

---

28. Social Architecture

Social functionality is tenant-scoped unless explicitly defined as global.

Potential features:

Friends
Friend Requests
Conversations
Messages
Notifications
Multiplayer Sessions
Challenge Participation

Social access must obey:

authentication
      ↓
tenant membership
      ↓
social permission
      ↓
resource relationship

---

29. Realtime Architecture

Supabase Realtime is used for live features where appropriate.

Examples:

Chat Messages
Notifications
Friendship Updates
Multiplayer Game State
Challenge Events
Live Leaderboards

Realtime is not a replacement for the database.

Persistent state must be stored in PostgreSQL.

Realtime distributes changes/events to connected clients.

---

30. Multiplayer Architecture

Multiplayer games require server-authoritative state.

Conceptually:

Player A
    │
    ├──────────┐
    │          │
    ▼          ▼
Frontend    Frontend
    │          │
    └────┬─────┘
         ▼
   Game Session
         │
         ▼
    Server State
         │
         ▼
     PostgreSQL
         │
         ▼
      Realtime

Clients must not be able to independently declare:

winner
score
XP
game result

---

31. Weekly Challenge Architecture

The platform supports scheduled challenges.

Conceptually:

Challenge Definition
        │
        ▼
Scheduled Start
        │
        ▼
Student Eligibility
        │
        ▼
Join Challenge
        │
        ▼
Game Session
        │
        ▼
Attempts
        │
        ▼
Scoring
        │
        ▼
Leaderboard
        │
        ▼
Results

Challenge rules must be server-controlled.

---

32. AI Content Pipeline

AI-generated educational content must never be published directly.

Required pipeline:

Source / Curriculum
        │
        ▼
Generation
        │
        ▼
Schema Validation
        │
        ▼
Educational Validation
        │
        ▼
Content Review
        │
        ▼
Draft
        │
        ▼
Approval
        │
        ▼
Publish

AI-generated questions must also pass:

schema validation
+
content validation
+
difficulty validation
+
answer validation
+
curriculum alignment

AI is an assistant.

It is not the final authority for educational publishing.

---

33. Content Injector Architecture

The content injector is a controlled ingestion mechanism.

Conceptually:

Source Content
      │
      ▼
Content Injector
      │
      ▼
Normalization
      │
      ▼
Validation
      │
      ▼
Database Mapping
      │
      ▼
Draft Content
      │
      ▼
Review
      │
      ▼
Publish

The injector must not bypass:

- Database constraints.
- Tenant boundaries.
- Content validation.
- Publishing workflow.

---

34. Storage Architecture

Supabase Storage is used for managed educational assets.

Potential assets:

Images
Infographics
Avatars
Documents
Educational Media
Generated Assets

Storage paths must be tenant-aware where assets are tenant-owned.

Example:

tenant/{tenant_id}/
    curriculum/
    lessons/
    infographics/
    avatars/

Public/private access must be determined by asset sensitivity.

---

35. Notification Architecture

Notifications may originate from:

Learning Events
Game Events
Achievements
Challenges
Friendship Events
Messages
Administrative Events
Billing Events

Flow:

Domain Event
    │
    ▼
Notification Service
    │
    ▼
Notification Record
    │
    ├── In-App
    ├── Realtime
    └── External Delivery

Notifications must respect tenant and user authorization.

---

36. Billing Architecture

Billing is a platform-level domain with tenant-specific subscriptions.

Conceptually:

Platform Plans
      │
      ▼
Tenant Subscription
      │
      ▼
Subscription Status
      │
      ▼
Feature Entitlements

Billing state must not be determined by frontend state.

External payment providers must be isolated behind service interfaces.

---

37. Audit Architecture

Security-sensitive and administrative operations should be auditable.

Examples:

tenant_created
tenant_suspended
membership_created
role_changed
content_published
content_unpublished
question_updated
subscription_changed
admin_accessed_tenant
support_action_performed

Audit records must contain sufficient context to determine:

who
what
when
tenant
resource
action

---

38. Error Handling Architecture

The backend must expose consistent API errors.

Conceptually:

{
  "error": {
    "code": "LESSON_NOT_FOUND",
    "message": "Lesson not found",
    "request_id": "..."
  }
}

Errors must not expose:

- Database credentials.
- Internal secrets.
- SQL queries.
- Stack traces.
- Sensitive user information.
- Correct answers.
- Internal infrastructure details.

A request ID should be available for operational debugging.

---

39. API Architecture

The API follows resource-oriented REST principles.

Conceptual structure:

/api/v1/
│
├── auth/
├── tenants/
├── memberships/
├── students/
├── parents/
├── curriculum/
├── lessons/
├── progress/
├── questions/
├── games/
├── analytics/
├── recommendations/
├── challenges/
├── social/
├── notifications/
├── ai/
├── billing/
└── admin/

API details belong in:

API_CONTRACT.md

The API contract must define:

- Endpoint.
- Method.
- Authentication.
- Authorization.
- Request schema.
- Response schema.
- Error schema.
- Pagination.
- Filtering.
- Idempotency where required.

---

40. Request Lifecycle

Every protected API request follows this conceptual pipeline:

HTTP Request
     │
     ▼
Request ID
     │
     ▼
Authentication
     │
     ▼
Tenant Context
     │
     ▼
Authorization
     │
     ▼
Pydantic Validation
     │
     ▼
Domain Service
     │
     ▼
Data Access
     │
     ▼
Database / RLS
     │
     ▼
Domain Result
     │
     ▼
Response Schema
     │
     ▼
HTTP Response

---

41. Transaction Boundaries

Operations that modify multiple related records must use transactional boundaries.

Examples:

Submit Answer
    ├── Attempt
    ├── Score
    ├── XP Transaction
    ├── Progress
    └── Analytics Event

These operations must not leave the database in a partially updated state.

Where appropriate, PostgreSQL transactions/RPCs should be used.

---

42. Idempotency

Operations that may be retried must be designed to prevent duplicate effects.

Examples:

XP awarding
Payment webhook
Lesson completion
Achievement awarding
Challenge submission
Notification delivery

Retrying the same request must not unintentionally duplicate:

XP
transactions
payments
achievements

---

43. Security Architecture

Security must exist at multiple layers.

Frontend
   │
   ▼
HTTPS
   │
   ▼
Authentication
   │
   ▼
Backend Authorization
   │
   ▼
Tenant Context
   │
   ▼
PostgreSQL RLS
   │
   ▼
Database Constraints

Security principles:

- Least privilege.
- Defense in depth.
- Server-authoritative business logic.
- Database-level tenant isolation.
- No secret exposure to frontend.
- No trust in client-calculated scores.
- No trust in client-supplied tenant ownership.
- No exposure of correct answers.
- Strong input validation.
- Secure logging.

---

44. Secrets Management

Secrets must never be committed to Git.

Examples:

Supabase service role key
Database passwords
API keys
Payment provider secrets
AI provider keys
JWT secrets
Webhook secrets

Frontend environment variables may contain only values explicitly safe for public exposure.

Privileged Supabase credentials belong exclusively to trusted server-side environments.

---

45. Database Access Rules

Application code must not bypass the database security model.

Do not introduce arbitrary direct database access from the browser for protected business operations.

The architecture distinguishes between:

Frontend Supabase Client
    │
    ├── Auth
    └── Approved Realtime operations

Backend Supabase Client
    │
    └── Protected application operations

Service-role credentials, when required, must remain server-side.

---

46. Caching Architecture

Caching may be introduced only where correctness is preserved.

Safe candidates may include:

Published curriculum metadata
Static configuration
Public content
Non-sensitive reference data

Do not cache tenant-sensitive data without tenant-aware cache keys.

Do not cache security decisions indefinitely.

Do not allow cached responses to cross tenant boundaries.

---

47. Observability

The system should provide:

Structured Logging
Metrics
Error Tracking
Request IDs
Health Checks
Database Monitoring
Performance Monitoring

Important metrics include:

API latency
API error rate
database latency
game completion rate
lesson completion rate
question accuracy
AI pipeline failures
Realtime connection health

---

48. Health Checks

The backend should expose health information at appropriate endpoints.

Conceptually:

/health
/health/ready

Health checks should distinguish between:

process alive

and:

dependencies ready

Sensitive infrastructure details must not be exposed publicly.

---

49. Deployment Architecture

Recommended production topology:

                    Internet
                       │
                       ▼
                  Vercel / CDN
                       │
                       ▼
                React Frontend
                       │
                       │ HTTPS
                       ▼
              FastAPI Backend
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Supabase API         External APIs
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
 PostgreSQL Auth   Storage
     │
     ▼
  Realtime

The exact hosting provider for the backend may evolve without changing the domain architecture.

---

50. Environment Separation

The project should support distinct environments:

development
staging
production

Each environment should have independently managed configuration and credentials.

Production data must never be casually used in development.

---

51. Testing Architecture

Testing must exist at multiple levels.

Unit Tests

Test:

business rules
score calculation
XP calculation
eligibility
mastery
recommendations
validators

Integration Tests

Test:

API + database
authentication
RLS
tenant isolation
transactions

End-to-End Tests

Test:

login
lesson flow
lesson completion
game flow
parent dashboard
admin workflows

Security Tests

Test:

cross-tenant access
role escalation
unauthorized resource access
correct-answer leakage
service-role misuse

Tenant isolation tests are mandatory.

---

52. Performance Principles

The system should prioritize:

- Indexed foreign keys.
- Proper pagination.
- Efficient question selection.
- Avoiding N+1 queries.
- Batch analytics queries.
- Database-side aggregation where appropriate.
- Controlled Realtime subscriptions.
- Lazy loading of heavy frontend assets.
- CDN delivery for static assets.

Performance optimizations must never weaken authorization.

---

53. Extensibility Principles

The architecture must support future additions without redesigning the core.

Examples:

New Game Type
New Question Type
New Achievement
New Recommendation Strategy
New AI Provider
New Payment Provider
New Notification Channel
New Tenant Feature
New Analytics Metric

Prefer:

interfaces
configuration
templates
domain services
database extensibility

over hard-coded conditional logic throughout the application.

---

54. Dependency Direction

Dependencies should flow inward.

Preferred:

Presentation
    │
    ▼
API
    │
    ▼
Domain Services
    │
    ▼
Data Access
    │
    ▼
Database

Avoid:

Database → Frontend
Frontend → Database business rules
Domain → UI

The domain layer must remain independent from presentation concerns.

---

55. Repository Architecture

The target repository should evolve toward a structure similar to:

TheTutor/
│
├── DATABASE_SCHEMA_MASTER_PLAN.md
├── PROJECT_ARCHITECTURE.md
├── FRONTEND_ARCHITECTURE.md
├── BACKEND_ARCHITECTURE.md
├── API_CONTRACT.md
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── domains/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   │
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   └── types/
│   │
│   └── tests/
│
├── content_injector/
│   ├── sources/
│   ├── validators/
│   ├── transformers/
│   ├── loaders/
│   └── tests/
│
└── docs/

This is a target architecture.

Existing legacy files must not automatically be preserved merely because they exist.

Before deleting or replacing legacy code, perform an implementation audit.

---

56. Legacy Code Policy

The existing repository may contain code that predates this architecture.

Legacy code must be classified as:

KEEP
REFACTOR
REPLACE
DELETE

No legacy implementation is authoritative merely because it currently works.

The database contract and architecture documents are authoritative.

---

57. Migration Strategy

The project should not attempt to rebuild every feature simultaneously.

Recommended sequence:

1. Database Contract
        ↓
2. Project Architecture
        ↓
3. Backend Architecture
        ↓
4. Frontend Architecture
        ↓
5. API Contract
        ↓
6. Database Implementation / Verification
        ↓
7. Backend Foundation
        ↓
8. Frontend Foundation
        ↓
9. Curriculum
        ↓
10. Lesson Progress
        ↓
11. Question Bank
        ↓
12. Game Engine
        ↓
13. Analytics
        ↓
14. Parent Dashboard
        ↓
15. Social / Realtime
        ↓
16. AI Pipeline
        ↓
17. Billing
        ↓
18. Production Hardening

---

58. Minimum Viable Core

The first production-capable learning loop should be:

Authentication
    ↓
Tenant Context
    ↓
Student
    ↓
Curriculum
    ↓
Lesson
    ↓
Content
    ↓
Lesson Progress
    ↓
Completion
    ↓
Eligible Questions
    ↓
Game Session
    ↓
Answer
    ↓
Score
    ↓
XP
    ↓
Analytics

This is the platform's core learning loop.

Everything else should build around it.

---

59. Critical Invariants

The following rules are mandatory.

Invariant 1 — Tenant Isolation

A user cannot access another tenant's protected data.

Invariant 2 — Server Authority

The client cannot determine authoritative score, XP, mastery, or authorization.

Invariant 3 — Question Eligibility

A student cannot receive questions from lessons the student has not completed.

Invariant 4 — Correct Answer Protection

Correct answers must not be exposed to the client before answer evaluation.

Invariant 5 — Parent Authorization

A parent can access only legitimately linked students.

Invariant 6 — Transactional Rewards

XP/reward operations must be protected against duplicate execution.

Invariant 7 — Database Contract

Application code must conform to the database schema contract.

Invariant 8 — RLS

Tenant isolation must be enforced at PostgreSQL/RLS level.

Invariant 9 — Secrets

Secrets must never be committed to the repository.

Invariant 10 — Auditability

Sensitive administrative operations must be traceable.

---

60. Architecture Decision Summary

TheTutor uses:

Multi-Tenant SaaS
        +
Global Identity
        +
Tenant Membership
        +
Tenant-Scoped Learning Profiles
        +
React / TypeScript
        +
FastAPI / Python
        +
Supabase PostgreSQL
        +
Supabase Auth
        +
Supabase Storage
        +
Supabase Realtime
        +
PostgreSQL RLS
        +
Server-Authoritative Game Engine
        +
Event-Based Learning Analytics
        +
Controlled AI Content Pipeline

The architecture deliberately separates:

Authentication
Authorization
Presentation
Business Logic
Data Access
Persistence
Realtime
Analytics
AI
Billing

This separation is required for maintainability, security, and future scalability.

---

61. Definition of Done for Architecture

This architecture is considered implemented only when:

- [ ] Database implementation matches "DATABASE_SCHEMA_MASTER_PLAN.md".
- [ ] Tenant isolation is enforced through RLS.
- [ ] Authentication is implemented through Supabase Auth.
- [ ] Tenant membership is validated server-side.
- [ ] Backend domain boundaries exist.
- [ ] Frontend architecture follows its dedicated contract.
- [ ] API contract exists and matches backend implementation.
- [ ] Game scoring is server-authoritative.
- [ ] Question eligibility is server-authoritative.
- [ ] Correct answers are protected.
- [ ] XP transactions are idempotent/transaction-safe.
- [ ] Parent access is relationship-based.
- [ ] Realtime features are tenant-safe.
- [ ] AI content passes validation before publication.
- [ ] Secrets are excluded from Git.
- [ ] Cross-tenant security tests exist.
- [ ] Core learning loop passes end-to-end tests.

---

62. Mandatory Rule for AI Coding Agents

Any AI coding agent working on TheTutor MUST:

1. Read "DATABASE_SCHEMA_MASTER_PLAN.md".
2. Read "PROJECT_ARCHITECTURE.md".
3. Read the relevant architecture contract before modifying that layer.
4. Inspect existing implementation before changing it.
5. Never invent database tables or columns without updating the database contract first.
6. Never bypass RLS for convenience.
7. Never move business-critical logic into the frontend.
8. Never expose correct answers to the client.
9. Never trust client-calculated scores or XP.
10. Never introduce cross-tenant data access.
11. Run relevant tests after modifications.
12. Report detected architectural contradictions.
13. Avoid unnecessary rewrites.
14. Preserve working functionality unless it contradicts the architecture.
15. Treat security invariants as non-negotiable.

---

63. Next Architecture Documents

After this document is committed and reviewed, the next documents are:

FRONTEND_ARCHITECTURE.md
        ↓
BACKEND_ARCHITECTURE.md
        ↓
API_CONTRACT.md

The Frontend Architecture must describe the actual React application structure and UI/data-flow boundaries.

The Backend Architecture must describe FastAPI modules, domain services, repositories, authentication, authorization, game engine, analytics, AI pipeline, and database access.

The API Contract must then formalize the communication between them.

---

END OF PROJECT ARCHITECTURE