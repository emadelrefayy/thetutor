TheTutor — Project Architecture

1. Architecture Status

This document defines the current target architecture for TheTutor.

The architecture is intentionally organized from platform-level concerns down to curriculum content and interactive learning.

The primary hierarchy is:

Platform
└── Tenants
    └── Users
        ├── Super Admin
        ├── Tenant Admin
        ├── Parent
        └── Student
            └── Curriculum Access
                └── Grade
                    └── Term
                        └── Subject
                            └── Unit
                                └── Lesson
                                    ├── Lesson Content
                                    ├── Video
                                    ├── Infographic
                                    └── Lesson Game
                                        └── Questions

Games are treated as first-class learning resources.

They are not required to exist before the curriculum pages can be implemented.

The application must therefore support curriculum navigation and learning content independently from the game implementation, while keeping a stable contract for connecting games later.

---

2. Product Model

TheTutor is a multi-tenant educational SaaS platform for primary-school students.

The platform serves:

- Super Admin
- Tenant Admin
- Parent
- Student

Each tenant is logically isolated.

A student's identity within a tenant must never be resolved by name alone.

The authoritative relationship is based on identifiers and tenant membership.

Names are presentation data only.

---

3. Tenant Isolation

Tenant isolation is a core architectural requirement.

The application must always distinguish between:

platform identity
tenant membership
student profile
curriculum access

A student may potentially be associated with more than one tenant.

Therefore:

student name

is never considered a unique identifier.

The system must use stable identifiers such as:

user_id
profile_id
student_profile_id
tenant_id

and the database/RLS layer must enforce tenant boundaries.

Client-side filtering is not considered a security boundary.

---

4. Authentication and Roles

The authentication layer is based on Supabase Auth.

The authenticated account is resolved to its application profile and role.

Supported roles:

super_admin
tenant_admin
parent
student

The login flow is:

Landing Page
      ↓
Login
      ↓
Authenticated User
      ↓
Profile / Role Resolution
      ↓
Role-specific Dashboard

The role-specific destinations are:

Super Admin
    ↓
SuperAdminDashboard

Tenant Admin
    ↓
TenantAdminDashboard

Parent
    ↓
ParentDashboard

Student
    ↓
StudentDashboard

The client must not trust arbitrary role values supplied by the user.

Authorization must ultimately be enforced by the backend/database policies.

---

5. Public Application Flow

The public application starts with a landing page.

/

The landing page provides:

- platform introduction
- educational value proposition
- curriculum overview
- platform features
- login entry point

The login page is:

/login

After authentication, the application resolves the user's role and routes to the appropriate dashboard.

---

6. Student Curriculum Flow

The student curriculum navigation is hierarchical.

Student Dashboard
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

The current route hierarchy follows this model:

/grades/:gradeId/terms
/grades/:gradeId/terms/:termId/subjects
/grades/:gradeId/terms/:termId/subjects/:subjectId/units
/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons
/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons/:lessonId

IDs in routes are navigation identifiers only.

They must not bypass database authorization.

---

7. Lesson Architecture

A lesson is a learning resource composed of multiple content types.

A lesson may contain:

Lesson
├── title
├── description/content
├── video
├── infographic
├── progress
└── game

The lesson page should therefore provide a complete learning experience rather than displaying only textual content.

The intended lesson experience is:

Lesson
  ↓
Lesson Content
  ↓
Video Explanation
  ↓
Infographic
  ↓
Student Progress
  ↓
Lesson Game

The absence of a game must not prevent the lesson itself from loading.

---

8. Content Resources

Educational content is treated as data-driven content.

Lesson resources may include:

content
video_url
infographic_url

These resources can be injected through the content pipeline.

The content pipeline must not require game assets to exist before a lesson can be published.

Games are independently managed learning resources.

---

9. Game Architecture

Games are first-class educational resources.

The platform will eventually contain internal game implementations inside the same repository.

The objective is to avoid unnecessary external game infrastructure and reduce resource and hosting complexity where practical.

The game system must support multiple game types rather than one universal game implementation.

Examples include:

multiple choice
true / false
matching
ordering
classification
memory
timed challenge
progressive challenge
mixed question game

The exact game catalogue may expand over time.

The application architecture must therefore use a common game contract rather than hard-coding one game type into curriculum pages.

---

10. Game Scope

Games exist at three curriculum levels.

10.1 Lesson Game

A lesson game evaluates the student's understanding of a specific lesson.

Lesson
  ↓
Lesson Game

The game can only use questions eligible for that lesson and the student's current learning state.

---

10.2 Unit Game

A unit game evaluates the lessons belonging to a unit.

Unit
 ├── Lesson 1
 ├── Lesson 2
 ├── Lesson 3
 └── Unit Game

The question pool must be restricted to eligible lessons within the unit.

---

10.3 Subject Game

A subject game evaluates the student's completed learning scope within the subject.

Subject
 ├── Unit
 │    ├── Lesson
 │    └── Lesson
 ├── Unit
 │    ├── Lesson
 │    └── Lesson
 └── Subject Game

The game must not automatically expose questions from lessons that the student has not completed.

---

11. Game Eligibility

Game eligibility is determined from the student's actual learning progress.

The game system must distinguish between:

lesson exists

and:

student completed lesson

Only the second condition makes lesson content eligible for student gameplay.

Conceptually:

Student
   ↓
Completed Lessons
   ↓
Eligible Questions
   ↓
Game Session

This rule applies to:

- lesson games
- unit games
- subject games

The frontend must never be the authoritative source for eligibility.

Eligibility must be derived from trusted application/database state.

---

12. Difficulty System

Games support multiple difficulty levels.

The baseline difficulty model is:

easy
medium
hard

Difficulty is a property of the game/question experience, not merely a visual label.

The question-selection system must be capable of selecting questions according to the requested difficulty.

The system must also allow future expansion, for example:

easy
medium
hard
expert
adaptive

without requiring changes to the curriculum hierarchy.

---

13. Adaptive / Progressive Gameplay

The game system is designed to support progressive difficulty.

A game session may evaluate:

accuracy
speed
attempt history
difficulty performance
completed lessons
question history

and use those signals to determine the appropriate next question or difficulty.

The first implementation does not have to be fully adaptive.

However, the data model and game contract must not prevent adaptive gameplay later.

---

14. Question Bank

Questions are independent learning objects.

A question may contain:

question content
question type
difficulty
lesson association
unit/subject scope
answer data
explanation
metadata

Questions should be associated with curriculum content through stable identifiers.

The system must avoid relying on question titles or lesson names as relationships.

---

15. Game Definition

A game definition represents the configuration of a playable game.

Conceptually:

GameDefinition
├── id
├── scope
├── scope_id
├── game_type
├── difficulty
├── title
├── configuration
├── route
└── enabled

Where:

scope =
    lesson
    unit
    subject

The game definition identifies which curriculum level the game belongs to.

The route is an application navigation resource.

It is not an authorization mechanism.

---

16. Internal Game Routes

Games will ultimately be implemented inside the TheTutor repository.

The route structure should remain predictable.

Conceptually:

/games/lesson/:gameId
/games/unit/:gameId
/games/subject/:gameId

The exact route implementation may evolve, but curriculum pages must depend on a stable game reference rather than knowing implementation details of the game component.

---

17. Game URL / Route Reference

The curriculum layer may expose a game route/reference.

For example:

lesson
  ↓
game reference
  ↓
/games/lesson/:gameId

This reference is analogous to other content resources such as:

video_url
infographic_url

but it has an important architectural difference:

A game route identifies an interactive application resource.

It must not be treated as a public unauthenticated resource.

The game route must validate:

authenticated user
tenant context
student profile
game scope
game eligibility

before allowing gameplay.

---

18. Game Session

A game session represents one actual play attempt.

Conceptually:

Student
   ↓
Game
   ↓
Game Session
   ↓
Questions
   ↓
Answers
   ↓
Score
   ↓
Analytics

A session should be associated with stable identifiers.

A session must not rely on client-provided student names.

---

19. Scoring

Game scoring must support more than a single raw score.

Potential metrics include:

score
correct answers
incorrect answers
accuracy
time
difficulty
completion
streak

The scoring model must remain extensible.

The raw game result should be persisted before higher-level analytics are generated.

---

20. Analytics

Game results feed the learning analytics layer.

The analytics pipeline can eventually calculate:

subject performance
unit performance
lesson performance
difficulty performance
question-type performance
progress trends
weak areas
strong areas
recommendations

These results can be consumed by:

Student Dashboard
Parent Dashboard

Tenant and platform administration may receive aggregate analytics according to authorization.

---

21. Parent Experience

A parent may have multiple children.

The parent dashboard therefore follows:

Parent
 ├── Student A
 ├── Student B
 └── Student C

Children may belong to different grades.

The parent dashboard must use student identifiers and tenant relationships rather than assuming all children share:

grade
tenant
subject

The parent experience can expose:

- lesson progress
- subject progress
- game results
- performance summaries
- recommendations

according to authorized relationships.

---

22. Tenant Admin Experience

Tenant Admin manages the educational operation of its own tenant.

Tenant Admin must only access resources belonging to its tenant.

The tenant boundary applies to:

students
parents
curriculum assignments
progress
games
attempts
analytics

Tenant Admin must never obtain unrestricted access to another tenant through route manipulation or client-side state.

---

23. Super Admin Experience

Super Admin operates at platform level.

Super Admin responsibilities may include:

tenant management
subscription management
platform administration
tenant creation
support operations
platform analytics

Super Admin access is distinct from Tenant Admin access.

The architecture must not treat the two roles as interchangeable.

---

24. Curriculum Data Layer

The curriculum hierarchy is:

Grade
  ↓
Term
  ↓
Subject
  ↓
Unit
  ↓
Lesson

The data layer must expose typed functions for loading these resources.

Curriculum pages should not contain duplicated database logic.

The preferred pattern is:

Page
 ↓
Curriculum / Database Service
 ↓
Supabase

---

25. Game Data Layer

Game data should follow the same principle.

The preferred pattern is:

Game Page
 ↓
Game Service
 ↓
Game Definition
 ↓
Question Eligibility
 ↓
Question Bank
 ↓
Game Session

The curriculum pages should not implement question selection themselves.

---

26. Separation of Responsibilities

The following responsibilities must remain separated.

Curriculum

Responsible for:

grades
terms
subjects
units
lessons
lesson resources

Games

Responsible for:

game definitions
game types
difficulty
question selection
sessions
answers
scores

Analytics

Responsible for:

performance analysis
progress analysis
recommendations

Authentication

Responsible for:

identity
session
role
authorization context

Database/RLS

Responsible for:

tenant isolation
data access policies
relationship enforcement

---

27. Do Not Couple Curriculum Pages to Game Implementation

A curriculum page must not contain game-specific business logic.

For example, "LessonPage" should not know:

how a matching game works
how questions are selected
how difficulty is calculated
how score is calculated

It should only know:

this lesson has an available game

and provide the navigation entry point.

This allows game implementations to evolve independently.

---

28. Game Extensibility

The game engine must support multiple implementations behind a common interface.

Conceptually:

GameEngine
   ↓
GameType
   ├── MultipleChoiceGame
   ├── TrueFalseGame
   ├── MatchingGame
   ├── OrderingGame
   ├── MemoryGame
   └── TimedChallengeGame

The exact component architecture is implementation-specific.

The important architectural requirement is that adding a new game type must not require rebuilding the curriculum hierarchy.

---

29. Resource Strategy

The project intentionally favors internal reusable game components.

Instead of deploying a separate application for every game, reusable game engines/components should be implemented inside the TheTutor repository wherever practical.

The preferred model is:

TheTutor Repository
├── curriculum
├── dashboards
├── authentication
├── game engine
└── game implementations

This reduces unnecessary duplication.

Individual game instances should primarily be represented as data/configuration when possible.

---

30. Content Injection

The content injector is responsible for educational content ingestion.

The pipeline may produce:

lesson metadata
lesson content
video URL
infographic URL
game configuration/reference

Content ingestion must use stable IDs and explicit relationships.

It must never use display names as primary relationships.

---

31. Student Progress

Progress must be represented as persistent application data.

Conceptually:

Student
 ↓
Lesson Progress
 ↓
Completed Lessons
 ↓
Eligible Game Content

Completion is therefore both:

a learning metric

and:

an eligibility signal for gameplay

---

32. Security Principles

The architecture follows these rules:

1. Authentication is not authorization.
2. Client-side state is not a security boundary.
3. Tenant isolation is enforced by database policies.
4. Names are never unique identifiers.
5. Student eligibility is derived from trusted relationships.
6. Game routes require authorization.
7. Game URLs/routes do not bypass RLS.
8. Parent-child access is relationship-based.
9. Tenant Admin access is tenant-scoped.
10. Super Admin access is platform-scoped.

---

33. Routing Principles

The router is responsible for navigation.

It should not contain business logic for:

question selection
scoring
analytics
tenant filtering
lesson completion

Protected routes should eventually enforce authentication and role access.

The final routing structure is expected to contain:

/
 /login

 /dashboard

 /grades/...
 /games/lesson/...
 /games/unit/...
 /games/subject/...

Role-specific dashboards are protected resources.

Curriculum and game routes are also protected according to the access model.

---

34. Current Implementation Strategy

Implementation proceeds from foundational resources toward dependent UI.

The preferred order is:

1. Architecture contract
2. Database contract
3. Supabase access layer
4. Authentication / session
5. Role resolution
6. Dashboards
7. Curriculum navigation
8. Lesson resources
9. Game data layer
10. Game engine
11. Individual game implementations
12. Game sessions
13. Scoring
14. Analytics
15. Parent/student reporting
16. Final routing integration

No later feature should force unnecessary reconstruction of earlier stable layers.

---

35. Definition of a Complete Learning Path

The final student experience is:

Landing
   ↓
Login
   ↓
Student Dashboard
   ↓
Student's Grade
   ↓
Term 1 / Term 2
   ↓
Subject
   ↓
Unit
   ↓
Lesson
   ↓
Lesson Content
   ├── Video
   ├── Infographic
   ├── Progress
   └── Lesson Game
          ↓
       Questions
          ↓
       Score
          ↓
       Analytics

At higher levels:

Unit
   ↓
Unit Game
   ↓
Eligible completed-lesson questions

and:

Subject
   ↓
Subject Game
   ↓
Eligible completed-lesson questions

---

36. Architectural Invariants

The following are considered non-negotiable invariants.

Tenant invariant

Every tenant-owned resource must be scoped to its tenant.

Identity invariant

Stable IDs, not names, determine relationships.

Curriculum invariant

The curriculum hierarchy remains:

Grade → Term → Subject → Unit → Lesson

Game invariant

Games exist at:

Lesson
Unit
Subject

Eligibility invariant

A student can only receive game questions from learning content they are eligible to access, with completed lessons forming the baseline eligibility rule.

Difficulty invariant

Games support at least:

Easy
Medium
Hard

Extensibility invariant

New game types must not require changes to the curriculum hierarchy.

Security invariant

Game routes and game resources remain subject to authentication, tenant isolation, and authorization.

Resource invariant

Internal games should be implemented as reusable repository components wherever practical.

---

37. Current Decision

The project does not wait for game implementation before completing the core platform.

The platform can be built now around stable game references.

The game system will be implemented later inside the same repository and connected through the established game contract.

Therefore:

Curriculum development
        ↓
does not block
        ↓
Game development

and:

Game development
        ↓
does not require
        ↓
rebuilding curriculum pages

This is the intended architecture going forward.