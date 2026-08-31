TheTutor

TheTutor is a multi-tenant educational SaaS platform designed to provide structured learning, interactive lessons, educational games, progress tracking, analytics, and parent/student experiences.

The initial production architecture is intentionally simple:

React + TypeScript
        +
Vercel
        +
Supabase

There is no separate Python/FastAPI application backend.

Supabase provides the managed backend platform, while PostgreSQL is the authoritative source of truth.

---

1. Project Status

Current Phase: Architecture and foundation
Implementation Status: Pre-production / implementation preparation
Architecture Status: Defined
Database Architecture: Defined
Frontend Architecture: Defined
Backend Architecture: Defined

The project is currently being prepared for implementation from a clean architectural baseline.

---

2. Product Goals

TheTutor is designed to provide:

- Structured educational content.
- Curriculum-based learning.
- Interactive lessons.
- Educational games.
- Student progress tracking.
- Learning analytics.
- Mastery tracking.
- Gamification.
- Challenges.
- Parent dashboards.
- Student dashboards.
- Multi-tenant educational environments.
- Secure authentication and authorization.
- Realtime features where appropriate.

The platform is designed to support both learning experiences and administrative/parent visibility while maintaining strict tenant isolation.

---

3. Core Architecture

The production architecture is:

                         GitHub
                           │
                           ▼
                         Vercel
                           │
                           ▼
                 React + TypeScript
                           │
                           ▼
                    Supabase Client
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Supabase Auth      PostgreSQL        Edge Functions
                           │                  │
                    ┌──────┼──────┐           ▼
                    │      │      │    External Services
                    ▼      ▼      ▼
                   RLS    RPC   Triggers
                    │
                    ▼
             Authoritative State
                    │
             ┌──────┴──────┐
             ▼             ▼
         Realtime       Storage

---

4. Architecture Principles

TheTutor follows these core principles:

1. Supabase is the managed backend platform.
2. PostgreSQL is the authoritative data source.
3. RLS is the primary database authorization boundary.
4. The browser is never trusted with authoritative state.
5. Games are server/database authoritative.
6. Tenant isolation is enforced at the database layer.
7. Privileged secrets never reach the browser.
8. Edge Functions are used only where server-side execution is required.
9. The simplest Supabase capability should be preferred when it satisfies the requirement.
10. Architecture should remain simple until real requirements justify additional infrastructure.

---

5. Technology Stack

Layer| Technology
Frontend| React
Language| TypeScript
Build Tool| Vite
Routing| React Router
Styling| Tailwind CSS
Frontend Hosting| Vercel
Backend Platform| Supabase
Database| PostgreSQL
Authentication| Supabase Auth
Authorization| PostgreSQL RLS
Trusted Database Logic| PostgreSQL Functions / RPC
Database Automation| PostgreSQL Triggers
Analytics Read Models| PostgreSQL Views / Aggregations
Realtime| Supabase Realtime
File Storage| Supabase Storage
Server-side Integrations| Supabase Edge Functions
Scheduling| Supabase/database scheduling capabilities

---

6. No Separate Application Backend

The initial architecture does not contain:

Python
FastAPI
Django
Express
Node.js application server
Separate REST API server
Separate backend database

The backend is provided by Supabase.

The application communicates with Supabase through the Supabase client and approved server-side capabilities.

---

7. Repository Architecture

The project documentation is organized around four primary architecture contracts:

DATABASE_SCHEMA_MASTER_PLAN.md
        │
        ▼
PROJECT_ARCHITECTURE.md
        │
        ├───────────────┐
        ▼               ▼
FRONTEND_ARCHITECTURE.md
                        │
                        ▼
BACKEND_ARCHITECTURE.md

The responsibilities are:

"DATABASE_SCHEMA_MASTER_PLAN.md"

Defines:

- Database structure.
- Tables.
- Relationships.
- Constraints.
- Tenant isolation.
- RLS.
- Database functions.
- Analytics data.
- Learning data.
- Game data.
- Security boundaries.

"PROJECT_ARCHITECTURE.md"

Defines the system-level architecture and how the major components interact.

"FRONTEND_ARCHITECTURE.md"

Defines:

- React application architecture.
- Routing.
- UI structure.
- Feature organization.
- Supabase client usage.
- Frontend state.
- Games UI.
- Analytics UI.
- Parent/student experiences.

"BACKEND_ARCHITECTURE.md"

Defines:

- Supabase backend responsibilities.
- Auth.
- PostgreSQL.
- RLS.
- RPC.
- Realtime.
- Storage.
- Edge Functions.
- Backend security boundaries.

---

8. Database

PostgreSQL is the source of truth for persistent application state.

The database stores and manages the platform's authoritative data, including:

- Tenants.
- Profiles.
- Memberships.
- Student identities.
- Parent/student relationships.
- Curriculum.
- Lessons.
- Educational content.
- Questions.
- Game sessions.
- Learning progress.
- Learning events.
- XP.
- Achievements.
- Streaks.
- Mastery.
- Analytics.
- Recommendations.
- Challenges.
- Notifications.
- Other application state defined by the database contract.

The complete database design is defined in:

"DATABASE_SCHEMA_MASTER_PLAN.md"

---

9. Authentication

Authentication is handled by Supabase Auth.

Basic flow:

User
  ↓
Supabase Auth
  ↓
Authenticated Session
  ↓
React Application
  ↓
Supabase

The application does not implement a custom authentication server.

---

10. Authorization

Authorization is enforced primarily through PostgreSQL RLS.

The frontend may hide or show UI based on role and permissions for usability.

However:

«Frontend authorization is not a security boundary.»

The database independently verifies access.

---

11. Multi-Tenancy

TheTutor is a multi-tenant SaaS platform.

Conceptually:

Platform
 ├── Tenant A
 │    ├── Users
 │    ├── Students
 │    ├── Curriculum
 │    └── Learning Data
 │
 ├── Tenant B
 │    ├── Users
 │    ├── Students
 │    ├── Curriculum
 │    └── Learning Data
 │
 └── Tenant C
      ├── Users
      ├── Students
      ├── Curriculum
      └── Learning Data

Tenant isolation is enforced at the database layer.

A client-supplied tenant ID does not grant access to that tenant.

---

12. Learning Architecture

The learning hierarchy is based on the curriculum model defined by the database contract.

Conceptually:

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

Learning progress is stored and/or derived from authoritative database state.

---

13. Educational Content

The frontend uses a data-driven content architecture.

Conceptually:

Content Data
     ↓
Content Type
     ↓
Renderer
     ↓
React Component

This allows educational content to be represented as structured data while keeping rendering reusable.

---

14. Educational Games

Games are part of the core learning architecture.

The game UI runs in React.

Authoritative game operations run through Supabase.

Basic flow:

Student
   ↓
Game UI
   ↓
start_game()
   ↓
Game Session
   ↓
Question
   ↓
Student Answer
   ↓
submit_game_answer()
   ↓
Database Evaluation
   ↓
Result
   ↓
XP / Progress / Learning Event

The browser must not be trusted to determine:

- Correct answers.
- Final score.
- XP.
- Completion.
- Eligibility.
- Other authoritative game state.

---

15. Learning Analytics

Analytics are based on authoritative learning data.

Conceptually:

Learning Events
       ↓
PostgreSQL
       ↓
Aggregation / Read Models
       ↓
Analytics
       ↓
Frontend Dashboards

The platform supports analytics for appropriate user experiences, including student and parent dashboards.

The frontend should not need to download large raw datasets merely to calculate core analytics.

---

16. Parent Experience

Parents may access authorized student information.

The authorization model is:

Parent
  ↓
Authorized Relationship
  ↓
Student
  ↓
Learning Data
  ↓
Analytics

Changing a URL, query parameter, student ID, or tenant ID must not bypass authorization.

---

17. Student Experience

Students may access learning experiences appropriate to their identity and authorization.

Examples include:

- Lessons.
- Activities.
- Games.
- Progress.
- Mastery.
- XP.
- Achievements.
- Streaks.
- Challenges.
- Recommendations.

---

18. Realtime

Supabase Realtime is used only where live synchronization provides meaningful product value.

Potential use cases include:

- Multiplayer games.
- Chat.
- Presence.
- Notifications.
- Challenge updates.
- Live activity.

PostgreSQL remains the source of truth.

Realtime is a synchronization mechanism, not the authoritative datastore.

---

19. Storage

Supabase Storage handles application assets such as:

- Lesson images.
- Educational media.
- Infographics.
- Avatars.
- Attachments.
- Other approved educational assets.

Storage access follows the application's authorization model.

---

20. Edge Functions

Supabase Edge Functions are used for operations that require server-side execution.

Examples:

- AI provider calls.
- Payment integrations.
- External APIs.
- Webhooks.
- Email providers.
- Secret-bearing operations.
- Privileged external processing.

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

Private credentials remain server-side.

---

21. Secrets

The browser must never contain:

Supabase Service Role Key
Database Password
AI API Keys
Payment Secrets
Webhook Secrets
Private Third-party Credentials

Only public client configuration required by the frontend may be exposed.

---

22. Type Safety

The frontend database types should be generated from the actual Supabase schema.

Conceptually:

PostgreSQL
    ↓
Supabase Type Generation
    ↓
TypeScript Database Types
    ↓
React Application

The frontend should not manually recreate the database schema when generated types can be used.

---

23. Frontend ↔ Backend Communication

The primary communication path is:

React
  ↓
Supabase Client
  ↓
Supabase

Depending on the operation, the frontend may use:

Supabase Auth
Supabase Database Queries
Supabase RPC
Supabase Realtime
Supabase Storage
Supabase Edge Functions

There is no mandatory custom REST API layer.

---

24. Security Model

Security is based on:

Supabase Auth
       +
PostgreSQL RLS
       +
Database Authorization Functions
       +
Trusted RPC
       +
Server-side Edge Functions

Important principles:

- Never trust the browser.
- Never trust client-supplied tenant IDs.
- Protect tenant boundaries.
- Protect parent/student relationships.
- Protect game answer keys.
- Keep authoritative calculations server-side.
- Keep private credentials server-side.

---

25. Performance

The system should prioritize:

- Efficient PostgreSQL queries.
- Appropriate indexes.
- Efficient RLS policies.
- Pagination.
- Selective data fetching.
- Code splitting.
- Lazy loading.
- Optimized media.
- Efficient Realtime subscriptions.
- Read-optimized analytics where needed.

Infrastructure should remain proportional to actual requirements.

---

26. Deployment

Production deployment follows:

GitHub
   ↓
Vercel
   ↓
React + TypeScript
   ↓
Supabase

Vercel hosts and delivers the frontend.

Supabase provides the managed backend capabilities.

---

27. Development

The development architecture mirrors production:

React + TypeScript
        ↓
Supabase

No local Python/FastAPI application server is required.

---

28. Testing

Testing should cover:

Authentication

- Sign in.
- Sign out.
- Session recovery.
- Expired sessions.

Authorization

- Tenant isolation.
- Role restrictions.
- Parent/student access.
- Unauthorized resource access.

Learning

- Curriculum.
- Lessons.
- Progress.
- Completion.

Games

- Game creation.
- Question retrieval.
- Answer submission.
- Evaluation.
- Completion.
- Recovery.

Analytics

- Progress.
- Mastery.
- Performance.
- Parent visibility.

---

29. Architecture Change Policy

Architectural changes must be documented before implementation.

Changes affecting:

- Authentication.
- Authorization.
- Tenant isolation.
- Database authority.
- Game authority.
- Backend platform.
- Frontend/backend boundaries.
- External integrations.

must update the appropriate architecture documentation.

---

30. Simplicity Rule

TheTutor intentionally avoids unnecessary backend infrastructure.

Preferred backend decision order:

RLS
 ↓
Direct PostgreSQL Operation
 ↓
Database Function / RPC
 ↓
Trigger / View where appropriate
 ↓
Edge Function
 ↓
External Service

A new infrastructure component should only be introduced when the existing architecture cannot reasonably satisfy the requirement.

---

31. Architecture Boundaries

Frontend Owns

Presentation
Interaction
Navigation
UI State
Client Validation
Accessibility
Responsive Design
Realtime Presentation

Supabase Auth Owns

Identity
Authentication
Sessions
Tokens

PostgreSQL Owns

Persistent State
Relationships
RLS
Authoritative Learning State
Game State
Analytics Facts
Derived State

Database Functions Own

Trusted Transactions
Complex Database Operations
Game Operations
Authorization-sensitive Operations

Realtime Owns

Live Synchronization
Presence
Live Events

Storage Owns

Application Assets
Educational Media
User Assets

Edge Functions Own

Secrets
External Integrations
AI
Webhooks
Privileged Server-side Processing

Vercel Owns

Frontend Hosting
Builds
Deployments
Web Delivery

---

32. Explicitly Excluded from Initial Architecture

The following are not part of the initial TheTutor architecture:

Python Backend
FastAPI
Django
Node.js Application Server
Express
Separate REST API
Separate Application Database
Microservices
Kubernetes

They should not be introduced without an explicit future architecture decision.

---

33. Documentation References

The main architecture documents are:

README.md
PROJECT_ARCHITECTURE.md
FRONTEND_ARCHITECTURE.md
BACKEND_ARCHITECTURE.md
DATABASE_SCHEMA_MASTER_PLAN.md

These documents must remain consistent.

When a technical decision changes the architecture, the relevant documentation must be updated before implementation continues.

---

34. Final Architecture

TheTutor's initial production architecture is:

                     THE TUTOR
                         │
                         ▼
                React + TypeScript
                         │
                         ▼
                       Vercel
                         │
                         ▼
                     Supabase
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
       Auth         PostgreSQL       Edge Functions
                         │                │
                   ┌─────┼─────┐          ▼
                   ▼     ▼     ▼     External Services
                  RLS   RPC  Triggers
                         │
                ┌────────┴────────┐
                ▼                 ▼
            Realtime           Storage

The architectural model is intentionally simple:

React + TypeScript for the application experience.

Vercel for frontend deployment.

Supabase for the managed backend platform.

PostgreSQL for authoritative application state.

RLS for database-level authorization and tenant isolation.

RPC/Database Functions for trusted transactional operations.

Realtime for live synchronization.

Storage for assets.

Edge Functions for secrets and external integrations.

There is no separate Python/FastAPI backend in the initial architecture.