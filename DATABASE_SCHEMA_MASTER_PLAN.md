TheTutor — Database Schema Master Plan

Status: FINAL DATABASE CONTRACT
Version: 2.0
Date: 2026-08-31
Platform: TheTutor
Database: Supabase PostgreSQL
Architecture: Multi-Tenant Educational SaaS
Backend Platform: Supabase Managed Backend

---

1. Document Purpose

This document is the authoritative database specification for TheTutor.

It defines the database architecture required to support the complete educational platform, including:

- Multi-tenant educational environments.
- Global authentication identities.
- Tenant memberships and roles.
- Tenant-specific student profiles.
- Parents and linked children.
- Curriculum management.
- Grades, terms, subjects, units, and lessons.
- Versioned educational content.
- Educational media and assets.
- Question banks.
- Lesson, unit, and subject games.
- Weekly challenges.
- Multiplayer games.
- Student progress.
- Learning events.
- XP and achievements.
- Streaks.
- Leaderboards.
- Student analytics.
- Parent analytics.
- Mastery calculation.
- Personalized recommendations.
- Notifications.
- Educational social features.
- SaaS plans and subscriptions.
- Audit logging.
- Supabase Storage.
- Supabase Realtime.
- Scheduled database processing.
- Controlled content ingestion.
- Strong Row Level Security.
- Tenant isolation.
- Future extensibility.

This document is a database contract.

All frontend code, Supabase functions, Edge Functions, game logic, analytics logic, content pipelines, and other application components must conform to this contract.

The database is the authoritative source of transactional learning state.

---

2. Final Backend Model

TheTutor does not require a separate FastAPI/Python application backend for the initial architecture.

The backend platform is Supabase.

The database/backend responsibilities are distributed as follows:

Supabase Auth
    ↓
Identity and authentication

PostgreSQL
    ↓
Primary application data

RLS
    ↓
Authorization and tenant isolation

Database Functions / RPC
    ↓
Trusted transactional business operations

Triggers
    ↓
Database-side event processing and derived state

Views / Materialized Views
    ↓
Read models and analytics aggregates

pg_cron / Supabase Cron
    ↓
Scheduled processing

Supabase Realtime
    ↓
Realtime synchronization, multiplayer, chat, presence

Supabase Storage
    ↓
Educational and user assets

Edge Functions
    ↓
Server-side TypeScript
External APIs
AI
Webhooks
Notifications
Other operations requiring secrets

The frontend communicates directly with Supabase through the official client libraries using the authenticated user's session.

The frontend must never use a privileged database/service key.

---

3. Core Database Principles

3.1 PostgreSQL Is the Source of Truth

PostgreSQL is authoritative for:

- Identity relationships.
- Tenant membership.
- Authorization data.
- Curriculum structure.
- Student eligibility.
- Lesson completion.
- Progress.
- Game sessions.
- Question attempts.
- Scores.
- XP transactions.
- Achievements.
- Learning events.
- Analytics facts.
- Parent-child relationships.
- Challenge participation.

The frontend must not maintain an independent authoritative copy of these states.

---

3.2 Multi-Tenancy Is a Security Boundary

TheTutor is a true multi-tenant platform.

A tenant may represent:

- A school.
- An educational center.
- Another educational organization.
- A future institutional customer type.

Every tenant owns an isolated educational environment.

Tenant isolation must be enforced at the database authorization layer.

Frontend filtering is not considered security.

Application-level filtering is not considered sufficient security.

RLS is mandatory for exposed tenant data. Supabase explicitly recommends enabling RLS on every exposed table/view and combining policies with appropriate Postgres grants.

---

4. Global Identity and Tenant Identity

Authentication identity and educational identity are separate concepts.

Supabase Auth User
        │
        ├── Tenant A
        │      └── Membership
        │             └── Student Profile A
        │
        ├── Tenant B
        │      └── Membership
        │             └── Student Profile B
        │
        └── Tenant C
               └── Membership
                      └── Other Profile

A global user may belong to multiple tenants.

The same person may therefore have:

- Different roles.
- Different student profiles.
- Different grades.
- Different curriculum contexts.
- Different progress.
- Different XP.
- Different achievements.

All tenant-specific learning state must remain isolated.

---

5. Tenant Model

Conceptual entity:

tenants

Minimum conceptual fields:

id
name
slug
status
settings
created_at
updated_at
deleted_at

Possible lifecycle states:

active
suspended
inactive
archived
deleted

Tenant deletion should normally be implemented through lifecycle/soft-delete mechanisms rather than destructive deletion.

Tenant IDs must be UUIDs or another cryptographically safe identifier.

Human-readable slugs must never be treated as authorization credentials.

---

6. User Profiles

Supabase Auth owns authentication identities.

The application database must not duplicate authentication credentials.

Application-level profile information may be stored separately.

Conceptual entity:

profiles

Possible fields:

id
display_name
avatar_path
locale
timezone
status
created_at
updated_at

"profiles.id" references the authenticated Supabase user identity.

Authentication secrets, passwords, refresh tokens, and similar credentials remain managed by Supabase Auth.

Supabase Auth uses PostgreSQL internally and exposes authenticated user context to database authorization through the user's Auth token.

---

7. Tenant Memberships

Conceptual entity:

tenant_memberships

Minimum conceptual fields:

id
tenant_id
user_id
role
status
created_at
updated_at

The same user may have multiple memberships.

Roles are scoped to the membership.

Initial roles:

super_admin
tenant_admin
teacher
parent
student
staff

The exact role set may be adjusted during implementation without changing the core tenancy model.

A user's role in Tenant A must not grant authorization in Tenant B.

---

8. Student Model

A student is represented by a tenant-specific student profile.

Conceptual entity:

tenant_student_profiles

Possible fields:

id
tenant_id
membership_id
student_code
display_name
grade_id
status
created_at
updated_at
deleted_at

Important invariant:

«A student profile belongs to exactly one tenant context.»

The global Auth user is not sufficient to represent a student's educational identity.

---

9. Parent Model

A parent may have multiple children.

A child may have multiple authorized parents/guardians where required.

The relationship is tenant-scoped.

Conceptual entity:

parent_student_links

Possible fields:

id
tenant_id
parent_user_id
student_profile_id
relationship_type
status
created_at
updated_at

Parent access must be limited to explicitly linked children.

A parent must never be able to discover or access another tenant's student.

Parent linking does not require mandatory approval during initial student onboarding.

---

10. Curriculum Hierarchy

The authoritative educational hierarchy is:

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

Conceptual entities:

curricula
grades
terms
subjects
units
lessons

Every tenant-scoped curriculum entity must resolve to the same tenant context.

The database must structurally prevent invalid cross-tenant parent relationships wherever practical.

Example:

Tenant A
  └── Subject A
       └── Unit A
            └── Lesson A

must never reference:

Tenant B Unit B

---

11. Curriculum Flexibility

The schema must support:

- Egyptian Experimental Languages curriculum.
- Egyptian Government curriculum.
- Custom tenant curricula.
- Future curriculum variants.

The initial TheTutor educational focus remains Egyptian primary education, but the database must not hard-code the platform to a single curriculum.

---

12. Grades

Grades are curriculum-scoped.

The initial target is:

Grade 1
Grade 2
Grade 3
Grade 4
Grade 5
Grade 6

The schema must remain extensible for future grade structures.

---

13. Terms

Terms belong to their curriculum/grade context.

The database must support multiple terms per grade and curriculum.

The exact number of terms must not be hard-coded into application logic.

---

14. Subjects

Subjects belong to the appropriate curriculum/term context.

Examples may include:

- English.
- Mathematics.
- Science.
- Arabic.
- Social Studies.
- Other curriculum-specific subjects.

Subject codes should be unique within the appropriate tenant/curriculum scope.

---

15. Units

Units belong to subjects.

A unit may contain multiple lessons.

Units are tenant-scoped through their parent hierarchy.

---

16. Lessons

Lessons are the primary educational consumption unit.

A lesson may contain:

- Title.
- Description.
- Learning objectives.
- Concepts.
- Content blocks.
- Video metadata.
- Infographic metadata.
- Supporting assets.
- Questions.
- Game references/configuration.
- Publication state.
- Version information.

A lesson must have a stable identity independent of its individual content versions.

---

17. Lesson Completion

The database must define completion explicitly.

For TheTutor:

«A lesson is considered completed only when the system records a valid completion event through an authorized application/database operation.»

Opening a lesson is not automatically equivalent to completion.

The exact completion criteria may include required content progression and/or a completion action, but the authoritative completion state must be generated server-side/database-side.

The frontend may request completion.

The frontend may not directly declare an authoritative completion state without the appropriate database operation.

---

18. Educational Content Versioning

Content must support versioning.

Conceptual model:

Lesson
   ↓
Content Version
   ↓
Ordered Content Blocks

Conceptual entities:

content_versions
content_blocks

A published lesson must reference a specific published content version.

This allows:

- Drafting.
- Review.
- Publishing.
- Archiving.
- Historical preservation.
- Future content corrections.
- Controlled AI-generated content.

---

19. Content Lifecycle

The required lifecycle is:

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

AI-generated content must never automatically become published content.

Publication requires an authorized workflow.

---

20. Content Import Pipeline

Content ingestion is a controlled subsystem.

Conceptual entities:

content_import_batches
content_generation_jobs
content_versions

Pipeline:

Source
  ↓
Normalize
  ↓
Validate
  ↓
Import Batch
  ↓
Database
  ↓
Review
  ↓
Approve
  ↓
Publish

The repository "content_injector" is an ingestion/content-production tool.

It is not the application backend.

---

21. AI-Generated Content

AI may generate:

- Lesson drafts.
- Explanations.
- Questions.
- Activities.
- Game configurations.
- Metadata.
- Supporting educational content.

AI output is untrusted draft content until validated and approved.

AI services must not receive direct unrestricted database write authority.

When external AI APIs are required, the request should pass through an authorized server-side mechanism such as a Supabase Edge Function.

---

22. Concepts and Learning Objectives

The database should support educational concepts/skills as reusable learning objects.

Concepts can be associated with:

- Lessons.
- Questions.
- Content.
- Student mastery.
- Recommendations.

This enables analytics beyond simple lesson completion.

Conceptual entities:

concepts
lesson_concepts
question_concepts

---

23. Question Bank

Questions are reusable educational objects.

Questions must support:

- Question type.
- Difficulty.
- Lesson association.
- Concept association.
- Answer options.
- Correct answer.
- Explanation.
- Feedback.
- Metadata.
- Publication state.
- Versioning where required.

Initial question types:

multiple_choice
true_false
matching
ordering
fill_blank
image_choice
drag_drop

The type system must remain extensible.

---

24. Question Security

Correct answers are protected data.

The browser must never receive the authoritative answer key through a normal student question query.

Student-facing question data should expose only what is necessary to render the question.

Example:

Student receives:
question
options
media
metadata required for gameplay

Student does NOT receive:
correct_answer
scoring authority
answer key
server-side evaluation rules

Answer validation must occur through trusted database operations.

---

25. Question Eligibility

A student may only receive questions from educational material the student is eligible to use.

The authoritative relationship is:

Student
   ↓
Completed / Eligible Lessons
   ↓
Eligible Questions
   ↓
Game

Question eligibility must be enforced by the database/backend contract.

The browser cannot override eligibility by submitting arbitrary lesson/question IDs.

---

26. Game Model

Games are educational mechanisms.

The database must support:

Lesson Games
Unit Games
Subject Games
Challenge Games
Multiplayer Games

Game scope and game mode are separate concepts.

---

27. Game Scope

Initial game scopes:

lesson
unit
subject
challenge

A multiplayer game is not a scope.

It is a mode.

---

28. Game Mode

Initial modes:

solo
multiplayer

This separation allows combinations such as:

Lesson + Solo
Lesson + Multiplayer

Unit + Solo
Unit + Multiplayer

Subject + Solo
Subject + Multiplayer

Challenge + Solo
Challenge + Multiplayer

without changing the fundamental game model.

---

29. Game Definitions

Conceptual entities:

game_types
games
game_configurations

A game definition contains the rules/configuration required to create game sessions.

The system must remain extensible so new game types can be added without redesigning the database.

---

30. Difficulty

Initial difficulty levels:

easy
medium
hard

Difficulty must support future calibration.

The system should distinguish between:

difficulty_level

and future:

difficulty_rating

where advanced calibration becomes necessary.

---

31. Game Sessions

A game session represents one execution of a game by a student.

Conceptual entities:

game_sessions
game_session_questions
question_attempts

A session must record:

- Student.
- Tenant.
- Game.
- Mode.
- Start time.
- End time.
- Completion state.
- Score.
- XP earned.
- Duration.
- Question sequence.
- Difficulty context.

The client must never be trusted to determine final score or XP.

---

32. Game Session Security

Authoritative game processing must occur inside trusted database operations.

Conceptual flow:

Frontend
   ↓
start_game_session()
   ↓
Database validates:
- authentication
- tenant membership
- student identity
- game eligibility
- question eligibility
   ↓
Game Session
   ↓
Frontend receives safe question data
   ↓
submit_game_answer()
   ↓
Database evaluates answer
   ↓
Database calculates score
   ↓
Database records attempt
   ↓
Database awards XP
   ↓
Database records learning event

This architecture prevents the browser from becoming the authority for scoring.

---

33. Multiplayer

Multiplayer is implemented using:

PostgreSQL
+
Realtime

Conceptual entities:

game_rooms
game_room_players

PostgreSQL is the authoritative state.

Realtime is the synchronization mechanism.

Realtime must not become an alternative source of truth.

Private Realtime channels and authorization policies must be used for protected multiplayer/chat functionality. Supabase currently supports Realtime authorization through RLS policies on "realtime.messages".

---

34. Student Progress

Progress is tenant-scoped.

The system must support:

Lesson Progress
Unit Progress
Subject Progress
Curriculum Progress

Progress states:

not_started
in_progress
completed

Additional derived states such as mastery may be represented separately.

Conceptual entity:

lesson_progress

Derived progress may be calculated from lower-level facts rather than independently maintained mutable values where appropriate.

---

35. Learning Events

Learning events are immutable learning facts.

Conceptual entity:

learning_events

Examples:

lesson_started
lesson_completed
question_presented
question_answered
game_started
game_completed
challenge_joined
challenge_completed
achievement_earned
xp_awarded
activity_completed

Events should contain sufficient context for analytics.

---

36. Events vs Current State

The architecture distinguishes:

Learning Events
    =
Historical Facts

from:

Progress / Metrics
    =
Current or Derived State

The preferred relationship is:

Learning Events
      ↓
Derived Metrics
      ↓
Current Progress / Mastery

The database must avoid contradictory authoritative states.

---

37. XP

XP is tenant-scoped learning value.

XP must not rely only on a mutable total.

Conceptual entity:

xp_transactions

Each transaction should preserve:

- Student.
- Tenant.
- Amount.
- Reason/source.
- Related entity.
- Timestamp.
- Idempotency/reference information where required.

A cached/current XP total may exist for performance, but the transaction history remains authoritative for auditing and recalculation.

---

38. Global XP

The MVP does not define a universal cross-tenant "Global Student XP" score.

Tenant XP is authoritative.

If a future platform-wide reputation/score is required, it must be modeled as a separate concept with separate rules.

This prevents cross-tenant learning data from being accidentally combined.

---

39. Streaks

Conceptual entity:

student_streaks

Streaks must be based on valid learning activity.

The client cannot arbitrarily modify a streak.

Streak calculations may be updated synchronously for critical UX or asynchronously through scheduled processing.

---

40. Achievements

Conceptual entities:

achievements
student_achievements

Achievements may be triggered by:

- Lesson completion.
- Subject progress.
- XP milestones.
- Streaks.
- Challenges.
- Game performance.
- Learning events.

Achievement rules should be data-driven where practical.

---

41. Leaderboards

Initial leaderboard scopes:

tenant
grade
subject
weekly
challenge
game

Leaderboards must respect tenant isolation.

A leaderboard may only aggregate students the current user is authorized to see.

The MVP does not require a cross-tenant student leaderboard.

---

42. Analytics Architecture

Analytics are built from learning facts.

Primary flow:

Learning Events
      ↓
Raw Facts
      ↓
Aggregated Metrics
      ↓
Mastery
      ↓
Recommendations

Conceptual analytics entities:

analytics_daily_student
analytics_concept_daily
student_subject_metrics
concept_mastery
learning_recommendations

The exact implementation may use:

- SQL views.
- Materialized views.
- Database functions.
- Scheduled aggregation.
- Summary tables.

The correct mechanism will be selected based on workload and query performance.

---

43. Database Analytics — No Python Dependency

The MVP does not require a Python analytics backend.

Primary analytics processing will use PostgreSQL/Supabase capabilities:

SQL
Views
Materialized Views
Database Functions
Triggers
Scheduled Jobs

Advanced external analytics may be added later without changing the transactional schema.

If an advanced analytics model eventually requires Python or another processing environment, that processing layer consumes database facts; it does not become the source of transactional truth.

---

44. Student Analytics

Student analytics must support:

- Lesson completion.
- Subject progress.
- Accuracy.
- Mastery.
- Weak concepts.
- Strong concepts.
- XP.
- Streak.
- Performance trends.
- Difficulty performance.
- Question performance.
- Time-on-task where available.
- Learning velocity where meaningful.
- Recommended next actions.

---

45. Parent Analytics

Parents may access analytics only for explicitly linked children.

Parent analytics may include:

- Overall progress.
- Subject performance.
- Lesson completion.
- Weak areas.
- Strong areas.
- Mastery.
- Learning activity.
- Game performance.
- XP.
- Streaks.
- Recommendations.

Parent dashboards must use database-authorized read models or functions.

---

46. Recommendations

Recommendations are derived from learning evidence.

Potential recommendations:

Review this lesson
Practice this concept
Try an easier game
Try a harder game
Repeat this question type
Continue the next lesson
Practice a weak subject

Recommendations must be:

- Tenant-aware.
- Student-specific.
- Based on actual learning data.
- Safe for parent/student visibility rules.

---

47. Weekly Challenges

Challenges are configurable.

Conceptual entities:

challenges
challenge_questions
challenge_participants
challenge_results

Challenge configuration must support:

- Start time.
- End time.
- Time zone.
- Target grade.
- Target subject.
- Eligibility.
- Question pool.
- Rules.
- Scoring.
- Ranking.
- Recurrence.
- Status.

The initial example may be Thursday at 7 PM, but this must not be hard-coded.

Supabase Cron can schedule recurring database jobs or invoke Edge Functions when external/server-side processing is required.

---

48. Social Features

The social layer is educational.

Initial concepts:

friendships
conversations
conversation_members
messages
game_invites

Social data is tenant-scoped.

The architecture must allow future moderation and safety controls.

---

49. Chat

Chat is implemented through:

PostgreSQL
+
Realtime

PostgreSQL stores authoritative message records.

Realtime delivers updates.

Private Realtime channels and authorization policies are required for protected communication.

---

50. Notifications

Conceptual entity:

notifications

Possible notification types:

- Lesson reminders.
- Achievement notifications.
- Challenge notifications.
- Friend/game events.
- Parent updates.
- Administrative notifications.

Notifications may be generated by database events, scheduled jobs, or Edge Functions depending on the requirement.

---

51. Storage

Supabase Storage is used for:

- Infographics.
- Images.
- Educational assets.
- Avatars.
- Generated media.
- Tenant assets.

Storage authorization must follow tenant/user access rules.

Storage objects must not be treated as normal application database records.

Supabase Storage uses RLS-based policies for access control, and its storage schema should be treated as managed infrastructure rather than modified as application tables.

---

52. Realtime

Realtime is used for:

- Multiplayer synchronization.
- Chat.
- Presence.
- Challenge activity.
- Notifications.
- Other appropriate live UI updates.

Realtime is not authoritative business state.

The authoritative state remains PostgreSQL.

---

53. Database Functions / RPC

Trusted transactional operations must be implemented as database functions where appropriate.

Initial expected functions include:

complete_lesson()

start_game_session()

submit_game_answer()

finish_game_session()

award_xp()

unlock_achievement()

get_student_dashboard()

get_parent_dashboard()

get_student_mastery()

get_student_recommendations()

join_challenge()

submit_challenge_answer()

finish_challenge()

join_game_room()

leave_game_room()

The final function list will be defined in the Database Functions Contract.

Supabase recommends Database Functions for data-intensive operations executed inside PostgreSQL and callable through the API.

---

54. Function Security

Database functions are part of the security boundary.

Function execution privileges must be explicitly controlled.

Sensitive functions must not automatically be executable by anonymous users or every authenticated user.

"SECURITY INVOKER" is the preferred default.

"SECURITY DEFINER" may only be used when necessary and must be implemented with explicit schema qualification, controlled search path, minimal privileges, and dedicated authorization tests. Supabase documents these precautions explicitly.

---

55. RLS Security Model

RLS is mandatory for exposed application tables and appropriate views.

Authorization follows:

Authenticated User
       ↓
Tenant Membership
       ↓
Role
       ↓
Resource Ownership / Relationship
       ↓
RLS Policy

Examples:

Tenant Admin
    ↓
Own Tenant

Student
    ↓
Own Student Context

Parent
    ↓
Explicitly Linked Children

Teacher/Staff
    ↓
Authorized Tenant Learning Data

Super Admin
    ↓
Platform-Level Scope

RLS must not trust arbitrary "tenant_id" values supplied by the browser.

Supabase currently recommends enabling RLS on every exposed table/view and separately controlling Postgres grants; policies alone do not replace grants.

---

56. Active Tenant Context

The active tenant is an authorization context, not merely a frontend variable.

The frontend may request a tenant context.

The database must verify:

Authenticated User
       ↓
Membership exists?
       ↓
Membership active?
       ↓
Role permits operation?
       ↓
Resource belongs to tenant?

The frontend cannot select an arbitrary tenant and thereby gain access.

---

57. Privileged Operations

The following must not be trusted to the browser:

- Final game score.
- XP awarding.
- Answer correctness.
- Lesson completion authority.
- Tenant provisioning.
- Role changes.
- Membership administration.
- Sensitive analytics generation.
- Publishing content.
- Access to correct answer keys.
- Administrative audit records.

These operations must use controlled database functions and/or Edge Functions.

---

58. Edge Functions

Supabase Edge Functions are reserved for operations that require server-side TypeScript or external integrations.

Examples:

AI integrations
Payment webhooks
External APIs
Email/notification providers
Content generation
Moderation services
Secure webhooks
Complex server-side workflows

Edge Functions are not required for ordinary CRUD.

Authenticated user calls must preserve the user's authorization context. Supabase supports authenticated Edge Function requests using the user's JWT and a Supabase client scoped to the caller's RLS policies.

---

59. Database Triggers

Triggers may be used for controlled database-side reactions such as:

- Maintaining derived metadata.
- Recording system events.
- Creating default profile records where appropriate.
- Updating timestamps.
- Maintaining carefully selected denormalized state.

Triggers must remain simple and deterministic.

Complex application workflows should use explicit database functions rather than deeply nested trigger chains.

---

60. Scheduled Processing

Scheduled jobs may be used for:

- Daily analytics aggregation.
- Streak maintenance.
- Challenge activation.
- Challenge closure.
- Recommendation refresh.
- Cleanup of expired records.
- Other periodic processing.

Supabase Cron/pg_cron is the preferred scheduling mechanism for database-native scheduled work.

---

61. Audit Logging

Conceptual entity:

audit_logs

Audit records may contain:

id
actor_user_id
tenant_id
action
entity_type
entity_id
metadata
created_at

Clients must not be able to forge administrative audit history.

Audit records should be generated through trusted operations.

---

62. Referential Integrity

Foreign keys and constraints must protect the educational hierarchy.

The database must prevent invalid relationships such as:

Tenant A
  └── Lesson A
       └── Subject B from Tenant B

and:

Tenant A Student
       ↓
Tenant B Progress

Where composite tenant-aware foreign keys are appropriate, they should be used.

Where structural enforcement is not practical, RLS and trusted functions must provide the authorization boundary.

---

63. Uniqueness

Uniqueness constraints must be scoped correctly.

Examples:

tenant + slug
tenant + student_code
tenant + subject_code
tenant + curriculum_code

Global uniqueness must only be used when the business rule truly requires it.

---

64. Indexing

Indexes must support the actual access patterns.

Priority areas:

- "tenant_id".
- "user_id".
- Membership lookup.
- Student profile lookup.
- Curriculum hierarchy.
- Lesson lookup.
- Progress.
- Game sessions.
- Question attempts.
- Learning events.
- Analytics queries.
- Challenge participation.
- Parent-child links.
- Social relationships.

RLS predicates must also be considered when designing indexes.

Supabase documents indexing columns used by RLS predicates as an important RLS performance practice.

---

65. Soft Delete and Lifecycle

Important mutable entities should use lifecycle states where appropriate.

Possible states:

active
inactive
suspended
archived
deleted

Hard deletion should be limited to records where deletion is safe and legally/operationally appropriate.

Learning history should generally remain auditable.

---

66. Migration Policy

The repository is the source of truth for database schema changes.

Schema changes must be implemented through versioned Supabase migrations.

Required process:

Design
  ↓
Migration
  ↓
Apply to development
  ↓
Verify schema
  ↓
Test RLS
  ↓
Test constraints
  ↓
Test functions
  ↓
Verify existing data
  ↓
Commit migration
  ↓
Promote

Manual Dashboard schema changes must not become undocumented production changes.

---

67. Existing Live Database

The current Supabase database already contains the initial curriculum dataset.

Before applying structural changes, the live database must be inspected.

The process is:

Current Live Schema
      ↓
Schema Audit
      ↓
Compare with this Master Plan
      ↓
Identify compatible existing structures
      ↓
Prepare migration
      ↓
Backup/Recovery verification
      ↓
Apply migration
      ↓
Run verification

Existing curriculum data must be preserved unless a deliberate data correction is required.

The current database should not be dropped simply because the frontend/backend are being rebuilt.

---

68. Existing Curriculum Snapshot

The current curriculum dataset is considered foundational development/demo data.

Previously recorded development snapshot:

Grades:       6
Terms:        12
Subjects:     114
Units:        374
Lessons:      1,360
Questions:    0
Games:        0
Challenges:   0
Students:     0
Memberships:  0

These counts must be re-verified against the live Supabase database before implementation begins.

The counts in this document are not a substitute for a live database audit.

---

69. Demo Data

The database must support a small controlled development/demo dataset.

The demo dataset should be sufficient to test:

- Curriculum navigation.
- Lesson flow.
- Content.
- Question flow.
- Games.
- Progress.
- XP.
- Analytics.
- Parent dashboard.
- Challenges.
- Tenant isolation.
- RLS.

Demo data is not production curriculum content.

Production curriculum ingestion must use the controlled content pipeline.

---

70. Production Curriculum Content

Production educational content must be inserted through the controlled content pipeline.

The pipeline must support:

Import
Validation
Review
Approval
Publication

The database must preserve enough metadata to identify:

- Source.
- Version.
- Import batch.
- Publisher/reviewer.
- Publication time.
- Content status.

---

71. Data Integrity Rules

The database must enforce, where practical:

- Required foreign keys.
- Valid enum/status values.
- Unique constraints.
- Non-null requirements.
- Tenant consistency.
- Valid parent-child relationships.
- Valid game/session relationships.
- Valid student ownership.
- Valid challenge participation.
- Valid XP transaction references.

Business rules that require multiple-row transactions should be implemented through trusted database functions.

---

72. Anti-Cheat Principles

The browser is an untrusted client.

The database must remain authoritative for:

Question eligibility
Answer correctness
Score
XP
Completion
Achievements
Challenge results

The system should use:

- Server/database-side evaluation.
- Idempotency protections.
- Immutable attempt records.
- Session validation.
- Transactional scoring.
- Audit trails.

---

73. Dashboard Read Models

Student and parent dashboards should not require the frontend to assemble dozens of unrelated queries when a safe read model can provide the result efficiently.

Possible implementations:

Views
Materialized Views
Database Functions
RPC read models
Summary tables

Examples:

student_dashboard
parent_child_dashboard
student_subject_summary
student_mastery_summary

The final implementation will be chosen after schema and query analysis.

---

74. Database vs Frontend Responsibility

The frontend is responsible for:

Rendering
Interaction
Navigation
Animations
Game UI
Forms
Client-side validation for UX
Realtime subscriptions

The database/backend platform is responsible for:

Authorization
Tenant isolation
Data integrity
Eligibility
Completion authority
Game scoring
XP
Learning facts
Analytics facts

Client-side calculations may exist for presentation/UX but must never be treated as authoritative.

---

75. Database vs Edge Function Responsibility

Use PostgreSQL functions for:

Data-intensive operations
Transactions
Scoring
Eligibility
Progress updates
XP
Analytics queries
Database-native business rules

Use Edge Functions for:

AI
External APIs
Webhooks
Secrets
Email providers
Payment providers
Complex external workflows

This separation follows the intended Supabase architecture: Database Functions for data-intensive database work and Edge Functions for low-latency/server-side TypeScript use cases.

---

76. Realtime Security

Realtime must follow authorization rules.

For protected channels:

Private Channel
       ↓
Authenticated User
       ↓
Realtime Authorization
       ↓
Tenant/Resource Permission

Public channels must not be used for sensitive tenant data.

Supabase supports private-channel authorization using RLS policies on "realtime.messages"; production multiplayer/chat architecture should use this mechanism.

---

77. Storage Security

Storage paths must encode enough ownership/tenant context to support secure policies.

Example conceptual structure:

tenant/{tenant_id}/lessons/{lesson_id}/...
tenant/{tenant_id}/students/{student_id}/...
tenant/{tenant_id}/assets/...

Public access must be deliberate.

Private educational assets must use Storage authorization policies.

The application must use the Storage API rather than directly modifying the managed storage tables.

---

78. Backup and Recovery

Before major schema changes:

Verify backup/recovery capability
        ↓
Inspect current schema
        ↓
Create migration
        ↓
Apply
        ↓
Verify

The project must never depend on an undocumented manual database state.

---

79. Security Verification

Before production:

- All exposed tables must have appropriate RLS.
- Grants must match intended access.
- Sensitive functions must have controlled EXECUTE privileges.
- Correct answers must remain protected.
- Tenant isolation must be tested.
- Parent-child authorization must be tested.
- Realtime authorization must be tested.
- Storage policies must be tested.
- Edge Functions must protect secrets.
- Audit records must be protected.

Supabase's current guidance explicitly recommends testing RLS allow/deny behavior and using "supabase test db" as part of database security verification.

---

80. Core Learning Relationship

The core educational data flow is:

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
  ↓
Content / Concepts
  ↓
Questions
  ↓
Game
  ↓
Game Session
  ↓
Question Attempts
  ↓
Progress / XP
  ↓
Learning Events
  ↓
Analytics
  ↓
Mastery
  ↓
Recommendations

---

81. Parent Learning Relationship

Parent
  ↓
Explicit Child Link
  ↓
Tenant Student Profile
  ↓
Learning Progress
  ↓
Subject Performance
  ↓
Mastery / Analytics
  ↓
Recommendations

Parent access never bypasses the child's tenant-scoped authorization.

---

82. Student Game Relationship

Student
  ↓
Active Tenant Membership
  ↓
Eligible Lessons
  ↓
Eligible Questions
  ↓
Game
  ↓
Game Session
  ↓
Question Attempts
  ↓
Score
  ↓
XP
  ↓
Learning Event
  ↓
Analytics

---

83. Final Database Architecture

The final TheTutor backend data architecture is:

                     Supabase
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
      Auth          PostgreSQL        Storage
                        │
             ┌──────────┼───────────┐
             │          │           │
             ▼          ▼           ▼
            RLS        RPC       Triggers
             │          │           │
             └──────────┼───────────┘
                        │
                 Views / Analytics
                        │
                  Scheduled Jobs
                        │
                 ┌──────┴──────┐
                 ▼             ▼
             Realtime      Edge Functions

---

84. Database Contract Summary

TheTutor database must provide:

Identity

Supabase Auth
profiles
tenant_memberships

Tenancy

tenants
tenant_memberships
tenant-scoped resources
RLS

Education

curricula
grades
terms
subjects
units
lessons
concepts
content_versions
content_blocks

Assessment

questions
question_options
question_concepts

Games

game_types
games
game_configurations
game_sessions
game_session_questions
question_attempts

Progress

lesson_progress
progress/derived summaries
learning_events

Gamification

xp_transactions
streaks
achievements
student_achievements
leaderboards/read models

Analytics

analytics_daily_student
analytics_concept_daily
student_subject_metrics
concept_mastery
learning_recommendations

Challenges

challenges
challenge_questions
challenge_participants
challenge_results

Multiplayer / Social

game_rooms
game_room_players
friendships
conversations
conversation_members
messages
game_invites

Notifications

notifications

SaaS

plans
subscriptions

Content Operations

content_generation_jobs
content_import_batches
content_versions

Governance

audit_logs

---

85. Implementation Order

The database implementation must follow this order:

1. Inspect current live Supabase schema
        ↓
2. Verify existing curriculum data
        ↓
3. Finalize physical schema
        ↓
4. Create versioned migrations
        ↓
5. Apply schema changes
        ↓
6. Add constraints and indexes
        ↓
7. Configure RLS
        ↓
8. Create database functions/RPC
        ↓
9. Configure triggers
        ↓
10. Create analytics views/materialized views
        ↓
11. Configure Cron jobs where required
        ↓
12. Configure Storage policies
        ↓
13. Configure Realtime authorization
        ↓
14. Run database/security tests
        ↓
15. Verify existing curriculum
        ↓
16. Generate TypeScript database types
        ↓
17. Begin frontend implementation

---

86. Final Source-of-Truth Rule

For TheTutor:

PostgreSQL
    =
Authoritative application data

RLS
    =
Authorization boundary

Database Functions
    =
Trusted transactional business logic

Realtime
    =
Synchronization

Edge Functions
    =
Server-side TypeScript / external integrations

React + TypeScript
    =
User interface and game presentation

Vercel
    =
Frontend deployment platform

No frontend state, client-side calculation, or external processing layer may silently become a competing source of truth.

---

87. Definition of Done for the Database

The database foundation is considered ready for frontend implementation only when:

[ ] Physical schema matches this contract
[ ] Existing curriculum is verified
[ ] Foreign keys are valid
[ ] Tenant isolation is verified
[ ] RLS is enabled and tested
[ ] Grants are correct
[ ] Parent-child authorization is tested
[ ] Student authorization is tested
[ ] Game eligibility rules are implemented
[ ] Correct answers are protected
[ ] Game scoring is database-authoritative
[ ] XP is transaction-based
[ ] Learning events are recorded
[ ] Core dashboard read models work
[ ] Analytics foundation works
[ ] Storage policies work
[ ] Realtime authorization works
[ ] Sensitive RPC permissions are restricted
[ ] Migrations are committed
[ ] Database tests pass
[ ] Security Advisor has no actionable findings
[ ] TypeScript types can be generated

Only after these conditions are satisfied should the project move to the remaining architecture documents and frontend implementation.

---

88. Final Architecture Statement

TheTutor is a multi-tenant educational SaaS platform built around:

React + TypeScript
        +
Vercel
        +
Supabase

Supabase provides the managed backend platform through:

Auth
PostgreSQL
RLS
Database Functions
Triggers
Analytics
Realtime
Storage
Cron
Edge Functions

The database is the authoritative source of educational and learning state.

Security is enforced at the database and Supabase service boundaries.

Games are rendered by the TypeScript frontend but remain authoritative through database-controlled sessions, eligibility, scoring, XP, and learning events.

Analytics are primarily database-driven and do not require a separate Python backend for the MVP.

The architecture is intentionally simple enough to build and maintain while remaining extensible for:

- Advanced games.
- Multiplayer.
- AI.
- Advanced analytics.
- Additional curricula.
- Additional tenants.
- Additional subscription models.
- Future external services.