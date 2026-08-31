TheTutor — Project Architecture

Status: FINAL
Version: 2.0
Date: 2026-08-31
Project: TheTutor
Architecture Model: React + TypeScript + Supabase
Frontend Hosting: Vercel
Backend Platform: Supabase
Database: PostgreSQL
Authentication: Supabase Auth
Authorization: PostgreSQL RLS + Database Authorization Functions
Realtime: Supabase Realtime
Storage: Supabase Storage
Server-side Integrations: Supabase Edge Functions

---

1. Purpose

This document defines the high-level technical architecture of TheTutor.

It establishes the boundaries between:

- Frontend
- Supabase backend platform
- PostgreSQL database
- Authentication
- Authorization
- Database functions
- Realtime
- Storage
- Edge Functions
- External integrations

This document is the primary system-level architecture contract.

Detailed database rules are defined in:

"DATABASE_SCHEMA_MASTER_PLAN.md"

Detailed frontend rules are defined in:

"FRONTEND_ARCHITECTURE.md"

---

2. Core Architectural Decision

TheTutor does not use a separate Python/FastAPI application backend.

The initial production architecture is:

React + TypeScript
        │
        │ HTTPS / WebSocket
        ▼
      Supabase
 ┌───────────────────────────────┐
 │ Auth                          │
 │ PostgreSQL                    │
 │ Row Level Security            │
 │ Database Functions / RPC      │
 │ Realtime                      │
 │ Storage                       │
 │ Edge Functions                │
 └───────────────────────────────┘
        │
        ▼
 External Services

The frontend is deployed through Vercel.

Supabase is the managed backend platform.

PostgreSQL is the authoritative application datastore.

---

3. Architectural Goals

The architecture is designed to provide:

1. Strong multi-tenant isolation.
2. Secure authentication.
3. Database-enforced authorization.
4. Server-authoritative learning state.
5. Server-authoritative game state.
6. Reliable educational analytics.
7. Parent/student data separation.
8. Low operational complexity.
9. Type-safe frontend/database integration.
10. Scalable realtime functionality.
11. Secure external integrations.
12. Simple deployment through GitHub and Vercel.

The architecture intentionally avoids unnecessary application-server complexity during the initial product stage.

---

4. System Components

The system consists of the following primary components:

GitHub
   │
   ▼
Vercel
   │
   ▼
React + TypeScript Frontend
   │
   ├───────────────┐
   │               │
   ▼               ▼
Supabase Auth   Supabase Platform
                    │
        ┌───────────┼───────────────┐
        │           │               │
        ▼           ▼               ▼
   PostgreSQL    Realtime        Storage
        │
        ├── RLS
        ├── Functions / RPC
        ├── Triggers
        ├── Views
        └── Analytics
                    │
                    ▼
             Edge Functions
                    │
                    ▼
            External Services

---

5. Frontend

The frontend is a React + TypeScript application.

Primary responsibilities:

- User interface.
- Navigation.
- Authentication UI.
- Session handling.
- Tenant context.
- Role-aware UI.
- Curriculum presentation.
- Lesson rendering.
- Game presentation.
- Parent dashboards.
- Student dashboards.
- Analytics presentation.
- Forms.
- Client-side validation.
- Accessibility.
- Responsive design.
- Realtime presentation.
- Error and loading states.

The frontend is not the authority for security or authoritative business state.

---

6. Frontend Technology

Initial frontend stack:

React
TypeScript
Vite
React Router
Tailwind CSS
Supabase JavaScript Client

Additional libraries may be added when justified by a concrete product requirement.

Dependencies must not introduce an alternative architectural model.

---

7. Frontend Hosting

Vercel hosts the production frontend.

Deployment flow:

Developer
   │
   ▼
GitHub
   │
   ▼
Vercel
   │
   ▼
Production Frontend
   │
   ▼
Supabase

The frontend should be automatically deployable from the main GitHub repository.

---

8. Supabase Backend Platform

Supabase provides the backend capabilities required by TheTutor.

These include:

Supabase Auth
PostgreSQL
RLS
Database Functions
RPC
Triggers
Views
Realtime
Storage
Edge Functions

There is no requirement for a separately deployed Python application server.

---

9. PostgreSQL

PostgreSQL is the source of truth for persistent application state.

It stores and manages:

- Tenants.
- Profiles.
- Memberships.
- Student identity.
- Parent/student relationships.
- Curriculum.
- Lessons.
- Content.
- Questions.
- Learning progress.
- Learning events.
- Game sessions.
- Question attempts.
- XP.
- Achievements.
- Streaks.
- Mastery.
- Analytics data.
- Recommendations.
- Challenges.
- Social data.
- Notifications.
- Other application state defined by the database contract.

The authoritative schema is defined by:

"DATABASE_SCHEMA_MASTER_PLAN.md"

---

10. Database as the Security Boundary

The database is responsible for enforcing authorization.

Security must not depend on:

React route guards
hidden buttons
client-side filters
URL parameters
local state

The database must independently verify whether an authenticated user can access a resource or perform an operation.

---

11. Row Level Security

RLS is mandatory for tenant-sensitive data.

Conceptually:

Authenticated User
       │
       ▼
Supabase Auth
       │
       ▼
Database Session
       │
       ▼
RLS Policies
       │
       ├── Tenant Membership
       ├── Role
       ├── Ownership
       └── Relationship

The frontend cannot bypass RLS.

---

12. Multi-Tenancy

TheTutor is a multi-tenant SaaS platform.

Each tenant is logically isolated.

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

Tenant isolation must be enforced by database authorization.

---

13. Tenant Context

The frontend maintains the currently selected tenant context.

However:

«A tenant ID supplied by the browser does not grant access to that tenant.»

The database validates the authenticated user's membership and authorization.

---

14. Identity Architecture

The identity model is:

Supabase Auth User
        │
        ▼
Profile
        │
        ▼
Tenant Membership
        │
        ▼
Tenant-scoped Student Identity

Student learning state must use the canonical tenant-scoped student identity defined by the database contract.

---

15. Canonical Student Identity

The canonical learning identity is tenant-aware.

Conceptually:

tenant_id
    +
profile_id
    ↓
tenant_student_profiles

Learning-state entities must not rely on an ambiguous global student identifier where tenant context is required.

This protects against cross-tenant data association.

---

16. Authorization Model

Authorization is enforced using:

- RLS policies.
- Database authorization helper functions.
- Trusted database functions/RPC.
- Tenant membership.
- Role checks.
- Ownership/relationship checks.

The frontend may use authorization state to render appropriate UI.

The database remains authoritative.

---

17. Roles

The system supports role-aware experiences.

The exact role values are defined by the database contract.

Conceptually:

Super Admin
Tenant Admin
Teacher
Parent
Student
Staff

Role checks in the frontend improve UX.

Role checks in PostgreSQL enforce security.

---

18. Authentication Flow

Authentication is handled by Supabase Auth.

User
 │
 ▼
Login / Signup
 │
 ▼
Supabase Auth
 │
 ▼
Authenticated Session
 │
 ▼
React Application
 │
 ▼
Supabase Database

The browser does not authenticate users through a custom Python API.

---

19. Session Flow

The frontend listens to Supabase Auth state changes.

Session
  │
  ├── valid → application
  │
  └── expired/signed out
          ↓
       auth state
          ↓
       protected UI

Supabase controls token/session lifecycle.

---

20. Database Access

The frontend uses the Supabase JavaScript client.

Primary access patterns:

Supabase Auth
Supabase Queries
Supabase RPC
Supabase Realtime
Supabase Storage
Supabase Edge Functions

There is no mandatory custom REST API between React and PostgreSQL.

---

21. Direct Database Operations

Direct CRUD is allowed only where:

1. The operation is appropriate for direct client access.
2. RLS protects the operation.
3. The operation does not require hidden server-side business logic.
4. No privileged secret is required.

---

22. Database RPC

Trusted database operations use PostgreSQL functions/RPC.

Examples include:

start_game()
get_game_question()
submit_game_answer()
complete_game()

These operations are server/database authoritative.

The frontend sends input and receives a controlled result.

---

23. Game Architecture

The game engine is database-authoritative.

Student
   │
   ▼
React Game UI
   │
   ▼
start_game()
   │
   ▼
PostgreSQL
   │
   ▼
Game Session
   │
   ▼
get_game_question()
   │
   ▼
Safe Question
   │
   ▼
Student Answer
   │
   ▼
submit_game_answer()
   │
   ▼
Database Evaluation
   │
   ▼
Result
   │
   ▼
complete_game()

The browser must never become the authority for game correctness.

---

24. Game Security

The following must remain protected:

Correct Answer
Answer Key
Authoritative Score
XP Calculation
Eligibility
Game Completion
Other Private Scoring Data

The frontend receives only information required for the current interaction.

---

25. Game Integrity

The database must prevent:

- Unauthorized game-session access.
- Unauthorized question access.
- Duplicate answer submission where prohibited.
- Unauthorized completion.
- Cross-student session manipulation.
- Cross-tenant access.
- Client-side score manipulation.

---

26. Curriculum Architecture

The curriculum hierarchy is:

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

The frontend reflects this hierarchy.

PostgreSQL stores the authoritative curriculum structure.

---

27. Lesson Architecture

Lessons consist of structured educational content.

Conceptually:

Lesson
 ├── Metadata
 ├── Objectives
 ├── Content
 ├── Activities
 ├── Questions
 └── Completion

The frontend renders the content using reusable content components.

---

28. Content Architecture

Content is data-driven.

The frontend should use a renderer architecture:

Content Type
      ↓
Renderer Registry
      ↓
React Component

Possible content types include:

Text
Image
Video
Infographic
Activity
Interactive Content

The database remains the source of content truth.

---

29. Content Publishing

Content may have draft/review/published states.

Only authorized published content should be exposed to student-facing experiences.

The database controls publication state.

The frontend renders the published representation.

---

30. Learning Progress

Learning progress is authoritative database state.

The frontend displays:

Lesson Progress
Unit Progress
Subject Progress
Curriculum Progress

The browser may calculate visual presentation values but must not replace authoritative progress state.

---

31. Learning Events

Learning events provide the factual basis for analytics.

Examples include:

Lesson Started
Lesson Viewed
Lesson Completed
Question Attempted
Game Started
Game Completed
Challenge Participated

The exact event model is defined in the database schema.

---

32. Analytics

Analytics are derived from authoritative database state and learning events.

The architecture supports:

Raw Learning Events
       ↓
Database Aggregation
       ↓
Analytics Read Models
       ↓
Frontend Dashboards

The frontend should not download massive raw datasets merely to calculate dashboards.

---

33. Parent Analytics

Parents may access authorized children's educational information.

Conceptually:

Parent
   ↓
Authorized Child Relationship
   ↓
Child Learning State
   ↓
Analytics

RLS and database relationships enforce access.

---

34. Student Analytics

Students may see analytics appropriate to their role.

Examples:

Progress
Mastery
XP
Achievements
Streak
Performance
Recommendations

The frontend presents database-derived information.

---

35. Mastery

Mastery is an authoritative derived learning state.

Conceptually:

Learning Activity
      ↓
Database Analytics
      ↓
Concept Mastery
      ↓
Student / Parent UI

The frontend does not independently define mastery.

---

36. Recommendations

Recommendations may be generated from learning data.

Conceptually:

Learning Data
      ↓
Database / Trusted Logic
      ↓
Recommendation
      ↓
Frontend

The frontend displays recommendations but does not treat a client-side recommendation algorithm as authoritative.

---

37. Gamification

Gamification is database-backed.

Includes:

XP
Achievements
Streaks
Levels
Rewards
Challenges
Leaderboards

Authoritative XP and achievement state is stored/derived by trusted backend/database logic.

---

38. Challenges

Challenges are database-backed learning experiences.

Eligibility and participation authorization are enforced by the backend platform.

The frontend provides:

Challenge Discovery
Challenge Details
Participation
Progress
Results

---

39. Parent/Student Separation

Parent and student experiences are separate UI surfaces.

The database enforces which child data a parent can access.

A parent must not gain access to another student's data merely by changing:

student_id
tenant_id
URL
query parameter

---

40. Realtime

Supabase Realtime is used where live synchronization provides product value.

Potential use cases:

Chat
Multiplayer Games
Presence
Challenge Updates
Notifications
Live Activity

Realtime is not the source of truth.

PostgreSQL remains authoritative.

---

41. Realtime Architecture

PostgreSQL
    │
    ▼
Realtime
    │
    ▼
Connected Clients

Clients must handle:

connect
subscribe
event
reconnect
unsubscribe

Realtime events should be reconciled with authoritative state where required.

---

42. Storage

Supabase Storage manages educational and user assets.

Examples:

Lesson Images
Videos
Infographics
Avatars
Attachments

Storage access must be protected using the appropriate Supabase policies.

---

43. Edge Functions

Supabase Edge Functions provide server-side execution where direct browser access is inappropriate.

Use cases include:

AI Providers
External APIs
Payment Providers
Webhooks
Secret-bearing Integrations
Privileged Processing

Flow:

Frontend
   ↓
Edge Function
   ↓
External Service

Secrets remain inside the server-side environment.

---

44. AI Architecture

AI is an integration capability, not a separate application backend.

Where AI is introduced:

React
  ↓
Supabase Edge Function
  ↓
AI Provider
  ↓
Controlled Result
  ↓
React

AI provider secrets must never be exposed to the browser.

AI-generated educational content should follow the project's content approval workflow before becoming authoritative published content.

---

45. External Integrations

External services must not receive secret credentials from the browser.

Preferred pattern:

Frontend
   ↓
Supabase Edge Function
   ↓
External API

Examples:

AI
Payments
Email
Webhooks
Third-party educational services

The exact integrations are implementation-dependent.

---

46. Secrets

The browser must never contain:

Supabase Service Role Key
Database Password
AI API Key
Payment Secret
Webhook Secret
Third-party Private Credential

Public client configuration may be exposed through Vite environment variables.

---

47. Environment Architecture

Frontend public configuration may include:

VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY

Privileged secrets belong in:

Supabase Edge Function Secrets

or another server-side secret store appropriate to the integration.

---

48. Type Safety

The frontend database contract must be generated from the actual Supabase schema.

Conceptually:

PostgreSQL Schema
       ↓
Supabase Type Generation
       ↓
TypeScript Database Types
       ↓
Frontend

Manual recreation of database entities in TypeScript should be avoided.

---

49. Data Access Layer

Frontend features should encapsulate Supabase access.

Conceptually:

Feature
 ├── api.ts
 ├── hooks.ts
 ├── types.ts
 ├── components/
 └── pages/

Components should not contain large, duplicated database queries.

---

50. Error Architecture

Errors should be handled at the application boundary.

Supabase Error
      ↓
Error Mapping
      ↓
Application Error
      ↓
User-facing UI

The application should distinguish:

Authentication
Authorization
Validation
Not Found
Conflict
Network
Database
Unexpected

---

51. Caching

Client caching may improve performance.

However cached state must not:

- Bypass RLS.
- Cross tenant boundaries.
- Become the authoritative source.
- Expose stale private information incorrectly.

Tenant-sensitive cache keys must include sufficient identity/context.

---

52. Performance

The system should prioritize:

Small initial bundle
Code splitting
Lazy loading
Efficient queries
Pagination
Optimized assets
Selective data fetching
Efficient realtime subscriptions

Game modules may be lazy loaded.

Analytics should use read-optimized data where available.

---

53. Accessibility

The frontend should follow accessibility best practices.

Requirements include:

- Semantic HTML.
- Keyboard navigation.
- Accessible labels.
- Visible focus.
- Appropriate contrast.
- Screen-reader support.
- Accessible game controls.
- Reduced-motion considerations.

---

54. Responsive Design

The frontend supports:

Mobile
Tablet
Desktop

Student learning experiences should be mobile-first where practical.

Administration interfaces may use denser desktop-oriented layouts.

---

55. Deployment

Production deployment is:

GitHub
   ↓
Vercel
   ↓
React Application
   ↓
Supabase

Supabase and Vercel are separate managed services connected through environment configuration and network APIs.

---

56. CI/CD

The production pipeline should verify:

Install
   ↓
Type Check
   ↓
Lint
   ↓
Test
   ↓
Build
   ↓
Deploy

A failed production build must prevent deployment.

---

57. Development Environment

Local development should reproduce the production architecture as closely as practical:

React + TypeScript
        ↓
Supabase

No local FastAPI server is required by the architecture.

---

58. Testing Strategy

The system should eventually test:

Authentication

Login
Logout
Session Recovery
Expired Session

Authorization

Tenant Isolation
Role Access
Parent/Child Access
Unauthorized Resource Access

Curriculum

Curriculum
Grade
Term
Subject
Unit
Lesson

Games

Start
Question Retrieval
Answer Submission
Completion
Recovery

Analytics

Progress
Mastery
Performance
Parent Visibility

---

59. Security Testing

Security tests must verify that a malicious client cannot:

Access another tenant
Access another student's records
Read protected answers
Modify protected learning state
Manipulate authoritative XP
Complete another user's game
Bypass RLS
Use an unauthorized RPC

---

60. Architectural Boundaries

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

Authentication
Identity
Sessions
Tokens

PostgreSQL Owns

Persistent State
Relationships
Transactions
RLS
Authoritative Learning State
Game State
Analytics Facts
Derived State

Database Functions Own

Trusted Transactions
Game Operations
Complex Database Logic
Authorization-sensitive Operations

Supabase Realtime Owns

Synchronization
Live Updates
Presence

Supabase Storage Owns

Educational Assets
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
Production Web Delivery

---

61. What Is Explicitly Not Part of the Architecture

The initial architecture does not include:

Python FastAPI backend
Django backend
Node.js application backend
Custom REST API server
Separate application server
Separate backend database
Microservice architecture
Kubernetes

These are intentionally excluded unless a future architectural decision explicitly introduces them.

---

62. Architectural Simplicity Rule

The project should not introduce infrastructure merely because it is technically possible.

A new service must have a concrete requirement that cannot be adequately handled by the existing architecture.

Preferred order:

PostgreSQL / RLS
       ↓
Database Function / RPC
       ↓
Supabase Feature
       ↓
Edge Function
       ↓
External Service

Only introduce another backend service if the requirement genuinely exceeds the capabilities of the current platform.

---

63. Source of Truth Hierarchy

When two layers disagree, authority follows this hierarchy:

PostgreSQL / Supabase
        ↑
Database Functions / RPC
        ↑
Frontend Data Layer
        ↑
React UI State

The lower layer must never override authoritative state from the higher layer.

---

64. Architecture Change Rules

Any change that modifies:

- Authentication architecture.
- Authorization architecture.
- Tenant isolation.
- Database ownership.
- Game authority.
- External integration boundaries.
- Backend platform.
- Frontend/backend communication.

must first update the appropriate architecture documentation.

Implementation should follow documentation rather than silently changing architectural boundaries.

---

65. Documentation Hierarchy

The project architecture is divided into contracts:

PROJECT_ARCHITECTURE.md
        │
        ├── DATABASE_SCHEMA_MASTER_PLAN.md
        │
        └── FRONTEND_ARCHITECTURE.md

The database document defines the data/security contract.

The frontend document defines the browser application contract.

This document defines the system-level architecture connecting them.

---

66. Final Runtime Architecture

                         ┌──────────────────┐
                         │      GitHub      │
                         │ Source Repository│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Vercel      │
                         │ React + TypeScript│
                         │       Vite       │
                         └────────┬─────────┘
                                  │
                         HTTPS / WebSocket
                                  │
                                  ▼
       ┌────────────────────────────────────────────────┐
       │                   SUPABASE                      │
       │                                                │
       │  ┌──────────────┐      ┌────────────────────┐  │
       │  │ Supabase Auth│      │ PostgreSQL         │  │
       │  │              │      │                    │  │
       │  │ Identity     │      │ Source of Truth    │  │
       │  │ Sessions     │      │ RLS                │  │
       │  └──────────────┘      │ RPC / Functions    │  │
       │                        │ Triggers            │  │
       │                        │ Views / Analytics   │  │
       │                        └─────────┬──────────┘  │
       │                                  │             │
       │  ┌──────────────┐      ┌────────▼───────────┐ │
       │  │  Realtime    │      │      Storage       │ │
       │  │              │      │                    │ │
       │  │ Live Updates │      │ Educational Assets │ │
       │  │ Multiplayer  │      │ User Assets        │ │
       │  │ Chat         │      └────────────────────┘ │
       │  └──────────────┘                             │
       │                                                │
       │  ┌──────────────────────────────────────────┐  │
       │  │            Edge Functions                │  │
       │  │                                          │  │
       │  │ AI / External APIs / Payments / Webhooks│  │
       │  └───────────────────────┬──────────────────┘  │
       └──────────────────────────┼─────────────────────┘
                                  │
                                  ▼
                         External Services

---

67. Final Architectural Statement

TheTutor is a multi-tenant educational SaaS platform built around a deliberately simple managed architecture.

The production system consists of:

React + TypeScript
        +
Vercel
        +
Supabase

Supabase provides the backend platform.

PostgreSQL is the authoritative source of truth.

Supabase Auth provides identity and sessions.

RLS provides database-enforced authorization and tenant isolation.

Database Functions/RPCs provide trusted transactional operations.

Realtime provides live synchronization.

Storage provides application assets.

Edge Functions provide controlled server-side execution for secrets and external integrations.

The frontend provides the user experience and interaction layer.

There is no separate Python/FastAPI application backend in the initial architecture.

The architecture is intentionally designed to deliver the required educational, gaming, analytics, parent, student, and multi-tenant functionality with minimal infrastructure while preserving clear security and scalability boundaries.