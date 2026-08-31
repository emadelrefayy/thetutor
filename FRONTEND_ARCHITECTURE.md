TheTutor — Frontend Architecture

Status: FINAL FRONTEND ARCHITECTURE CONTRACT
Version: 2.0
Date: 2026-08-31
Platform: TheTutor
Architecture: Multi-Tenant Educational SaaS
Frontend: React + TypeScript
Build Tool: Vite
Backend Platform: Supabase Managed Backend
Database Contract: "DATABASE_SCHEMA_MASTER_PLAN.md"
System Architecture: "PROJECT_ARCHITECTURE.md"

---

1. Document Purpose

This document is the authoritative frontend architecture contract for TheTutor.

It defines how the browser application is structured, how it communicates with Supabase, how authentication and tenant context are handled, how educational experiences are rendered, and how the frontend consumes database-backed functionality.

The frontend must conform to:

1. "DATABASE_SCHEMA_MASTER_PLAN.md"
2. "PROJECT_ARCHITECTURE.md"
3. This document

The frontend must not introduce an alternative data model, authorization model, business-logic layer, or backend architecture that conflicts with those documents.

---

2. Architectural Decision

TheTutor does not use a separate FastAPI/Python application backend in the initial architecture.

The application uses:

React + TypeScript
        │
        │ HTTPS
        ▼
Supabase
 ├── Auth
 ├── PostgreSQL
 ├── RLS
 ├── Database Functions / RPC
 ├── Realtime
 ├── Storage
 └── Edge Functions

The browser communicates directly with Supabase using the official Supabase JavaScript client.

Where an operation requires server-side secrets, external APIs, AI providers, webhooks, or other privileged processing, the frontend calls an appropriate Supabase Edge Function.

The frontend must never contain:

SUPABASE_SERVICE_ROLE_KEY
database passwords
private API keys
AI provider secrets
payment provider secrets
webhook secrets

Only the public Supabase project URL and publishable/anonymous client key appropriate to the project's Supabase configuration may be exposed to the browser.

---

3. Core Frontend Principles

3.1 Supabase Is the Application Backend Platform

There is no application-owned FastAPI server in the initial architecture.

Supabase provides:

- Authentication.
- PostgreSQL.
- Row Level Security.
- Database functions.
- Realtime.
- Storage.
- Edge Functions.
- Scheduled processing through the Supabase platform/database tooling.

The frontend is therefore a Supabase client application.

---

3.2 PostgreSQL Is the Source of Truth

The frontend must not create an independent authoritative copy of:

- Student identity.
- Tenant membership.
- Curriculum.
- Lesson completion.
- Progress.
- Question eligibility.
- Game sessions.
- Question attempts.
- Scores.
- XP.
- Achievements.
- Streaks.
- Mastery.
- Analytics.
- Parent-child relationships.

Local state may temporarily cache or display these values, but PostgreSQL remains authoritative.

---

3.3 RLS Is the Security Boundary

The frontend must never treat client-side filtering as security.

For example, this is not sufficient:

fetch all students
        ↓
filter students in React

Security must be enforced by Supabase/PostgreSQL RLS.

The frontend should request only the data required for the current user and tenant context.

---

3.4 The Frontend Is Not the Authority

The browser may:

- Display data.
- Collect input.
- Start UI flows.
- Request operations.
- Maintain temporary UI state.
- Display server-authoritative results.

The browser must not independently decide:

- Authorization.
- Tenant access.
- Question eligibility.
- Correct answers.
- Final scores.
- XP awards.
- Achievement eligibility.
- Mastery.
- Authoritative lesson completion.

---

4. Technology Stack

The initial frontend stack is:

React
TypeScript
Vite
React Router
Tailwind CSS
Supabase JavaScript Client

Additional libraries may be introduced only when they solve a concrete requirement and do not conflict with this architecture.

The application should avoid unnecessary dependencies.

---

5. Frontend Application Structure

The intended structure is domain-oriented.

frontend/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── feedback/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── tenant/
│   │   ├── student/
│   │   ├── parent/
│   │   ├── curriculum/
│   │   ├── lessons/
│   │   ├── content/
│   │   ├── questions/
│   │   ├── games/
│   │   ├── progress/
│   │   ├── mastery/
│   │   ├── gamification/
│   │   ├── analytics/
│   │   ├── recommendations/
│   │   ├── challenges/
│   │   ├── social/
│   │   ├── chat/
│   │   ├── notifications/
│   │   └── administration/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   ├── errors/
│   │   └── utils/
│   │
│   ├── hooks/
│   │
│   ├── types/
│   │
│   ├── routes/
│   │
│   ├── config/
│   │
│   ├── styles/
│   │
│   └── main.tsx
│
├── public/
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...

This is a target architecture.

Folders should be created when their functionality is implemented rather than creating empty speculative subsystems.

---

6. Supabase Client

The frontend must have a single configured Supabase client.

Conceptually:

src/lib/supabase/
    client.ts

The client uses environment variables:

VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY

The exact variable names may be adjusted to the project's Supabase client convention, but secrets must never be exposed.

The service-role key must never be used by browser code.

---

7. Generated Database Types

The frontend must use generated TypeScript types derived from the actual Supabase database schema.

Conceptually:

src/types/database.ts

The generated types are the database contract.

They must not be manually recreated to imitate database tables.

When the database contract changes:

Supabase schema
      ↓
Generate TypeScript types
      ↓
Frontend compilation
      ↓
Update affected queries

The frontend must not silently invent fields that do not exist in the database.

---

8. Authentication Architecture

Supabase Auth is the authentication authority.

Flow:

User
 │
 ▼
Supabase Auth
 │
 ▼
Authenticated Session
 │
 ▼
Supabase Client
 │
 ├── PostgreSQL queries
 ├── RPC calls
 ├── Realtime
 └── Storage

The frontend is responsible for:

- Login UI.
- Signup UI where enabled.
- Logout.
- Session state.
- Auth loading state.
- Auth error presentation.
- Redirecting unauthenticated users.

Supabase remains authoritative for authentication.

---

9. Session Management

The application must subscribe to Supabase Auth state changes.

The application must correctly handle:

INITIAL_SESSION
SIGNED_IN
SIGNED_OUT
TOKEN_REFRESHED
USER_UPDATED

The frontend must not manually manufacture authentication state.

If the session expires:

expired session
      ↓
Supabase client
      ↓
auth state change
      ↓
frontend updates
      ↓
protected UI responds appropriately

---

10. Authorization Architecture

Authentication and authorization are separate.

Authentication answers:

Who is the user?

Authorization answers:

What can this user access?

The frontend may use role/membership information to determine which UI to display.

However:

«Hiding a button is not authorization.»

Every protected database operation must still be protected by Supabase RLS and/or trusted RPC authorization.

---

11. Tenant Context

A user may belong to multiple tenants.

Therefore the frontend must maintain an explicit current tenant context.

Conceptually:

Authenticated User
       │
       ▼
Tenant Memberships
       │
       ▼
Current Tenant
       │
       ▼
Tenant-specific UI

The current tenant may be represented in application state and URL routing.

Example:

/tenant/{tenantId}/...

or an equivalent routing strategy.

The frontend must never assume that a user belongs to only one tenant.

---

12. Tenant Context Is Not a Security Mechanism

A client-supplied tenant ID must never be treated as proof of access.

For example:

/tenant/A

does not grant access to Tenant A.

Supabase RLS must verify:

authenticated user
        ↓
tenant membership
        ↓
allowed role
        ↓
resource access

The frontend only selects the context in which it operates.

The database determines whether the operation is permitted.

---

13. Role-Based UI

Initial roles include:

super_admin
tenant_admin
teacher
parent
student
staff

The frontend may provide role-specific interfaces.

Conceptually:

Student
 └── Student Dashboard

Parent
 └── Parent Dashboard

Teacher
 └── Teaching Interface

Tenant Admin
 └── Tenant Administration

Super Admin
 └── Platform Administration

A UI route guard is for user experience.

Database RLS remains the security boundary.

---

14. Routing Architecture

React Router is responsible for client-side routing.

Routes should be organized around user-facing capabilities rather than database tables.

Conceptually:

/
├── login
├── signup
│
├── app
│   ├── dashboard
│   ├── curriculum
│   ├── lessons
│   ├── games
│   ├── progress
│   ├── achievements
│   └── challenges
│
├── parent
│   ├── dashboard
│   ├── children
│   ├── progress
│   └── analytics
│
├── admin
│   ├── dashboard
│   ├── curriculum
│   ├── content
│   └── users
│
└── game
    └── :sessionId

The final route tree will be established during implementation.

---

15. Route Protection

Protected routes require an authenticated Supabase session.

Conceptually:

Route
 │
 ▼
Auth Check
 │
 ├── no session → Login
 │
 └── session
       ↓
    Application

Role-specific routes may additionally check membership/role state.

However, route protection must never replace RLS.

---

16. Data Access Architecture

Feature modules should access Supabase through small, explicit data-access functions.

Example:

features/
  lessons/
    api.ts
    hooks.ts
    components/
    pages/

A feature API should encapsulate:

- Query construction.
- RPC calls.
- Type usage.
- Error normalization.
- Pagination.
- Realtime subscriptions where needed.

Components should not contain large raw Supabase queries.

---

17. Query Principles

Queries must:

1. Select only required columns.
2. Avoid unrestricted table scans.
3. Respect tenant context.
4. Respect RLS.
5. Use database relationships deliberately.
6. Use pagination for potentially large datasets.
7. Handle loading and error states.
8. Use generated TypeScript types.

The frontend must not fetch entire tables simply to filter them locally.

---

18. Mutations

Mutations fall into two categories.

Direct CRUD

Used where direct authenticated database access is explicitly allowed by RLS.

Examples may include:

- Updating an allowed profile field.
- Updating permitted preferences.
- Creating user-owned content where allowed.

Trusted RPC

Used for authoritative business operations.

Examples:

start_game()
get_game_question()
submit_game_answer()
complete_game()

The frontend must use the trusted RPC rather than attempting to reproduce the business logic locally.

---

19. Game Architecture

The game UI is a frontend experience backed by a server-authoritative database game engine.

Flow:

Student
   │
   ▼
Game UI
   │
   ▼
start_game()
   │
   ▼
Supabase Database
   │
   ▼
Game Session
   │
   ▼
get_game_question()
   │
   ▼
Safe Question Payload
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
Safe Result

The frontend must never receive the authoritative answer key before submission.

---

20. Game UI State

The game interface may maintain temporary local state such as:

currentQuestion
selectedAnswer
questionIndex
timerDisplay
animationState
inputState

But authoritative state remains in Supabase.

The frontend must not calculate final:

score
XP
correctness
eligibility
completion

---

21. Game Session Recovery

The game UI should tolerate:

- Page refresh.
- Temporary network failure.
- Duplicate user interaction.
- Realtime reconnection where applicable.
- Session completion already recorded.

The database remains authoritative.

The frontend must reconcile its local UI state with the current database/session state.

---

22. Question Security

Student-facing queries must not expose:

correct_answer
is_correct
answer key
private scoring configuration

unless explicitly required after the answer has been evaluated and returned through a trusted operation.

The frontend question component should therefore consume a safe question DTO/type.

Conceptually:

SafeQuestion
 ├── id
 ├── question
 ├── type
 ├── options
 ├── media
 └── presentation metadata

The authoritative answer remains database-side.

---

23. Question Eligibility

The frontend must not determine whether a student is eligible for a question.

The flow is:

Student
   ↓
Completed / eligible learning material
   ↓
Database eligibility logic
   ↓
Game question selection
   ↓
Safe question

If a student manually changes a question ID in the browser request, the database must reject an unauthorized/ineligible operation.

---

24. Curriculum Architecture

The frontend reflects the authoritative curriculum hierarchy:

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

The frontend must not introduce a competing hierarchy.

Curriculum screens should progressively narrow the learning context.

Example:

Grade
  ↓
Term
  ↓
Subject
  ↓
Unit
  ↓
Lesson

---

25. Lesson Architecture

A lesson page is a content renderer.

Conceptually:

Lesson
 │
 ├── Header
 ├── Objectives
 ├── Content Blocks
 │     ├── Text
 │     ├── Video
 │     ├── Infographic
 │     ├── Activity
 │     └── Interactive Content
 │
 ├── Questions / Activities
 │
 └── Completion Action

The renderer must be driven by the database content model rather than hard-coded lesson-specific layouts.

---

26. Content Blocks

Content rendering should use a component registry.

Conceptually:

content block type
       ↓
renderer registry
       ↓
React component

Example:

text        → TextBlock
video       → VideoBlock
image       → ImageBlock
infographic → InfographicBlock
activity    → ActivityBlock

Unknown content types must fail gracefully rather than breaking the entire lesson page.

---

27. Content Versioning

The frontend must display the currently published content version.

The frontend must not independently select unpublished drafts.

Conceptually:

Lesson
  ↓
Published Content Version
  ↓
Content Blocks
  ↓
Renderer

Draft/review/publishing workflows belong to authorized database/admin operations.

---

28. Student Progress

The frontend displays progress returned from Supabase.

Examples:

Lesson Progress
Unit Progress
Subject Progress
Curriculum Progress

The frontend may calculate purely presentational values such as:

percentage width
progress bar rendering
visual status

It must not invent authoritative completion state.

---

29. Lesson Completion

The frontend may request lesson completion through the approved database operation.

The UI should represent:

not_started
in_progress
completed

The browser must not directly mutate authoritative completion state through an arbitrary client-side flag.

---

30. Parent Dashboard

Parents must only see explicitly authorized children.

Conceptually:

Parent
  ↓
Authorized Child Relationships
  ↓
Child Selector
  ↓
Child Analytics
  ↓
Learning Progress

The frontend must never fetch all students and filter them to identify a parent's children.

RLS/database relationships enforce the boundary.

---

31. Parent Analytics

The parent dashboard may display:

- Lesson progress.
- Subject performance.
- Mastery.
- Game performance.
- XP.
- Achievements.
- Streaks.
- Learning activity.
- Recommendations where available.

The frontend consumes database-backed read models/analytics.

It does not independently calculate authoritative educational analytics.

---

32. Student Dashboard

The student dashboard should provide a concise learning overview.

Potential sections:

Continue Learning
Recent Lessons
Progress
Games
XP
Achievements
Streak
Challenges
Recommendations

The final dashboard layout is a product/UI decision and may evolve without changing the database architecture.

---

33. Analytics Presentation

Analytics should be displayed using read-optimized database data.

The frontend should prefer:

analytics views
materialized/read models
aggregated tables
RPC results

where these are defined by the database contract.

It should not download large raw event datasets merely to calculate dashboards in the browser.

---

34. Mastery

Mastery is database/analytics-derived state.

The frontend displays mastery.

Examples:

Mastery score
Mastery level
Concept strengths
Concept weaknesses

The frontend must not overwrite authoritative mastery values.

---

35. Recommendations

Recommendations are server/database-derived.

The frontend may display:

Recommended Lesson
Recommended Practice
Recommended Game
Recommended Concept Review

The frontend must not pretend that a locally calculated recommendation is authoritative.

---

36. Gamification

The frontend renders:

XP
Level
Achievements
Streaks
Rewards
Leaderboards

XP history is authoritative in the database.

The UI must not increment XP locally as a final operation.

A successful game response may update the UI optimistically, but the final displayed value must reconcile with the authoritative database state.

---

37. Challenges

Challenges are database-backed learning experiences.

The frontend may display:

Available Challenges
Challenge Details
Participation
Progress
Results
Leaderboard

Eligibility and participation authorization remain database responsibilities.

---

38. Social Features

Social functionality may include:

Friends
Challenges
Leaderboards
Messaging

The frontend must use the database authorization model for all protected interactions.

No social relationship is considered valid merely because it exists in client state.

---

39. Chat and Realtime

Supabase Realtime is used where realtime synchronization is required.

Potential use cases:

Chat
Multiplayer game state
Presence
Challenge updates
Notifications

PostgreSQL remains the source of truth.

Realtime is a synchronization mechanism.

The frontend must handle:

connect
subscribe
event
reconnect
unsubscribe

without treating Realtime events as authoritative data independent of PostgreSQL.

---

40. Multiplayer Games

Multiplayer UI may synchronize through Supabase Realtime.

Conceptually:

Game UI
   │
   ├── PostgreSQL
   │      ↓
   │   authoritative state
   │
   └── Realtime
          ↓
       synchronization

The frontend must not trust another player's client state.

---

41. Storage

Educational and user assets may be stored in Supabase Storage.

The frontend should use authorized Storage access.

Examples:

lesson images
videos
infographics
avatars
attachments

Storage paths and bucket policies are security-sensitive and must conform to the Supabase security model.

The frontend must never expose private storage credentials.

---

42. Edge Functions

Edge Functions are part of the Supabase backend platform.

The frontend should call an Edge Function when an operation requires:

- Secret API keys.
- External APIs.
- AI providers.
- Payment providers.
- Webhooks.
- Server-side integrations.
- Other privileged processing that should not run in the browser.

Conceptually:

Frontend
   ↓
Supabase Edge Function
   ↓
External Service

The frontend must never call secret-bearing external APIs directly.

---

43. AI Features

AI functionality is optional and must remain controlled.

The frontend may provide interfaces for:

AI-assisted content generation
AI-assisted explanations
AI-assisted educational tools

But:

Browser
   ↓
Edge Function
   ↓
AI Provider

The browser must never contain an AI provider secret.

AI-generated educational content remains untrusted until it passes the database/content approval workflow.

---

44. Forms

Forms should:

- Validate user input for usability.
- Provide immediate feedback.
- Display server/database validation errors.
- Prevent accidental duplicate submissions.
- Handle loading states.
- Preserve accessibility.

Client validation improves UX.

It does not replace database validation.

---

45. Error Handling

The application must normalize Supabase errors into user-facing states.

Conceptually:

Supabase Error
      ↓
Error Mapper
      ↓
Application Error
      ↓
UI Message

Errors should distinguish between:

Authentication error
Authorization error
Validation error
Not found
Conflict
Network failure
Server/database failure
Unexpected error

Raw database internals should not be unnecessarily exposed to users.

---

46. Loading and Empty States

Every data-driven screen should explicitly handle:

Loading
Success
Empty
Error

Example:

Loading → skeleton/spinner
Success → content
Empty → meaningful empty state
Error → recoverable error state

The frontend must not confuse an empty dataset with a failed request.

---

47. Optimistic UI

Optimistic updates may be used only for non-authoritative presentation.

Examples:

- Button interaction.
- Animation.
- Temporary visual state.

For authoritative operations such as:

XP
score
lesson completion
game completion
achievement
mastery

the frontend must reconcile with the database result.

---

48. Caching

Client-side caching may be used for performance.

Cached data must have clear invalidation/revalidation rules.

Caching must never bypass:

- RLS.
- Authorization.
- Tenant boundaries.
- Freshness requirements for authoritative operations.

Sensitive tenant data must not be accidentally shared across tenant contexts through a global cache key.

Cache keys should include relevant tenant/user/resource identity where required.

---

49. Tenant-Safe Client State

Any client-side store/cache containing tenant-specific data must include tenant context.

Bad:

students

Preferred conceptual form:

tenant:{tenantId}:students

This reduces accidental state leakage when switching tenants.

---

50. URL and Navigation Security

The frontend must assume that users can manually modify:

URL parameters
query parameters
resource IDs
tenant IDs
game session IDs

Therefore:

URL validation

is not authorization.

The database must reject unauthorized access.

---

51. Accessibility

The frontend should target WCAG-aligned accessibility practices.

Requirements include:

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Accessible labels.
- Sufficient contrast.
- Screen-reader compatibility.
- Accessible game controls.
- Reduced-motion considerations.
- Error messages associated with inputs.

Games must not rely exclusively on color or animation to communicate state.

---

52. Responsive Design

The application must support:

Mobile
Tablet
Desktop

The student experience should be designed mobile-first because educational consumption frequently occurs on smaller screens.

Parent and administration interfaces may use more information-dense layouts where appropriate.

---

53. Performance Principles

The frontend should prioritize:

- Small initial bundles.
- Route-level code splitting.
- Lazy loading for heavy game modules.
- Optimized images.
- Efficient Supabase queries.
- Pagination.
- Avoiding unnecessary re-renders.
- Reusing fetched data.
- Avoiding large raw analytics payloads.

Games should load only the assets required for the active game.

---

54. Game Loading Strategy

Game-specific code may be lazy loaded.

Conceptually:

Student enters game
        ↓
Load game shell
        ↓
Identify game type
        ↓
Load game renderer
        ↓
Start/recover session
        ↓
Render question

This prevents all game implementations from increasing the initial application bundle.

---

55. Security Rules

The frontend must never:

1. Contain a service-role key.
2. Contain database passwords.
3. Contain private API keys.
4. Trust client-side authorization.
5. Trust client-side tenant IDs.
6. Expose question answer keys.
7. Calculate authoritative XP.
8. Calculate authoritative score.
9. Bypass approved RPC/database operations.
10. Store authoritative learning state only in local storage.

---

56. Environment Configuration

Development and production environments must use environment variables.

Example:

VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

".env" files containing secrets must not be committed.

A safe ".env.example" should document required variables without real credentials.

---

57. Deployment Architecture

The frontend is deployed on Vercel.

Conceptually:

GitHub
   │
   ▼
Vercel
   │
   ▼
TheTutor Frontend
   │
   ▼
Supabase

Vercel hosts the browser application.

Supabase provides the application backend platform.

No separate FastAPI deployment is required for the initial architecture.

---

58. Vercel Environment Variables

Production deployment must configure the Supabase public client variables in Vercel.

Only browser-safe values may use the "VITE_" public environment-variable mechanism.

Privileged secrets must remain server-side in Supabase Edge Functions or other appropriate managed infrastructure.

---

59. Build and Verification

Before deployment, the frontend must pass:

TypeScript compilation
Lint
Production build

Where tests exist:

Unit tests
Integration tests
Game-flow tests
Authentication tests

The application should also be verified in a real browser environment.

---

60. Database Contract Verification

The frontend must compile against the current generated Supabase database types.

The following must be verified before frontend implementation is considered complete:

Auth
Memberships
Tenant context
Student identity
Parent-child access
Curriculum
Lessons
Progress
Games
Questions
XP
Analytics
Realtime
Storage

---

61. Frontend-to-Database Contract

The primary browser communication pattern is:

React
  │
  ├── Supabase Auth
  │
  ├── Supabase Query
  │
  ├── Supabase RPC
  │
  ├── Supabase Realtime
  │
  └── Supabase Storage

Edge Functions are used when the operation requires a server-side execution boundary.

There is no application-specific REST API requirement in the initial architecture.

---

62. Authoritative Operations

The following operations must remain database/server authoritative:

Tenant authorization
Student eligibility
Lesson completion
Game session creation
Question selection
Answer evaluation
Score calculation
XP calculation
Achievement evaluation
Streak calculation
Mastery calculation
Analytics derivation
Parent-child authorization
Challenge eligibility
Multiplayer authoritative state

The frontend only initiates requests and renders results.

---

63. Frontend State Categories

Frontend state should be divided conceptually into:

Server State

Data originating from Supabase:

student profile
curriculum
lessons
progress
analytics
game session
challenge
notifications

Authentication State

session
user
membership
current tenant

UI State

modal
sidebar
selected tab
loading animation
temporary form values

Game Interaction State

selected answer
animation
timer display
current presentation step

The distinction prevents accidental treatment of UI state as authoritative application state.

---

64. Feature Module Contract

Each feature should preferably contain:

feature/
├── api.ts
├── hooks.ts
├── types.ts
├── components/
├── pages/
└── index.ts

Not every feature requires every file.

The goal is to keep feature-specific behavior together and reduce cross-feature coupling.

---

65. Component Architecture

Components should generally follow:

Page
 ↓
Feature Container
 ↓
Feature Components
 ↓
Reusable UI Components

Reusable UI components must not contain feature-specific business logic.

Example:

Button
Card
Modal
Table
Tabs
ProgressBar

remain generic.

---

66. Hooks

Hooks may encapsulate:

- Supabase queries.
- Realtime subscriptions.
- Auth state.
- Tenant context.
- UI behavior.
- Game presentation state.

Hooks must not bypass the database security model.

---

67. No Duplicate Business Logic

The frontend must not duplicate database business rules.

For example, if the database decides:

whether a student is eligible

the frontend may display eligibility state but must not implement a second independent eligibility algorithm.

This prevents divergence between UI behavior and authoritative state.

---

68. Observability

The frontend should provide enough information to diagnose:

- Authentication failures.
- Database query failures.
- RPC failures.
- Realtime disconnections.
- Asset-loading failures.
- Game-state synchronization problems.

Production logs must not contain:

passwords
tokens
service keys
private secrets

---

69. Testing Strategy

The frontend testing strategy should eventually cover:

Authentication

login
logout
session recovery
expired session

Authorization UX

role-based routing
tenant switching
unauthorized UI states

Curriculum

grade
term
subject
unit
lesson

Games

start
question display
answer submission
completion
recovery

Parent

authorized child
unauthorized child

Responsive UI

mobile
tablet
desktop

---

70. Tenant Isolation Testing

The frontend test suite must include scenarios where:

User belongs to Tenant A

and attempts to access:

Tenant B resource

The expected result is denial from the Supabase security layer.

The frontend must never assume that a hidden route is sufficient.

---

71. Game Security Testing

Tests should verify that a student cannot:

submit another student's session
request an unauthorized question
submit an answer twice
complete another student's session
obtain the answer key through normal question queries

These are database/security invariants, but the frontend integration must be tested against them.

---

72. Error Recovery

The frontend should provide recovery mechanisms where appropriate:

Retry
Reload
Return to dashboard
Reconnect
Resume game
Sign in again

Recovery must not silently repeat an authoritative mutation that could cause duplicate effects.

---

73. Offline and Network Failure

The initial architecture does not make the browser an offline source of truth.

If the network fails:

show connection state
preserve safe UI state
retry where appropriate
reconcile with Supabase

Authoritative game/progress mutations must not be simulated permanently offline.

---

74. Frontend Architectural Boundaries

The frontend owns:

Presentation
Interaction
Navigation
UI state
Client validation
Accessibility
Responsive behavior
Realtime presentation

Supabase owns:

Authentication
Authorization
Tenant isolation
Persistent state
Transactional operations
Game authority
Analytics facts
Derived learning state

Edge Functions own operations requiring:

Secrets
External APIs
AI
Webhooks
Privileged integrations

---

75. Final Architecture

The final runtime architecture is:

                         ┌──────────────────────┐
                         │       GitHub         │
                         │ Frontend Source      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Vercel        │
                         │ React + TypeScript   │
                         │ Vite Build           │
                         └──────────┬───────────┘
                                    │
                              HTTPS / WebSocket
                                    │
                                    ▼
        ┌────────────────────────────────────────────────────┐
        │                     SUPABASE                        │
        │                                                    │
        │  ┌──────────────┐      ┌────────────────────────┐  │
        │  │ Supabase Auth│      │ PostgreSQL             │  │
        │  │              │      │                        │  │
        │  │ Identity     │      │ Source of Truth        │  │
        │  └──────┬───────┘      │ RLS                    │  │
        │         │              │ Functions / RPC        │  │
        │         │              │ Views / Analytics      │  │
        │         │              └───────────┬────────────┘  │
        │         │                          │               │
        │  ┌──────▼───────┐      ┌──────────▼────────────┐  │
        │  │ Realtime     │      │ Storage               │  │
        │  │              │      │ Educational Assets    │  │
        │  │ Multiplayer  │      │ User Assets            │  │
        │  │ Chat         │      └────────────────────────┘  │
        │  └──────────────┘                                  │
        │                                                    │
        │  ┌──────────────────────────────────────────────┐  │
        │  │ Edge Functions                               │  │
        │  │ AI / External APIs / Webhooks / Secrets      │  │
        │  └──────────────────────────────────────────────┘  │
        └────────────────────────────────────────────────────┘

The browser is the presentation layer.

Vercel hosts the frontend.

Supabase is the managed backend platform.

PostgreSQL is the source of truth.

RLS is the primary authorization boundary.

Database Functions/RPCs provide trusted transactional operations.

Realtime provides synchronization.

Storage provides asset management.

Edge Functions provide controlled server-side execution when secrets or external services are required.

---

76. Non-Negotiable Rules

The following rules are mandatory:

1. No FastAPI/Python application backend in the initial architecture.
2. No service-role key in frontend code.
3. No database password in frontend code.
4. No client-side authorization as a security mechanism.
5. No client-side tenant isolation as a security mechanism.
6. No direct exposure of question answer keys to students.
7. No authoritative score calculation in the browser.
8. No authoritative XP calculation in the browser.
9. No authoritative mastery calculation in the browser.
10. No arbitrary lesson completion mutation from the browser.
11. No bypassing RLS through insecure database access.
12. No independent frontend database model.
13. No unrestricted loading of large raw analytics datasets.
14. No treating Realtime as the source of truth.
15. No secret-bearing external API calls directly from the browser.
16. Generated Supabase TypeScript types are the frontend database contract.
17. Every tenant-sensitive client cache/state must be tenant-aware.
18. Game operations must use the trusted database game flow.
19. Frontend implementation must remain compatible with "DATABASE_SCHEMA_MASTER_PLAN.md".
20. Architecture changes must be documented before implementation when they alter system boundaries.

---

77. Implementation Order

Frontend implementation should proceed in this order:

1. Vite + React + TypeScript foundation
        ↓
2. Supabase client
        ↓
3. Generated database types
        ↓
4. Authentication
        ↓
5. Session handling
        ↓
6. Tenant context
        ↓
7. Role-aware routing
        ↓
8. Shared UI/layout
        ↓
9. Curriculum browsing
        ↓
10. Lesson/content rendering
        ↓
11. Student progress
        ↓
12. Game engine UI
        ↓
13. XP / achievements / streak UI
        ↓
14. Parent dashboard
        ↓
15. Analytics
        ↓
16. Challenges/social/realtime
        ↓
17. Administration
        ↓
18. Production verification
        ↓
19. Vercel deployment

Features should be implemented incrementally and verified against the live Supabase contract.

---

78. Definition of Done

The frontend architecture is considered successfully implemented when:

React + TypeScript application
        ↓
Supabase authentication
        ↓
Tenant-aware authorization
        ↓
RLS-protected data access
        ↓
Curriculum
        ↓
Lessons
        ↓
Progress
        ↓
Games
        ↓
Analytics
        ↓
Parent experience
        ↓
Realtime where required
        ↓
Production build
        ↓
Vercel deployment

works without introducing a separate application backend or duplicating authoritative database logic.

---

79. Final Architectural Statement

TheTutor is a React + TypeScript application deployed on Vercel and backed directly by the Supabase platform.

The browser is responsible for presentation and interaction.

Supabase Auth provides identity.

PostgreSQL provides authoritative application state.

RLS provides tenant and resource authorization.

Database Functions/RPCs provide trusted transactional operations.

Supabase Realtime provides synchronization.

Supabase Storage provides assets.

Supabase Edge Functions provide controlled server-side execution for secrets and external integrations.

This architecture is intentionally simple for the initial product while remaining extensible for future educational, gaming, analytics, AI, and SaaS capabilities.