TheTutor — Backend Architecture

Status: FINAL BACKEND ARCHITECTURE CONTRACT
Version: 2.0
Date: 2026-08-31
Project: TheTutor
Backend Platform: Supabase Managed Backend
Database: PostgreSQL
Authentication: Supabase Auth
Authorization: PostgreSQL RLS
Server-side Logic: PostgreSQL Functions / RPC + Supabase Edge Functions
Realtime: Supabase Realtime
Storage: Supabase Storage

---

1. Purpose

This document defines the backend architecture of TheTutor.

TheTutor does not use a separate Python, FastAPI, Node.js, or other application server in the initial architecture.

Supabase is the managed backend platform.

Detailed database structure and rules are defined in:

"DATABASE_SCHEMA_MASTER_PLAN.md"

System-level architecture is defined in:

"PROJECT_ARCHITECTURE.md"

Frontend architecture is defined in:

"FRONTEND_ARCHITECTURE.md"

This document defines how the Supabase backend capabilities are used together.

---

2. Core Backend Decision

TheTutor backend:

Supabase
│
├── Auth
├── PostgreSQL
├── RLS
├── Database Functions / RPC
├── Triggers
├── Views / Analytics Read Models
├── Realtime
├── Storage
└── Edge Functions

There is no separate application backend.

---

3. Backend Responsibilities

The backend is responsible for:

- Authentication.
- Authorization.
- Tenant isolation.
- Persistent application data.
- Transactional operations.
- Learning state.
- Game state.
- Game evaluation.
- Progress.
- XP and achievements.
- Learning events.
- Analytics data.
- Parent/student access control.
- Realtime synchronization.
- File storage.
- Server-side integrations.
- Secret-bearing operations.

The frontend is responsible for presentation and interaction.

The backend remains authoritative.

---

4. Backend Architecture

The normal application flow is:

React + TypeScript
        │
        ▼
Supabase Client
        │
        ├──────────────► Supabase Auth
        │
        ├──────────────► PostgreSQL + RLS
        │
        ├──────────────► Database RPC
        │
        ├──────────────► Realtime
        │
        ├──────────────► Storage
        │
        └──────────────► Edge Functions
                              │
                              ▼
                       External Services

---

5. Supabase Auth

Supabase Auth owns authentication.

Responsibilities:

- User identity.
- Sign up.
- Sign in.
- Sign out.
- Session management.
- Token management.
- Password/authentication mechanisms supported by the selected Auth configuration.

The application database stores application profile and membership information.

Authentication credentials are not duplicated in application tables.

---

6. PostgreSQL

PostgreSQL is the primary backend datastore and source of truth.

It owns:

- Tenants.
- Profiles.
- Memberships.
- Student identities.
- Parent/student relationships.
- Curriculum.
- Lessons.
- Content.
- Questions.
- Games.
- Game sessions.
- Learning progress.
- Learning events.
- XP.
- Achievements.
- Streaks.
- Mastery.
- Analytics data.
- Recommendations.
- Challenges.
- Notifications.
- Other persistent application state defined by the database contract.

The exact schema is defined by:

"DATABASE_SCHEMA_MASTER_PLAN.md"

---

7. Row Level Security

RLS is the primary authorization boundary for database data.

Conceptually:

Authenticated User
        │
        ▼
Supabase Auth
        │
        ▼
PostgreSQL Session
        │
        ▼
RLS Policies
        │
        ├── Tenant Membership
        ├── Role
        ├── Ownership
        └── Relationship

The backend must never rely on frontend filtering for security.

---

8. Multi-Tenant Isolation

Every tenant-scoped operation must respect tenant isolation.

A user being authenticated does not automatically grant access to every tenant.

The backend determines:

Who is the user?
        ↓
Which tenant(s) can the user access?
        ↓
What role does the user have?
        ↓
Which resource is being accessed?
        ↓
Is the operation allowed?

Tenant isolation is enforced at the database authorization layer.

---

9. Database Functions / RPC

PostgreSQL Functions and RPC are used for trusted operations that should not be implemented as unrestricted client-side CRUD.

Typical examples:

start_game()
get_game_question()
submit_game_answer()
complete_game()

Additional functions may be introduced when an operation requires:

- Multiple related database writes.
- Transactional consistency.
- Authorization-sensitive logic.
- Server-authoritative calculations.
- Controlled state transitions.
- Complex database operations.

---

10. Direct CRUD vs RPC

Use direct Supabase database operations when:

Authenticated user
        ↓
RLS-protected table
        ↓
Simple permitted operation

Use RPC when:

Authenticated user
        ↓
Trusted operation
        ↓
Authorization
        ↓
Validation
        ↓
Transactional processing
        ↓
Controlled result

The frontend must not reproduce authoritative backend logic merely to avoid using RPC.

---

11. Game Backend

Games are backend-authoritative.

The browser is responsible for the game interface.

PostgreSQL is responsible for authoritative game state and evaluation.

Basic flow:

Student
   ↓
Game UI
   ↓
start_game()
   ↓
PostgreSQL
   ↓
Game Session
   ↓
Safe Question
   ↓
Student Answer
   ↓
submit_game_answer()
   ↓
Database Evaluation
   ↓
Score / Result
   ↓
XP / Learning Event

The browser must never be trusted to determine:

- Correctness.
- Final score.
- XP.
- Eligibility.
- Completion.

---

12. Question Security

Student-facing question retrieval must not expose authoritative answer keys.

The backend should return safe question data.

Conceptually:

Safe Question
├── question
├── options
├── media
└── presentation data

The authoritative answer remains protected inside the backend/database.

Answer evaluation occurs through trusted backend/database logic.

---

13. Learning Progress

Learning progress is authoritative backend state.

The backend records and/or derives:

- Lesson progress.
- Unit progress.
- Subject progress.
- Curriculum progress.
- Completion state.
- Learning events.

The frontend may display this state but does not become its authority.

---

14. Analytics

Analytics are based on authoritative learning data.

Conceptually:

Learning Events
       │
       ▼
PostgreSQL
       │
       ▼
Aggregations / Read Models
       │
       ▼
Frontend Dashboards

The frontend should not be required to download large volumes of raw learning events to calculate core analytics.

---

15. Parent Access

Parent access is controlled by backend authorization.

Conceptually:

Parent
  ↓
Parent/Student Relationship
  ↓
Authorized Student
  ↓
Student Data

Changing a student ID, tenant ID, URL, or request parameter must not bypass authorization.

RLS and trusted database logic enforce the relationship.

---

16. Realtime

Supabase Realtime provides live synchronization.

Potential uses include:

- Multiplayer games.
- Chat.
- Presence.
- Notifications.
- Challenge updates.
- Other genuinely realtime experiences.

The architecture remains:

PostgreSQL
    ↓
Realtime
    ↓
Clients

Realtime is not the authoritative datastore.

PostgreSQL remains authoritative.

---

17. Storage

Supabase Storage is responsible for application files and media.

Examples:

- Lesson images.
- Educational media.
- Infographics.
- Avatars.
- User-uploaded assets.
- Other approved educational files.

Storage access must follow the project's authorization model.

---

18. Edge Functions

Supabase Edge Functions are used when execution must happen server-side and cannot safely occur in the browser.

Primary use cases:

External APIs
AI providers
Payment providers
Webhooks
Email providers
Secret-bearing integrations
Privileged processing

Basic flow:

Frontend
   ↓
Edge Function
   ↓
External Service
   ↓
Controlled Response
   ↓
Frontend

Secrets must remain server-side.

---

19. AI Integrations

AI providers must not be called directly from browser code when doing so would expose private API credentials.

Preferred architecture:

React
  ↓
Supabase Edge Function
  ↓
AI Provider
  ↓
Validated / Controlled Result
  ↓
React

AI-generated educational content is treated as untrusted until it passes the appropriate validation/review/publishing process.

---

20. External Integrations

External integrations follow the same principle:

Browser
   ↓
Supabase Edge Function
   ↓
External Service

Private credentials must never be shipped to the browser.

Examples include:

- AI.
- Payments.
- Email.
- Webhooks.
- Third-party APIs.

---

21. Secrets

The browser must never contain:

Supabase Service Role Key
Database Password
AI API Keys
Payment Secrets
Webhook Secrets
Private Third-party Credentials

Only public client configuration required by Supabase may be exposed to browser code.

---

22. Scheduled Processing

Scheduled backend processing may be implemented using Supabase/database scheduling capabilities.

Potential uses include:

- Periodic analytics aggregation.
- Streak processing.
- Challenge lifecycle processing.
- Notification processing.
- Maintenance jobs.
- Other explicitly required scheduled operations.

Scheduled jobs must operate with controlled privileges and must not bypass the project's security model unintentionally.

---

23. Triggers

Database triggers may be used for deterministic database-side behavior such as:

- Maintaining derived database state.
- Recording required database events.
- Enforcing database invariants.
- Synchronizing tightly coupled records.

Triggers should remain focused and predictable.

Complex application workflows should not be hidden inside excessive trigger chains.

---

24. Backend Authority

The backend is authoritative for:

Authentication
Authorization
Tenant Isolation
Student Identity
Learning State
Game State
Question Evaluation
Scores
XP
Achievements
Completion
Analytics Facts
Parent Access

The frontend is never the final authority for these values.

---

25. Backend Simplicity Rule

The backend should use the simplest Supabase capability that correctly satisfies the requirement.

Preferred order:

RLS
 ↓
Direct PostgreSQL operation
 ↓
Database Function / RPC
 ↓
Database Trigger / View where appropriate
 ↓
Edge Function
 ↓
External Service

Do not create an Edge Function when PostgreSQL/RLS/RPC is sufficient.

Do not introduce another application server unless a future requirement genuinely requires one.

---

26. Backend and Frontend Boundary

The boundary is:

FRONTEND
Presentation
Interaction
Navigation
UI State
Client Validation
        │
        │ Supabase Client
        ▼
BACKEND
Authentication
Authorization
Data
Business Rules
Transactions
Learning State
Game State
Analytics
Integrations

The frontend requests operations.

The backend validates and authorizes them.

The backend returns controlled results.

---

27. Backend and Database Boundary

The database is the core of the backend.

Supabase Backend Platform
│
├── Auth
│
├── PostgreSQL
│    ├── Tables
│    ├── RLS
│    ├── Functions
│    ├── Triggers
│    └── Views
│
├── Realtime
│
├── Storage
│
└── Edge Functions

The "DATABASE_SCHEMA_MASTER_PLAN.md" remains the detailed authority for database structure.

This document does not duplicate the complete schema.

---

28. Error Handling

Backend operations must return controlled errors.

The frontend should be able to distinguish common categories such as:

Authentication Error
Authorization Error
Validation Error
Not Found
Conflict
Rate Limit
Database Error
External Service Error
Unexpected Error

Sensitive internal implementation details must not be exposed unnecessarily to users.

---

29. Performance

Backend performance should prioritize:

- Proper indexes.
- Efficient RLS policies.
- Targeted queries.
- Pagination.
- Appropriate database functions.
- Read-optimized analytics views where needed.
- Efficient Realtime subscriptions.
- Avoiding unnecessary Edge Function hops.

The frontend should request only the data it needs.

---

30. Security Principles

The backend must follow these rules:

1. Never trust the browser.
2. Never trust client-supplied tenant IDs.
3. Never expose privileged keys.
4. Enforce tenant isolation through RLS.
5. Protect sensitive operations through trusted database functions.
6. Keep answer keys protected.
7. Keep authoritative scoring server-side.
8. Validate all important state transitions.
9. Keep external-service secrets inside Edge Functions.
10. Treat Realtime as synchronization, not authority.

---

31. Initial Backend Stack

The initial backend stack is intentionally minimal:

Supabase Auth
PostgreSQL
RLS
PostgreSQL Functions / RPC
PostgreSQL Triggers
PostgreSQL Views / Analytics Read Models
Supabase Realtime
Supabase Storage
Supabase Edge Functions
Supabase Scheduling / Cron

No Python backend is required.

No separate application server is required.

---

32. Explicitly Excluded

The initial backend architecture does not include:

Python
FastAPI
Django
Node.js application server
Express
Separate REST API server
Separate backend database
Microservices
Kubernetes

These technologies may only be introduced through a future explicit architecture decision if the product develops a requirement that cannot reasonably be handled by the existing platform.

---

33. Backend Source of Truth

The backend source-of-truth hierarchy is:

PostgreSQL
    ↑
Database Functions / RPC
    ↑
Edge Functions for external/secret operations
    ↑
Frontend Requests

The frontend cannot override authoritative backend state.

---

34. Final Backend Architecture

                    React + TypeScript
                           │
                           ▼
                    Supabase Client
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Supabase Auth      PostgreSQL          Edge Functions
                           │                  │
                           │                  ▼
                           │          External Services
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
             RLS        RPC/Functions  Triggers
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                    Authoritative State
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                Realtime       Storage

---

35. Final Decision

TheTutor's backend is Supabase Managed Backend.

There is no separate Python/FastAPI backend in the initial product architecture.

The backend is intentionally kept simple:

Supabase Auth
+
PostgreSQL
+
RLS
+
RPC
+
Realtime
+
Storage
+
Edge Functions when required

This architecture provides the required authentication, authorization, tenant isolation, learning state, games, analytics, parent/student access, realtime functionality, storage, and external integrations without introducing an unnecessary application server.

Any future backend expansion must be justified by a concrete product or technical requirement and documented as an explicit architectural decision.