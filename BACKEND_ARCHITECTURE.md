TheTutor — Backend Architecture

Status: FINAL BACKEND ARCHITECTURE CONTRACT
Version: 1.0
Date: 2026-08-31
Platform: TheTutor
Backend: Python + FastAPI
Database: Supabase PostgreSQL
Authentication: Supabase Auth
Database Contract: "DATABASE_SCHEMA_MASTER_PLAN.md"
System Contract: "PROJECT_ARCHITECTURE.md"
Frontend Contract: "FRONTEND_ARCHITECTURE.md"

---

1. Document Purpose

This document defines the authoritative backend architecture for TheTutor.

It specifies:

- Backend technology stack.
- Application structure.
- API architecture.
- Authentication.
- Authorization.
- Tenant context.
- Domain boundaries.
- Service architecture.
- Repository/data-access architecture.
- Database interaction.
- RLS interaction.
- Curriculum services.
- Lesson services.
- Content services.
- Question services.
- Game engine architecture.
- Progress services.
- Mastery.
- Gamification.
- Analytics.
- Recommendations.
- Challenges.
- Multiplayer.
- Social features.
- Notifications.
- AI content generation.
- Billing.
- Background jobs.
- Realtime integration.
- Error handling.
- Validation.
- Security.
- Observability.
- Testing.
- Deployment.
- Performance.
- Migration strategy.

This document defines backend responsibilities.

It does not redefine the database schema.

It does not replace the API contract.

It does not permit business logic to bypass the database security model.

---

2. Architectural Authority

The backend follows this authority hierarchy:

DATABASE_SCHEMA_MASTER_PLAN.md
              │
              ▼
PROJECT_ARCHITECTURE.md
              │
              ├── FRONTEND_ARCHITECTURE.md
              │
              └── BACKEND_ARCHITECTURE.md
                           │
                           ▼
                    API_CONTRACT.md

The database contract is authoritative for:

Entities
Relationships
Constraints
Tenant scope
RLS
Persistence model

The project architecture is authoritative for:

System boundaries
Technology choices
Responsibility boundaries

The backend architecture is authoritative for:

Backend implementation structure
Domain boundaries
Service boundaries
Application flow
Security flow

The API contract is authoritative for:

Frontend ↔ Backend communication
Request schemas
Response schemas
Error schemas
HTTP semantics

No lower-level implementation may contradict a higher-level contract.

---

3. Backend Core Principles

The backend follows these principles:

1. Server-authoritative business logic.
2. Database-enforced tenant isolation.
3. Explicit authentication.
4. Explicit authorization.
5. Tenant context on tenant-scoped operations.
6. Domain-driven service boundaries.
7. Thin API routes.
8. Validated input.
9. Typed responses.
10. Transactional writes where required.
11. Idempotency for retryable operations.
12. Auditable business-critical operations.
13. No client trust.
14. No secrets exposed to clients.
15. Explicit error handling.
16. Testable domain services.
17. No uncontrolled database access from route handlers.
18. Background processing for expensive work.
19. Realtime as a delivery mechanism, not a security boundary.
20. Database remains the system of record.

---

4. Backend Responsibility

The backend owns:

Authentication integration
Authorization
Tenant validation
Membership validation
Resource authorization
Business rules
Lesson completion
Question eligibility
Question selection
Game sessions
Answer validation
Score calculation
XP calculation
Achievement evaluation
Streak calculation
Mastery
Analytics aggregation
Recommendations
Challenge rules
Multiplayer state
Social authorization
Notifications
AI content workflows
Content publishing
Billing operations
Audit events

The frontend only requests these operations and displays the results.

---

5. Backend Technology Stack

Primary stack:

Python 3.11+
FastAPI
Pydantic
Supabase Python Client
httpx
pandas
numpy

Additional libraries may be introduced when justified.

Recommended categories:

Testing:
pytest
pytest-asyncio

HTTP:
httpx

Validation:
Pydantic

Database:
Supabase / PostgreSQL

Analytics:
pandas
numpy

Configuration:
pydantic-settings

Logging:
Python standard logging
structured logging where appropriate

Avoid unnecessary dependencies.

---

6. Target Backend Structure

The backend should evolve toward:

backend/
│
├── app/
│   │
│   ├── main.py
│   │
│   ├── api/
│   │   ├── router.py
│   │   ├── dependencies.py
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── tenants.py
│   │       ├── students.py
│   │       ├── parents.py
│   │       ├── curriculum.py
│   │       ├── lessons.py
│   │       ├── progress.py
│   │       ├── questions.py
│   │       ├── games.py
│   │       ├── analytics.py
│   │       ├── recommendations.py
│   │       ├── challenges.py
│   │       ├── social.py
│   │       ├── notifications.py
│   │       ├── admin.py
│   │       └── billing.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   ├── errors.py
│   │   └── middleware.py
│   │
│   ├── auth/
│   │   ├── models.py
│   │   ├── dependencies.py
│   │   └── service.py
│   │
│   ├── domains/
│   │   ├── tenants/
│   │   ├── memberships/
│   │   ├── students/
│   │   ├── parents/
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
│   │   ├── notifications/
│   │   ├── ai/
│   │   ├── billing/
│   │   └── administration/
│   │
│   ├── db/
│   │   ├── client.py
│   │   ├── repositories/
│   │   └── transactions.py
│   │
│   ├── schemas/
│   │   ├── common.py
│   │   ├── auth.py
│   │   ├── curriculum.py
│   │   ├── lessons.py
│   │   ├── games.py
│   │   ├── progress.py
│   │   ├── analytics.py
│   │   └── admin.py
│   │
│   ├── services/
│   │   └── cross_domain/
│   │
│   ├── jobs/
│   │   ├── analytics.py
│   │   ├── recommendations.py
│   │   ├── content_generation.py
│   │   └── notifications.py
│   │
│   └── integrations/
│       ├── supabase/
│       ├── storage/
│       ├── realtime/
│       ├── ai/
│       └── billing/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── security/
│   └── e2e/
│
├── requirements.txt
├── pyproject.toml
└── README.md

The exact directory layout may evolve.

The separation of responsibilities must remain.

---

7. API Layer

FastAPI routes must remain thin.

Preferred flow:

HTTP Request
     │
     ▼
FastAPI Router
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
Repository / Database
     │
     ▼
Domain Result
     │
     ▼
Response Schema
     │
     ▼
HTTP Response

Routes must not contain complex business logic.

---

8. Router Responsibilities

Routes are responsible for:

HTTP method
Path parameters
Request parsing
Authentication dependency
Authorization dependency
Calling services
Response serialization
HTTP status codes

Routes must not directly implement:

score calculation
XP calculation
question eligibility
mastery calculation
tenant authorization logic
complex database workflows

---

9. Domain Services

Domain services contain business logic.

Example:

domains/games/service.py

may own:

create_game_session()
select_eligible_questions()
submit_answer()
calculate_score()
calculate_xp()
complete_game_session()

A domain service must be independently testable.

---

10. Domain Boundaries

Core domains:

auth
tenants
memberships
students
parents
curriculum
lessons
content
questions
games
progress
mastery
gamification
analytics
recommendations
challenges
social
notifications
ai
billing
administration

Each domain should own its rules.

Cross-domain orchestration belongs in application/domain services rather than route handlers.

---

11. Dependency Direction

Preferred dependency direction:

API
 ↓
Application / Domain Services
 ↓
Repositories / Integrations
 ↓
Database / External Systems

Avoid:

Database
 ↓
API

and:

Domain
 ↓
FastAPI Route

Business logic must not depend on HTTP.

---

12. Authentication

Supabase Auth is the authentication authority.

Authentication flow:

Client
  │
  ▼
Supabase Auth
  │
  ▼
JWT
  │
  ▼
FastAPI
  │
  ▼
JWT Verification
  │
  ▼
Authenticated Principal

The backend must validate the JWT before processing protected requests.

---

13. Authenticated Principal

The backend should normalize authentication into an internal principal.

Conceptually:

AuthenticatedPrincipal
├── user_id
├── session_id where available
├── auth metadata where required
└── authentication state

Do not pass raw JWT payloads throughout domain services.

---

14. Tenant Context

Tenant context is established after authentication.

Flow:

JWT
 │
 ▼
User ID
 │
 ▼
Requested Tenant
 │
 ▼
Membership Lookup
 │
 ▼
Membership Validation
 │
 ▼
Role / Permissions
 │
 ▼
Tenant Context

The tenant ID supplied by the client is never trusted by itself.

---

15. Tenant Context Object

Internally, services may receive a structured tenant context.

Conceptually:

TenantContext
├── tenant_id
├── user_id
├── membership_id
├── role
└── permissions

Every tenant-scoped operation should have access to the appropriate context.

---

16. Authorization Layers

Authorization must operate at multiple levels.

Authentication
      ↓
Tenant Membership
      ↓
Role
      ↓
Resource Ownership
      ↓
Business Rule

Example:

Is authenticated?
      ↓
Belongs to tenant?
      ↓
Has student role?
      ↓
Owns student profile?
      ↓
Completed lesson?
      ↓
Eligible for game?
      ↓
Allow operation

---

17. RLS Architecture

PostgreSQL Row Level Security is mandatory.

The backend must work with the database security model rather than bypass it.

RLS is the final database boundary.

Conceptually:

FastAPI
   │
   ▼
Authenticated User
   │
   ▼
Tenant Membership
   │
   ▼
Database Query
   │
   ▼
RLS
   │
   ▼
Authorized Rows

---

18. Privileged Database Access

Privileged credentials must never be exposed to the frontend.

Service-role access, where required, is restricted to trusted backend operations.

Privileged access must be:

minimal
auditable
explicit
isolated

Do not use privileged credentials as a replacement for normal RLS-aware access.

---

19. Repository Layer

Repositories isolate persistence operations.

Example:

domains/lessons/repository.py

Responsibilities:

Fetch lesson
List lessons
Create lesson
Update lesson
Fetch content
Persist progress

Repositories must not contain presentation logic.

---

20. Database Contract

The database schema is defined by:

DATABASE_SCHEMA_MASTER_PLAN.md

Backend developers and AI agents must not invent database entities to solve a local implementation problem.

If the backend requires a missing database capability:

Identify gap
    ↓
Document gap
    ↓
Update database contract if approved
    ↓
Migration
    ↓
Backend implementation

Do not silently alter the data model.

---

21. Transactions

Operations that modify multiple related pieces of authoritative state should be transactional.

Examples:

Submit Answer
    ↓
Record Attempt
    ↓
Calculate Result
    ↓
Award XP
    ↓
Record Learning Event

Where atomicity is required, use a transaction or an appropriate PostgreSQL RPC/database function.

---

22. Idempotency

Retryable client requests must be designed to avoid duplicate business effects.

Important operations include:

Lesson completion
Answer submission
Game completion
XP award
Achievement award
Challenge participation
Payment/subscription operations

Where appropriate, use:

idempotency keys
unique constraints
database-level deduplication

---

23. Lesson Completion Architecture

Lesson completion is server-authoritative.

Flow:

Student Activity
      │
      ▼
Completion Request
      │
      ▼
Authentication
      │
      ▼
Tenant Validation
      │
      ▼
Student Authorization
      │
      ▼
Completion Rule Evaluation
      │
      ▼
Persist Progress
      │
      ▼
Record Learning Event
      │
      ▼
Trigger Derived Processing
      │
      ▼
Return Authoritative Result

The frontend button itself is never proof of completion.

---

24. Curriculum Services

Curriculum services handle:

Curricula
Grades
Terms
Subjects
Units
Lessons

The hierarchy must follow the database contract:

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

Cross-tenant relationships must be rejected.

---

25. Lesson Services

Lesson services handle:

Lesson retrieval
Content retrieval
Lesson state
Completion
Publication state
Version selection
Eligibility

Published content must be distinguished from drafts.

Students must only receive content they are authorized to access.

---

26. Content Architecture

Content may include:

Text
Video
Image
Infographic
Audio
Interactive
Activity

Content should be represented through typed data structures.

The backend validates supported content types before publication.

Unknown or malformed content must not silently become published student content.

---

27. Content Lifecycle

AI and manually created content follows:

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

The backend controls transitions.

A client cannot directly change arbitrary content from draft to published.

---

28. Content Versioning

Content versioning must preserve historical versions where required.

Conceptually:

Lesson
  │
  ├── Version 1
  ├── Version 2
  └── Version 3

The active published version is explicitly controlled.

Existing learning records must remain interpretable even after content changes.

---

29. Question Bank Security

Questions are trusted learning assets.

The backend must distinguish between:

Student Question DTO

and:

Internal Question Model

Student-facing responses must exclude:

correct_answer
answer_key
private validation metadata
internal scoring configuration

---

30. Question Eligibility

This is a mandatory invariant:

«A student must only be tested on material the student has completed.»

Question eligibility must be calculated server-side.

Conceptually:

Student
   ↓
Tenant Context
   ↓
Completed Lessons
   ↓
Eligible Questions
   ↓
Game Scope
   ↓
Difficulty
   ↓
Question Selection

Never trust the frontend to provide an arbitrary list of questions.

---

31. Game Architecture

Game execution consists of:

Game Definition
      ↓
Game Configuration
      ↓
Eligibility Evaluation
      ↓
Game Session
      ↓
Session Questions
      ↓
Attempts
      ↓
Score
      ↓
XP
      ↓
Progress / Analytics

---

32. Game Scopes

Supported scopes:

Lesson
Unit
Subject
Challenge
Multiplayer

The eligibility rule applies to every scope unless explicitly overridden by an approved business rule.

---

33. Game Session Creation

The client requests a session.

POST /games/{game_id}/sessions

The backend:

Authenticates
    ↓
Validates tenant
    ↓
Validates student
    ↓
Validates game
    ↓
Determines eligibility
    ↓
Selects questions
    ↓
Creates session
    ↓
Creates session-question records
    ↓
Returns safe session state

The client does not create authoritative sessions locally.

---

34. Question Selection

Question selection must occur in trusted backend/database logic.

Selection may consider:

Lesson completion
Game scope
Subject
Unit
Difficulty
Question type
Concept
Previous exposure
Game configuration

Selection must never include questions outside the student's authorized learning scope.

---

35. Answer Submission

Flow:

Client Answer
     ↓
Authentication
     ↓
Tenant Validation
     ↓
Session Validation
     ↓
Question Validation
     ↓
Attempt Validation
     ↓
Answer Evaluation
     ↓
Score Calculation
     ↓
XP Calculation
     ↓
Persist Attempt
     ↓
Record Learning Event
     ↓
Update Derived State
     ↓
Return Safe Result

---

36. Answer Validation

The backend compares the submitted answer against trusted question data.

The correct answer is never accepted from the client.

Bad:

POST {
  answer: "...",
  correct: true
}

Good:

POST {
  answer: "..."
}

The server determines correctness.

---

37. Score Calculation

Score calculation belongs to the game domain.

Inputs may include:

Correctness
Difficulty
Time
Game rules
Question type
Attempt state

The exact formula must be configurable without requiring frontend changes.

The client receives the result.

---

38. XP Architecture

XP is server-authoritative.

The backend must record XP changes as transactions.

Conceptually:

Game Result
    ↓
XP Rule
    ↓
XP Transaction
    ↓
Student XP State

Do not trust:

client_xp
client_score
client_reward

---

39. Achievement Evaluation

Achievements are evaluated from trusted learning events.

Flow:

Learning Event
      ↓
Achievement Rules
      ↓
Eligibility
      ↓
Achievement Award
      ↓
Persist
      ↓
Notification

Achievement state must not be directly written by the browser.

---

40. Streak Architecture

Streaks are derived from valid learning activity.

The backend determines:

activity date
qualifying activity
current streak
longest streak

The client only displays the resulting state.

---

41. Progress Architecture

Progress is separate from game scoring.

The backend supports:

Lesson Progress
Unit Progress
Subject Progress
Curriculum Progress

Progress updates should be based on trusted learning events.

---

42. Mastery Architecture

Mastery is derived from learning evidence.

Possible inputs:

Lesson completion
Question attempts
Correctness
Difficulty
Repeated attempts
Game performance
Historical performance
Time-on-task
Concept performance

Mastery calculations belong to backend/analytics services.

---

43. Learning Events

Learning events provide the foundation for analytics.

Events may include:

lesson_started
content_viewed
lesson_completed
question_presented
question_answered
game_started
game_completed
challenge_joined
challenge_completed
achievement_earned
xp_awarded

Events must contain enough tenant/student/context information to support authorized analytics.

---

44. Analytics Architecture

Analytics should separate:

Operational Data
        ↓
Learning Events
        ↓
Aggregation
        ↓
Metrics
        ↓
Mastery
        ↓
Recommendations

Raw facts should remain available where required for recalculation and auditing.

---

45. Analytics Processing

Analytics processing may use:

pandas
numpy

and other approved Python analytics libraries.

Analytics code must not replace the transactional source of truth.

For example:

Analytics

may calculate:

accuracy trend
mastery estimate
learning velocity
weak concepts

but must not become the authoritative writer of:

lesson completion
answer correctness
XP transaction

---

46. Recommendation Engine

Recommendations are generated from learning evidence.

Potential signals:

Weak concepts
Low accuracy
Repeated mistakes
Incomplete lessons
Difficulty performance
Mastery
Learning history

Recommendations must be:

tenant-scoped
student-scoped
explainable where appropriate
persistable
auditable

---

47. Parent Services

Parent services handle:

Authorized child lookup
Progress
Analytics
Mastery
Recommendations
Recent activity

Every child access must verify:

Authenticated parent
        ↓
Tenant membership
        ↓
Explicit parent-child relationship
        ↓
Authorized student

A parent-provided arbitrary student ID must never be sufficient.

---

48. Challenges

Challenge services manage:

Challenge definition
Schedule
Eligibility
Participation
Questions
Scoring
Results
Leaderboard

Challenge configuration must support:

start time
end time
timezone
grade
subject
scope
rules
scoring
recurrence

The initial Thursday 7 PM example must not be hard-coded.

---

49. Challenge Scheduling

Scheduling must use an explicit timezone.

Conceptually:

Challenge
├── start_at
├── end_at
├── timezone
└── recurrence

The backend must evaluate challenge availability using the configured schedule.

---

50. Multiplayer Architecture

Multiplayer consists of:

Game Room
    ↓
Players
    ↓
Game State
    ↓
Realtime Events
    ↓
Server Validation
    ↓
Results

Realtime is used for synchronization.

It is not the authority for authorization.

---

51. Multiplayer Security

Every multiplayer operation must validate:

Authenticated user
Tenant membership
Room membership
Game session
Allowed operation
Current state

Never trust a client to declare:

winner
score
room ownership
player identity

---

52. Social Architecture

Social features are tenant-scoped.

They include:

Friends
Friend Requests
Educational Chat
Game Invitations
Multiplayer Invitations

Social access must respect tenant membership and relationship rules.

---

53. Chat Architecture

Chat messages follow:

Client
  ↓
Authentication
  ↓
Conversation Authorization
  ↓
Persist Message
  ↓
Realtime Delivery

Realtime should notify participants after the authoritative persistence operation.

---

54. Notifications

Notification creation should be server-controlled.

Events may generate notifications for:

Achievement
Challenge
Friend request
Game invitation
Learning reminder
Parent update
Administrative event

The frontend receives notification data.

It does not manufacture authoritative notifications.

---

55. Realtime Architecture

Supabase Realtime may be used for:

Chat
Multiplayer
Presence
Challenges
Notifications

Realtime subscriptions must respect authorization.

The backend/database remains authoritative.

---

56. AI Content Generation

AI generation is a controlled backend subsystem.

Flow:

Generation Request
       ↓
Authorization
       ↓
Generation Job
       ↓
AI Provider
       ↓
Generated Draft
       ↓
Validation
       ↓
Review
       ↓
Approval
       ↓
Publication

AI output is never automatically trusted as production educational content.

---

57. AI Provider Boundary

AI provider calls must occur on trusted backend infrastructure.

API keys must never be sent to the browser.

The backend may support multiple providers in the future.

Provider-specific code should be isolated behind an integration boundary.

---

58. Content Generation Jobs

Long-running generation should use jobs rather than blocking HTTP requests.

Conceptually:

POST /content/generation-jobs
        ↓
Create Job
        ↓
Return Job ID
        ↓
Worker Processes Job
        ↓
Persist Draft
        ↓
Validate
        ↓
Notify / Update Status

---

59. Storage Architecture

Supabase Storage may contain:

Images
Infographics
Videos
Educational assets
Generated media
Tenant assets

Storage paths and access rules must preserve tenant isolation.

Private assets must not become public accidentally.

---

60. Billing Architecture

Billing belongs to the backend.

The backend manages:

Plans
Subscriptions
Entitlements
Limits
Status

Payment providers may be integrated later.

The initial MVP may support administrative subscription management.

---

61. Entitlement Checks

Feature availability may depend on:

Plan
Subscription
Tenant status
Feature flags
Usage limits

The backend should provide authoritative entitlement decisions.

The frontend may hide unavailable features but cannot bypass backend enforcement.

---

62. Administration

Administrative services include:

Tenant management
Membership management
Student management
Curriculum management
Content management
Question management
Game configuration
Reports
Subscriptions
Audit

Administrative authorization must be explicit.

---

63. Platform Admin vs Tenant Admin

Platform Admin operates at platform scope.

Tenant Admin operates at tenant scope.

Never automatically elevate:

Tenant Admin → Platform Admin

A platform administrator may perform controlled support operations according to explicit authorization.

---

64. Audit Architecture

Security-sensitive and business-critical operations should generate audit records.

Examples:

Tenant creation
Tenant suspension
Membership changes
Role changes
Content publication
Question changes
Game configuration changes
Administrative actions
Subscription changes
Support access

Audit records should identify:

actor
tenant
action
resource
timestamp
relevant metadata

Sensitive data should not be unnecessarily copied into audit records.

---

65. Error Architecture

The backend must return normalized errors.

Conceptual categories:

AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
TENANT_ACCESS_ERROR
VALIDATION_ERROR
NOT_FOUND
CONFLICT
BUSINESS_RULE_ERROR
RATE_LIMITED
INTERNAL_ERROR

The API contract defines the exact external format.

---

66. HTTP Status Codes

Recommended mapping:

200 → Successful read/update
201 → Created
204 → Successful no-content operation

400 → Malformed request
401 → Authentication required
403 → Forbidden
404 → Resource not found
409 → Conflict
422 → Validation error
429 → Rate limited
500 → Internal server error

Business-specific error codes should be included where useful.

---

67. Validation

All external input must be validated.

Validate:

Path parameters
Query parameters
Request bodies
Headers where relevant
Uploaded metadata
Configuration

Pydantic models should define API boundaries.

Domain services should still enforce business rules.

---

68. Rate Limiting

Rate limiting should be applied to sensitive or expensive operations.

Examples:

Authentication endpoints
Game session creation
Answer submission
AI generation
Messaging
Friend requests
Password/recovery flows where applicable

Rate limits must not replace authorization.

---

69. Anti-Abuse Architecture

The backend should be designed to resist:

Repeated answer submissions
Score manipulation
XP manipulation
Game replay attacks
Request flooding
Cross-tenant enumeration
Unauthorized resource access

Use:

idempotency
unique constraints
authorization
rate limits
server-side calculations
database constraints
audit events

---

70. Pagination

Large collections must be paginated server-side.

Examples:

Students
Lessons
Questions
Messages
Notifications
Audit logs
Leaderboard entries
Learning events

Do not return unbounded collections.

---

71. Filtering and Search

Filtering should be performed server-side for large datasets.

Examples:

Students by status
Lessons by subject
Questions by difficulty
Notifications by read state
Audit logs by tenant

The API should expose explicit filter parameters.

---

72. Caching

Caching may be used for safe, read-heavy data.

Candidates:

Published curriculum metadata
Static configuration
Non-sensitive reference data

Tenant-sensitive cache entries must include tenant identity.

Never cache private data globally.

---

73. Cache Invalidation

Authoritative writes must invalidate or update affected caches.

Examples:

Publish Lesson
    ↓
Invalidate lesson cache
    ↓
Invalidate curriculum cache where required

Do not sacrifice correctness for caching.

---

74. Background Jobs

Background processing should be used for:

AI generation
Analytics aggregation
Recommendation generation
Notification fan-out
Large imports
Media processing
Periodic maintenance

HTTP requests should remain bounded and responsive.

---

75. Job Reliability

Jobs should support:

pending
running
completed
failed
cancelled

Where appropriate:

retry
backoff
idempotency
failure metadata

A failed job must not silently appear successful.

---

76. Scheduled Processing

Scheduled jobs may perform:

Daily analytics aggregation
Recommendation refresh
Challenge activation
Challenge completion processing
Notification reminders
Cleanup

Scheduling configuration must remain outside core business logic where possible.

---

77. Observability

Backend observability should include:

Structured logs
Request IDs
Error tracking
Performance metrics
Job status
Database error visibility
External provider error visibility

Sensitive information must not be logged.

---

78. Logging Rules

Never log:

Passwords
JWT secrets
API keys
Supabase service-role keys
AI provider secrets
Payment secrets
Correct answers
Private chat content
Unnecessary student PII

Use identifiers instead of sensitive payloads.

---

79. Request Correlation

Each request should have a request/correlation ID where practical.

Flow:

Frontend
   ↓
Request ID
   ↓
FastAPI
   ↓
Domain Service
   ↓
Database / External API

This makes production debugging possible without exposing sensitive data.

---

80. Testing Architecture

Testing must exist at multiple levels.

Unit Tests

Test:

Domain rules
Scoring
Eligibility
XP rules
Mastery calculations
Validators
Pure services

Integration Tests

Test:

Database
RLS
Repositories
Supabase
Authentication integration

API Tests

Test:

HTTP endpoints
Authorization
Validation
Responses
Errors

Security Tests

Test:

Cross-tenant access
Role escalation
Student ownership
Parent-child authorization
Correct-answer leakage
Game manipulation

End-to-End Tests

Test critical journeys through the actual frontend and backend.

---

81. Tenant Isolation Testing

Tenant isolation is mandatory.

Tests must verify:

Tenant A user
      ↓
Cannot read Tenant B

and:

Tenant A admin
      ↓
Cannot modify Tenant B

Also test:

Cross-tenant IDs
Cross-tenant parent relationships
Cross-tenant lessons
Cross-tenant games
Cross-tenant analytics
Cross-tenant social data

---

82. Game Security Testing

Test that the client cannot manipulate:

score
XP
correctness
question eligibility
game ownership
session ownership
completion state

The backend must reject tampered requests.

---

83. API Contract Testing

Frontend and backend must be tested against:

API_CONTRACT.md

Changes to request/response schemas should be deliberate and versioned where necessary.

---

84. API Versioning

Public API routes should use explicit versioning.

Example:

/api/v1/...

Breaking changes should not silently alter existing contracts.

---

85. Health Checks

The backend should expose safe health endpoints.

Example:

GET /health
GET /ready

Health endpoints must not expose:

credentials
database secrets
internal configuration
private tenant information

---

86. Configuration Management

Configuration should be loaded from environment variables or a secure configuration system.

Examples:

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
AI_PROVIDER_KEY

Secrets must never be committed to Git.

---

87. Environment Separation

Support:

development
staging
production

Each environment must use separate credentials and appropriate resources.

Never use production secrets in development.

---

88. Deployment Architecture

Recommended deployment flow:

GitHub
   ↓
CI
   ↓
Lint
   ↓
Type / Static Checks
   ↓
Unit Tests
   ↓
Integration Tests
   ↓
Build
   ↓
Deploy

The backend may be deployed as a containerized FastAPI application or another compatible production runtime.

---

89. Database Migration Policy

Database changes must be explicit.

Preferred flow:

Database Contract Change
        ↓
Migration
        ↓
RLS Update
        ↓
Repository Update
        ↓
Service Update
        ↓
API Contract Update
        ↓
Frontend Update
        ↓
Tests

Never modify the production database manually without a migration record.

---

90. Legacy Backend Migration

Before replacing any existing backend code:

Audit
  ↓
Classify
  ├── KEEP
  ├── REFACTOR
  ├── REPLACE
  └── DELETE

Legacy code must not dictate the new architecture.

However, existing working business behavior must be identified before deletion.

---

91. Vertical Slice Implementation

Backend development should proceed through vertical slices.

Recommended first slice:

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
Lesson Completion
    ↓
Progress

Then:

Question Bank
    ↓
Game Session
    ↓
Answer Submission
    ↓
Score
    ↓
XP
    ↓
Analytics

Then:

Parent
Challenges
Notifications
Social
Multiplayer
AI
Billing

---

92. Critical Student Learning Flow

The first complete backend learning loop must support:

Authenticated User
      ↓
Tenant Membership
      ↓
Student Profile
      ↓
Curriculum
      ↓
Lesson
      ↓
Lesson Content
      ↓
Lesson Completion
      ↓
Progress
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
Learning Event
      ↓
Analytics

This is the first critical vertical slice.

---

93. Backend Security Invariants

Invariant 1

No request is trusted merely because it comes from the frontend.

Invariant 2

Tenant ID from the client is not sufficient authorization.

Invariant 3

RLS remains mandatory.

Invariant 4

Correct answers never enter normal student API responses.

Invariant 5

Score is calculated server-side.

Invariant 6

XP is calculated and recorded server-side.

Invariant 7

Lesson completion is server-authoritative.

Invariant 8

Question eligibility is server-authoritative.

Invariant 9

Parent access requires an explicit parent-child relationship.

Invariant 10

Realtime is not a replacement for authorization.

Invariant 11

AI output is not automatically trusted.

Invariant 12

Secrets never enter frontend code.

Invariant 13

Privileged operations are auditable.

Invariant 14

Cross-tenant access must fail closed.

Invariant 15

Business-critical multi-step writes must preserve atomicity.

---

94. Definition of Done

The backend architecture is considered correctly implemented when:

- [ ] FastAPI foundation exists.
- [ ] Authentication integration exists.
- [ ] JWT validation exists.
- [ ] Tenant context exists.
- [ ] Membership authorization exists.
- [ ] Role authorization exists.
- [ ] Resource authorization exists.
- [ ] RLS is active.
- [ ] Domain boundaries exist.
- [ ] Routes remain thin.
- [ ] Domain services contain business rules.
- [ ] Repository/data access is separated.
- [ ] Pydantic request/response schemas exist.
- [ ] API versioning exists.
- [ ] Curriculum services follow the database hierarchy.
- [ ] Lesson completion is server-authoritative.
- [ ] Question eligibility is enforced server-side.
- [ ] Correct answers are protected.
- [ ] Game sessions are server-created.
- [ ] Answer validation is server-side.
- [ ] Score is server-calculated.
- [ ] XP transactions are server-controlled.
- [ ] Progress is persisted correctly.
- [ ] Learning events are recorded.
- [ ] Analytics pipeline exists.
- [ ] Recommendations have a defined backend boundary.
- [ ] Parent-child authorization exists.
- [ ] Challenge rules are configurable.
- [ ] Multiplayer authorization exists.
- [ ] Social access is tenant-scoped.
- [ ] Notifications are server-generated.
- [ ] AI generation is isolated.
- [ ] AI content passes validation/review before publication.
- [ ] Billing is server-controlled.
- [ ] Auditability exists.
- [ ] Rate limiting exists for sensitive operations.
- [ ] Background jobs exist where required.
- [ ] Structured logging exists.
- [ ] Security tests exist.
- [ ] Tenant-isolation tests exist.
- [ ] Production configuration does not expose secrets.

---

95. Mandatory Instructions for AI Coding Agents

Any AI coding agent modifying the backend MUST:

1. Read "DATABASE_SCHEMA_MASTER_PLAN.md".
2. Read "PROJECT_ARCHITECTURE.md".
3. Read "BACKEND_ARCHITECTURE.md".
4. Read "FRONTEND_ARCHITECTURE.md" when changing API behavior affecting the frontend.
5. Read "API_CONTRACT.md" when implementing or modifying endpoints.
6. Inspect the existing backend before modifying it.
7. Never invent database tables without updating the database contract.
8. Never bypass RLS without an explicit architectural reason.
9. Never trust client-provided tenant ownership.
10. Never trust client-provided score.
11. Never trust client-provided XP.
12. Never trust client-provided correctness.
13. Never expose correct answers to student clients.
14. Never put secrets in source control.
15. Keep routes thin.
16. Put business rules in domain services.
17. Validate all external input.
18. Use transactions for atomic business operations.
19. Use idempotency for retryable operations where necessary.
20. Test cross-tenant isolation.
21. Test authorization failures.
22. Test business-rule failures.
23. Test game manipulation attempts.
24. Preserve auditability.
25. Report architectural contradictions before implementing them.
26. Do not silently change the database schema.
27. Do not silently change the API contract.
28. Prefer vertical slices over disconnected infrastructure work.
29. Do not delete legacy functionality without auditing it.
30. Keep security enforcement server-side and database-side.

---

96. Relationship to Frontend Architecture

The frontend communicates with the backend only through the API contract.

React
  │
  ▼
Typed API Client
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

The backend must not expose internal implementation details.

The frontend receives safe DTOs rather than database internals.

---

97. Relationship to Database Architecture

The database remains the system of record.

Backend
   │
   ▼
Database Contract
   │
   ▼
PostgreSQL
   │
   ▼
RLS

The backend adds application/domain behavior around the database.

It does not replace the database's security guarantees.

---

98. Final Backend Architecture Summary

TheTutor backend is:

                FastAPI
                   │
          ┌────────┴────────┐
          │                 │
     Authentication    API Routes
          │                 │
          └────────┬────────┘
                   ▼
          Tenant / Authorization
                   │
                   ▼
             Domain Services
                   │
      ┌────────────┼────────────┐
      │            │            │
 Curriculum      Lessons      Games
      │            │            │
 Progress       Questions    Gamification
      │            │            │
 Analytics    Recommendations Challenges
      │            │            │
      └────────────┼────────────┘
                   ▼
              Repositories
                   │
                   ▼
          Supabase PostgreSQL
                   │
                   ▼
                  RLS

The backend is the authoritative application layer for TheTutor.

It validates identity, tenant membership, permissions, business rules, learning eligibility, game state, scoring, XP, progress, analytics, recommendations, and administrative operations.

The database remains the authoritative persistence and tenant-isolation layer.

---

END OF BACKEND ARCHITECTURE