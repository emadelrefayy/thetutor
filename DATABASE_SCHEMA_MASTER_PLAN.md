TheTutor — Database Schema Master Plan

Status: FINAL DATABASE CONTRACT
Version: 1.0
Date: 2026-08-31
Platform: TheTutor
Database: Supabase PostgreSQL
Architecture: Multi-Tenant Educational SaaS

---

1. Document Purpose

This document is the authoritative database specification for TheTutor.

It defines the database model required to support:

- Multi-tenant educational organizations.
- Independent curricula per tenant.
- Multiple tenant memberships for the same global user identity.
- Tenant-specific student identities and learning contexts.
- Students, parents, administrators, and platform administrators.
- Curriculum, subjects, units, lessons, and educational content.
- AI-assisted content generation and controlled publishing.
- Question banks and game-based learning.
- Lesson, unit, and subject games.
- Difficulty levels and extensible game types.
- Student progress and mastery.
- XP, achievements, streaks, and leaderboards.
- Advanced learning analytics.
- Personalized recommendations.
- Weekly challenges.
- Friends, educational chat, and multiplayer games.
- Notifications.
- SaaS plans and subscriptions.
- Auditability.
- Strong Row Level Security and tenant isolation.
- Future expansion without redesigning the core database.

This document is a database contract.

Application code must conform to this contract.

---

2. Core Architectural Principles

2.1 Multi-Tenancy Is a Security Boundary

TheTutor is a true multi-tenant platform.

A tenant can represent:

- A school.
- An educational center.
- Another educational organization.

Each tenant owns its own educational environment.

Tenant data must never leak between tenants.

Tenant isolation is enforced at the database layer using PostgreSQL Row Level Security (RLS), not only through frontend or backend filtering.

---

2.2 Global Identity vs Tenant Identity

A user has one global authentication identity.

The same global identity may participate in multiple tenants.

Example:

Global User
│
├── Tenant A
│   └── Student Profile A
│
├── Tenant B
│   └── Student Profile B
│
└── Tenant C
    └── Student Profile C

The tenant-specific student profile represents the student's identity and learning context inside that tenant.

Therefore:

- Names may be the same across tenants.
- Student codes may differ.
- Grades may differ.
- Curriculum may differ.
- Progress must differ.
- XP and achievements must be tenant-scoped unless explicitly defined as global.
- Games and game history must be tenant-scoped.
- Analytics must be tenant-scoped.
- Social relationships must be tenant-scoped.

The global authentication identity must not be treated as the complete student identity.

---

3. Tenant Model

3.1 Tenant

The "tenants" entity represents an educational customer/environment.

Minimum conceptual fields:

id
name
slug / subdomain
status
settings
created_at
updated_at
deleted_at

Tenant lifecycle must support states such as:

active
suspended
inactive
archived
deleted

Soft deletion is preferred over destructive deletion.

---

4. Platform Roles

The platform has two administrative scopes.

4.1 Platform Super Admin

The Platform Super Admin operates the entire TheTutor platform.

Responsibilities include:

- Creating tenants.
- Managing tenants.
- Suspending tenants.
- Managing platform plans.
- Managing tenant subscriptions.
- Managing tenant-level administration.
- Performing controlled support/administrative operations.
- Managing platform-level configuration.

The Platform Super Admin is not automatically an administrator of the internal learning operations of every tenant.

---

4.2 Tenant Admin

A Tenant Admin operates one tenant.

Responsibilities include managing the tenant's own:

- Students.
- Parents.
- Tenant users.
- Curriculum configuration.
- Learning environment.
- Challenges.
- Tenant settings.
- Tenant subscriptions/features where permitted.

A Tenant Admin must never be able to access or manage another tenant's data.

---

5. Membership Model

The database must not store a single "tenant_id" on the global user as the only representation of tenancy.

Instead:

global user
    ↓
tenant_membership
    ↓
tenant-specific profile

This allows one user to belong to multiple tenants.

Conceptually:

tenant_memberships
------------------
id
tenant_id
user_id
role
status
created_at
updated_at

---

6. Student Model

A tenant-specific student profile is represented independently from the global identity.

Conceptually:

tenant_student_profiles
-----------------------
id
tenant_id
membership_id
student_code
display_name
grade_id
level
xp
status
created_at
updated_at
deleted_at

The exact physical column names must follow the actual migration/schema implementation.

The essential invariant is:

«A student profile belongs to exactly one tenant context.»

A global user can have multiple student profiles across different tenants.

---

7. Parent Model

A parent can be associated with multiple children.

The relationship must be many-to-many where required by the business model.

Conceptually:

parent
   │
   ├── child A
   ├── child B
   └── child C

The parent-child relationship must also be tenant-scoped.

Student onboarding does not require a mandatory parent approval gate.

Parent linking may happen later.

Parent access to student data must be limited to explicitly linked children.

---

8. Curriculum Model

Curriculum is tenant-scoped.

The basic hierarchy is:

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

This structure must support different curricula for different tenants.

Example:

Tenant A
└── Egyptian Experimental Languages Curriculum

Tenant B
└── Egyptian Government Curriculum

Tenant C
└── Custom Educational Curriculum

No tenant should be forced to use one global curriculum.

---

9. Curriculum Entities

The core curriculum hierarchy consists conceptually of:

curricula
grades
terms
subjects
units
lessons

Each tenant-scoped educational entity must be associated with its tenant context.

The database must enforce valid parent-child relationships.

Examples:

- A subject belongs to the correct curriculum/term context.
- A unit belongs to the correct subject.
- A lesson belongs to the correct unit.
- Cross-tenant parent references must be impossible.

---

10. Lesson Model

Lessons represent the atomic educational content consumed by students.

A lesson may contain or reference:

- Title.
- Description.
- Learning objectives.
- Content.
- Concepts.
- Media.
- Video.
- Infographic.
- Supporting assets.
- Questions.
- Games.
- Metadata.
- Publication state.

Lesson content must support versioning.

---

11. Content Lifecycle

AI-generated educational content must not automatically become public content.

Required conceptual lifecycle:

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

The database must preserve content versions where necessary.

---

12. AI Content Generation

The Content Generator is a separate content-production subsystem.

It may create:

- Lessons.
- Lesson content.
- Questions.
- Explanations.
- Activities.
- Game content.
- Supporting metadata.

The generator must operate through controlled jobs/imports.

Conceptual entities include:

content_generation_jobs
content_versions
content_import_batches

The generator must not have unrestricted authority to publish arbitrary content.

---

13. Question Bank

Questions are reusable learning objects associated with educational content.

Questions must support:

- Question type.
- Difficulty.
- Lesson association.
- Concept association.
- Correct answer.
- Answer options where applicable.
- Explanation/feedback.
- Metadata.
- Publication status.
- Versioning where required.

Supported initial question/game patterns include:

- Multiple choice.
- True/False.
- Matching.
- Ordering.
- Fill in the blank.
- Image choice.
- Drag and drop.

The system must remain extensible so new types can be added without redesigning the entire game architecture.

---

14. Question Security

The raw question bank must not be exposed directly to untrusted clients.

In particular:

correct_answer

must never be exposed to the browser as part of a normal student question-bank query.

Question selection and scoring must be performed through trusted backend/database operations.

---

15. Game Architecture

Games are learning mechanisms, not merely entertainment objects.

The database must support games at:

Lesson level
Unit level
Subject level
Challenge level
Multiplayer level

A game may draw questions from lessons that the student is eligible to access.

The eligibility rules must be enforced by the backend/database contract.

---

16. Game Extensibility

Game types must be data-driven/extensible.

Conceptually:

Game Type
   ↓
Game Definition
   ↓
Configuration
   ↓
Question Selection
   ↓
Game Session
   ↓
Attempts
   ↓
Score
   ↓
XP
   ↓
Progress
   ↓
Analytics

The initial set of game types is not a permanent limit.

Future game types must be addable without restructuring the entire database.

---

17. Difficulty

Games/questions must support multiple difficulty levels.

The initial required levels are:

Easy
Medium
Hard

Difficulty must be represented in a way that allows future calibration and analytics.

---

18. Game Sessions

A game session represents one execution of a game by a student.

Conceptually:

game_sessions
game_session_questions
question_attempts

The system must be able to determine:

- Which student played.
- Which tenant context was active.
- Which game was played.
- Which questions were presented.
- Which answers were submitted.
- Correctness.
- Score.
- Duration.
- Difficulty.
- XP awarded.
- Completion state.

The client must not be trusted to determine the final score.

---

19. Student Progress

Progress must be tenant-scoped.

The system must support tracking:

Lesson Progress
Unit Progress
Subject Progress
Curriculum Progress

Progress must support:

- Started.
- In progress.
- Completed.
- Mastery where applicable.
- Last activity.
- Completion timestamps.
- Learning events.

Games must respect the student's actual learning eligibility.

---

20. XP

XP is accumulated through learning activities.

The system must retain the transaction/history of XP changes rather than relying only on one mutable total.

Conceptually:

xp_transactions

This allows:

- Auditing.
- Recalculation.
- Analytics.
- Anti-cheat investigation.
- Leaderboards.

XP must be scoped according to the active tenant learning context.

---

21. Streaks

Student learning streaks must be tracked.

Conceptually:

student_streaks

Streak calculation must be based on valid learning activity rather than arbitrary client-side writes.

---

22. Achievements

The system must support achievement/badge-style learning rewards.

Achievements should be capable of being triggered by:

- Lesson completion.
- Subject progress.
- XP milestones.
- Streaks.
- Challenges.
- Game performance.
- Other learning events.

The achievement system must remain extensible.

---

23. Leaderboards

The platform must support multiple leaderboard scopes.

Examples:

Global Student XP
Tenant XP
Grade
Subject
Weekly
Challenge
Game

The database design must prevent leaderboard queries from crossing unauthorized tenant boundaries.

---

24. Learning Events

Learning events are a foundational analytics source.

Conceptually:

learning_events

Events may include:

- Lesson started.
- Lesson completed.
- Question presented.
- Question answered.
- Game started.
- Game completed.
- Challenge joined.
- Challenge completed.
- Achievement earned.
- XP awarded.
- Learning activity performed.

Events must retain enough context to support advanced analytics.

---

25. Advanced Analytics

Analytics are part of the architecture from the beginning.

The database must support:

Raw Learning Events
        ↓
Aggregated Metrics
        ↓
Mastery
        ↓
Recommendations

Conceptual analytics entities include:

analytics_daily_student
analytics_concept_daily
student_subject_metrics
concept_mastery
learning_recommendations

Metrics should support:

- Completion.
- Accuracy.
- Mastery.
- Weak concepts.
- Strong concepts.
- XP.
- Streak.
- Performance trends.
- Learning velocity where available.
- Time-on-task where available.
- Difficulty performance.
- Question-level performance.
- Subject-level performance.
- Recommendation signals.

---

26. Analytics and Python

The backend may use Python analytics libraries for advanced analysis.

The database must therefore preserve sufficiently rich event/fact data so analytics can evolve without repeatedly redesigning the operational schema.

The database is the source of learning facts.

Python is an analytics/processing layer, not the source of truth for transactional learning state.

---

27. Recommendations

The recommendation system uses learning evidence.

Recommendations may identify:

- Weak concepts.
- Lessons that should be reviewed.
- Skills requiring reinforcement.
- Appropriate difficulty.
- Suggested games.
- Suggested learning activities.

Recommendations must be tenant-aware.

---

28. Weekly Challenges

Challenges are configurable entities.

The schedule must not be hard-coded permanently to Thursday 7 PM.

A tenant administrator must be able to configure:

- Start time.
- End time.
- Time zone.
- Target grade.
- Target subject.
- Questions/content.
- Rules.
- Scoring.
- Eligibility.
- Ranking.
- Recurrence.

The initial business example may use Thursday at 7 PM, but the database must support arbitrary configuration.

---

29. Multiplayer

Multiplayer is part of the planned platform architecture.

Conceptual entities:

game_rooms
game_room_players

A multiplayer session must be tenant-scoped.

It must support:

- Room creation.
- Player joining.
- Player state.
- Game state.
- Results.
- Ranking.
- Completion.
- Realtime synchronization.

Realtime state must not bypass authorization.

---

30. Educational Social System

The social layer is intentionally educational.

It is not intended to become a generic social network.

Features include:

Friends
Chat
Educational conversations
Game invitations
Challenges
Multiplayer activities

Friendship and communication data must be tenant-scoped.

Future moderation/safety controls must be supported by the architecture.

---

31. Notifications

The database supports notifications for events such as:

- Learning reminders.
- Achievement notifications.
- Challenge notifications.
- Friend/game events.
- Parent updates.
- Administrative events.

Conceptual entity:

notifications

---

32. SaaS Plans

The platform supports subscription concepts:

plans
subscriptions

Plans may define:

- Features.
- Limits.
- Billing period.
- Status.
- Tenant entitlement.

Payment gateway integration is not required for the initial MVP.

The Platform Super Admin can initially manage subscriptions administratively.

---

33. Storage

Supabase Storage may be used for:

- Images.
- Infographics.
- Educational assets.
- User/tenant assets.
- Generated media.

Storage access must follow the same tenant-isolation principles as database data.

Public/private exposure must be deliberate.

---

34. Realtime

Supabase Realtime is part of the platform architecture for:

- Multiplayer state.
- Chat.
- Presence where required.
- Challenge activity where required.
- Notifications where appropriate.

Realtime subscriptions must respect tenant and user authorization.

---

35. RLS Security Model

Row Level Security is mandatory.

The database must enforce:

Platform Super Admin
        ↓
Platform scope

Tenant Admin
        ↓
Own Tenant

Tenant User
        ↓
Own Tenant permissions

Student
        ↓
Own tenant-specific learning context

Parent
        ↓
Only explicitly linked children

RLS must not rely solely on client-provided "tenant_id".

Tenant context must be derived/validated from authenticated membership and trusted backend logic.

---

36. Privileged Operations

Sensitive operations must not be directly executable by an untrusted browser.

Examples:

- Game scoring.
- XP awarding.
- Tenant provisioning.
- Privileged membership operations.
- Sensitive analytics operations.
- Question-bank access containing answers.
- Administrative operations.

These operations should be exposed through trusted backend/API/RPC mechanisms with appropriate authorization.

---

37. Soft Delete

Important mutable entities should use soft-delete/lifecycle fields where appropriate.

Typical state model:

active
inactive
suspended
archived
deleted

Hard deletion should be reserved for cases where it is explicitly safe and required.

---

38. Audit Logging

Administrative and security-sensitive operations must be auditable.

Conceptual entity:

audit_logs

Audit records should identify, where applicable:

- Actor.
- Tenant.
- Action.
- Target entity.
- Target ID.
- Timestamp.
- Relevant metadata.

Clients must not be allowed to forge audit records.

---

39. Referential Integrity

Foreign keys and constraints must protect the hierarchy.

The database must prevent invalid relationships such as:

Tenant A Lesson
       ↓
Tenant B Subject

or:

Tenant A Student
       ↓
Tenant B Progress

Cross-tenant references must be structurally prevented wherever practical.

---

40. Indexing

Indexes must support the primary access paths:

- Tenant filtering.
- Membership lookup.
- Student profile lookup.
- Curriculum hierarchy traversal.
- Lesson lookup.
- Game/session lookup.
- Progress lookup.
- Analytics queries.
- Challenge participation.
- Social relationships.

Indexes must be reviewed against actual backend query patterns before aggressive cleanup.

Unused indexes should not be removed blindly before production workload is known.

---

41. Migration Policy

The database schema is managed through versioned migrations.

The repository is the source of truth for schema changes.

Application developers and AI agents must:

1. Create a migration.
2. Apply it to the development environment.
3. Verify the result.
4. Test RLS and constraints.
5. Commit the migration.
6. Promote the migration through environments.

Manual dashboard changes must not become undocumented production schema changes.

---

42. Seed / Demo Data

The platform requires a small professional demo dataset.

The demo data should represent real educational structure and should be based on authentic Egyptian primary-school curriculum context where legally and operationally appropriate.

The demo dataset must remain intentionally small.

It should be sufficient to test:

- Curriculum navigation.
- Lesson flow.
- Question flow.
- Games.
- Progress.
- XP.
- Analytics.
- Parent dashboard.
- Challenges.
- Tenant isolation.

It must not be treated as the production curriculum content.

Production curriculum ingestion will be handled through the Content Generator/content pipeline.

---

43. Current Database State

The current development/demo database contains the curriculum snapshot used for system validation.

Current verified counts:

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

The existing curriculum is assigned to the controlled development/demo tenant.

No real student accounts are required for the database foundation.

---

44. Current Security State

The database must maintain:

RLS: enabled
Tenant isolation: required
Privileged operations: backend-controlled
Question-answer exposure: blocked
Audit writes: protected

The Supabase Security Advisor must remain free of actionable security findings before a release is considered production-ready.

---

45. Database Contract for Backend

The backend must treat the database as authoritative for:

- Identity relationships.
- Tenant membership.
- Authorization.
- Curriculum hierarchy.
- Student eligibility.
- Progress.
- Game sessions.
- Scores.
- XP.
- Learning events.
- Analytics facts.

The backend must not duplicate business truth in an unrelated database.

---

46. Database Contract for Frontend

The frontend must never assume that client state is authoritative.

The frontend must:

- Obtain authenticated user state.
- Resolve active tenant context.
- Request authorized data.
- Display server-derived progress.
- Display server-derived XP.
- Submit answers through trusted APIs.
- Never receive protected answer keys.
- Never calculate authoritative scores.
- Never bypass tenant boundaries.

---

47. Expected Core Relationship

The complete learning path is:

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
Concept / Content
  ↓
Question
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
Recommendations

---

48. Parent Learning Path

Parent
  ↓
Linked Children
  ↓
Tenant-specific Student Profiles
  ↓
Learning Progress
  ↓
Subject Performance
  ↓
Analytics
  ↓
Recommendations / Reports

Parent access must never expose unrelated students.

---

49. Tenant Boundary

Every tenant-scoped operation must follow:

Authenticated User
        ↓
Tenant Membership
        ↓
Tenant Context
        ↓
Authorized Entity
        ↓
Operation

The "tenant_id" received from a client must never be trusted as proof of authorization.

---

50. Source of Truth Hierarchy

For implementation:

1. Database migrations
2. This database contract
3. System Contract
4. Backend Architecture
5. Frontend Architecture
6. Implementation Master Plan
7. Application code

If code contradicts the database contract, the contradiction must be resolved before continuing implementation.

---

51. Definition of Done — Database

The database phase is considered complete when:

- [x] Multi-tenant model exists.
- [x] Tenant memberships exist.
- [x] Tenant-specific student profiles exist.
- [x] Parent-child linking exists.
- [x] Tenant-scoped curriculum exists.
- [x] Lesson hierarchy exists.
- [x] Content lifecycle exists.
- [x] Question infrastructure exists.
- [x] Game infrastructure exists.
- [x] Game sessions exist.
- [x] Progress infrastructure exists.
- [x] XP infrastructure exists.
- [x] Analytics infrastructure exists.
- [x] Recommendations infrastructure exists.
- [x] Challenges exist.
- [x] Multiplayer foundation exists.
- [x] Social/chat foundation exists.
- [x] Notifications exist.
- [x] SaaS subscription foundation exists.
- [x] Audit logging exists.
- [x] Soft-delete/lifecycle support exists.
- [x] RLS tenant isolation exists.
- [x] Privileged operations are protected.
- [x] Question-answer exposure is protected.
- [x] Database changes are migration-managed.

---

52. Database Phase Boundary

The database is now considered the stable foundation for the application implementation.

Future migrations are permitted only when they represent:

- A genuinely new product capability.
- A validated performance improvement.
- A security improvement.
- A required correction to an actual schema defect.

Migrations must not be created merely because Backend and Frontend implementations were designed without consulting this contract.

---

53. Next Phase

The next phase is not another database redesign.

The next phase is:

DATABASE
   ↓
SYSTEM CONTRACT
   ↓
BACKEND ARCHITECTURE
   ↓
API CONTRACT
   ↓
FRONTEND ARCHITECTURE
   ↓
IMPLEMENTATION

The backend and frontend must be designed against this database contract.