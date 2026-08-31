TheTutor — Frontend Architecture

Status: FINAL FRONTEND ARCHITECTURE CONTRACT
Version: 1.0
Date: 2026-08-31
Platform: TheTutor
Frontend: React + TypeScript
Build Tool: Vite
Database Contract: "DATABASE_SCHEMA_MASTER_PLAN.md"
System Contract: "PROJECT_ARCHITECTURE.md"

---

1. Document Purpose

This document defines the authoritative architecture for the TheTutor frontend application.

It specifies:

- Frontend technology stack.
- Application structure.
- Routing.
- Authentication.
- Tenant context.
- Authorization-aware UI.
- Student experience.
- Parent experience.
- Administrative experience.
- Curriculum navigation.
- Lesson experience.
- Progress experience.
- Game experience.
- Question rendering.
- Gamification UI.
- Analytics visualization.
- Recommendations.
- Challenges.
- Social features.
- Realtime features.
- Notifications.
- API communication.
- State management.
- Caching.
- Error handling.
- Loading states.
- Security boundaries.
- Accessibility.
- Responsive design.
- Testing.
- Performance.
- Deployment configuration.

This document defines frontend responsibilities.

It does not redefine the database schema.

It does not redefine backend business rules.

It does not replace the API contract.

---

2. Architectural Authority

The frontend follows this hierarchy:

DATABASE_SCHEMA_MASTER_PLAN.md
              │
              ▼
PROJECT_ARCHITECTURE.md
              │
              ▼
FRONTEND_ARCHITECTURE.md
              │
              ▼
API_CONTRACT.md

The frontend must not contradict any higher-level document.

If a frontend requirement conflicts with the database or backend architecture, the frontend implementation must be changed.

---

3. Frontend Core Principles

The frontend follows these principles:

1. Server-authoritative business logic.
2. Type-safe API communication.
3. Tenant-aware navigation.
4. Role-aware UI.
5. No security decisions based solely on client state.
6. No client-side calculation of authoritative scores.
7. No client-side calculation of authoritative XP.
8. No exposure of correct answers before answer evaluation.
9. No direct manipulation of protected database state.
10. Reusable feature modules.
11. Predictable state management.
12. Accessible UI.
13. Responsive design.
14. Progressive loading.
15. Clear separation between server state and UI state.

---

4. Frontend Responsibility

The frontend is responsible for:

Presentation
Interaction
Navigation
Forms
Local UI state
Server-state consumption
Realtime presentation
Animations
Accessibility
Responsive layout
Error presentation
Loading states

The frontend is NOT authoritative for:

Authorization
Tenant isolation
Question eligibility
Lesson completion
Game scoring
XP calculation
Mastery calculation
Achievement validation
Billing state
Security rules

---

5. Technology Stack

Recommended baseline:

React
TypeScript
Vite
React Router
Tailwind CSS
Supabase JS
TanStack Query
Zod
Axios or fetch

Additional libraries may be introduced when justified.

Avoid unnecessary dependencies.

Every dependency must have a clear architectural purpose.

---

6. Target Repository Structure

The frontend should evolve toward:

frontend/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── config.ts
│   │
│   ├── assets/
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
│   │   ├── tenants/
│   │   ├── students/
│   │   ├── parents/
│   │   ├── curriculum/
│   │   ├── lessons/
│   │   ├── progress/
│   │   ├── questions/
│   │   ├── games/
│   │   ├── gamification/
│   │   ├── analytics/
│   │   ├── recommendations/
│   │   ├── challenges/
│   │   ├── social/
│   │   ├── notifications/
│   │   ├── realtime/
│   │   └── admin/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── supabase/
│   │   ├── query/
│   │   └── utils/
│   │
│   ├── pages/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── types/
│   │
│   └── styles/
│
├── tests/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

The exact directory names may evolve, but the separation of concerns must remain.

---

7. Feature-Based Organization

Feature-specific code should be colocated.

Example:

features/lessons/
│
├── components/
├── hooks/
├── queries/
├── mutations/
├── types.ts
├── validators.ts
└── index.ts

The same pattern applies to:

games
progress
curriculum
students
parents
analytics

Avoid placing all application logic into a single global "components/" directory.

---

8. Application Shell

The application shell is responsible for:

Authentication bootstrap
Tenant bootstrap
Global navigation
Global notifications
Global error boundary
Theme
Responsive layout
Route rendering

Conceptually:

App
│
├── Providers
│   ├── Auth Provider
│   ├── Tenant Provider
│   ├── Query Provider
│   └── Realtime Provider
│
├── Router
│
└── Application Layout

---

9. Provider Architecture

Global providers should be kept minimal.

Recommended order:

App
 │
 ├── ErrorBoundary
 │
 ├── QueryClientProvider
 │
 ├── AuthProvider
 │
 ├── TenantProvider
 │
 └── Router

Feature-specific providers should be introduced only when necessary.

Avoid deep provider nesting.

---

10. Authentication Architecture

Supabase Auth provides authentication.

Frontend flow:

Application Start
      │
      ▼
Initialize Supabase
      │
      ▼
Restore Session
      │
      ▼
Get Authenticated User
      │
      ▼
Load Tenant Memberships
      │
      ▼
Resolve Active Tenant
      │
      ▼
Render Authorized Application

The frontend may use the authentication state for UI decisions.

The backend remains authoritative for authorization.

---

11. Authentication States

The frontend must explicitly represent:

INITIALIZING
AUTHENTICATED
UNAUTHENTICATED
SESSION_EXPIRED
AUTH_ERROR

Avoid rendering protected application screens while authentication state is unresolved.

---

12. Tenant Context

The active tenant is a first-class frontend concept.

Conceptually:

Authenticated User
       │
       ▼
Tenant Memberships
       │
       ▼
Active Tenant
       │
       ▼
Tenant-Aware Queries
       │
       ▼
Tenant-Aware UI

The frontend may store the currently selected tenant ID.

However:

«The backend must validate tenant membership independently.»

The frontend must never assume that possession of a tenant ID grants access.

---

13. Tenant Switching

If a user belongs to multiple tenants, the UI may provide a tenant switcher.

Flow:

User
 │
 ▼
Select Tenant
 │
 ▼
Update Active Tenant
 │
 ▼
Invalidate Tenant-Scoped Queries
 │
 ▼
Reload Tenant Data

Tenant-sensitive cached data must never leak between tenants.

---

14. Authorization-Aware UI

The frontend should hide or disable actions the current role cannot use.

Example:

Student
    ├── Lessons
    ├── Games
    ├── Progress
    ├── Achievements
    └── Social

Parent
    ├── Children
    ├── Progress
    ├── Analytics
    └── Recommendations

Tenant Admin
    ├── Curriculum
    ├── Content
    ├── Students
    └── Reports

Platform Admin
    ├── Tenants
    ├── Subscriptions
    ├── Platform Analytics
    └── Support

These are UI capabilities only.

Actual authorization must occur server-side.

---

15. Routing Architecture

Routes should be organized by application area.

Conceptual routes:

/
├── login
├── register
│
├── app/
│   ├── dashboard
│   ├── curriculum
│   ├── subjects
│   ├── units
│   ├── lessons
│   ├── progress
│   ├── games
│   ├── achievements
│   ├── challenges
│   ├── friends
│   ├── messages
│   └── notifications
│
├── parent/
│   ├── dashboard
│   ├── children
│   ├── progress
│   ├── analytics
│   └── recommendations
│
├── admin/
│   ├── dashboard
│   ├── tenants
│   ├── students
│   ├── curriculum
│   ├── content
│   ├── questions
│   ├── games
│   └── reports
│
└── platform/
    ├── tenants
    ├── subscriptions
    ├── plans
    └── audit

The exact URL structure may change during implementation.

---

16. Route Guards

Protected routes must verify frontend authentication state.

Conceptually:

Route
 │
 ├── Authentication Required?
 │       │
 │       ├── No → Render
 │       │
 │       └── Yes
 │             │
 │             ▼
 │        Authenticated?
 │             │
 │             ├── No → Login
 │             │
 │             └── Yes
 │                   │
 │                   ▼
 │              Render Route

Role-aware routes may additionally verify available role information.

Again, route guards are not security boundaries.

---

17. API Architecture

All business API communication should pass through a centralized API layer.

Recommended:

lib/api/
│
├── client.ts
├── errors.ts
├── auth.ts
├── curriculum.ts
├── lessons.ts
├── progress.ts
├── games.ts
├── analytics.ts
├── parents.ts
├── challenges.ts
└── admin.ts

Feature code should not repeatedly implement raw HTTP configuration.

---

18. API Client

The API client is responsible for:

Base URL
Authentication headers
Request IDs
JSON serialization
Response parsing
Error normalization
Timeouts
Retry policy where appropriate

Conceptually:

Feature
  │
  ▼
API Service
  │
  ▼
API Client
  │
  ▼
FastAPI

---

19. API Types

Frontend request and response types must match the API contract.

Preferred flow:

API Contract
      │
      ▼
Type Definitions
      │
      ▼
API Client
      │
      ▼
Feature

Do not manually duplicate incompatible response shapes throughout components.

---

20. Runtime Validation

TypeScript types are compile-time guarantees only.

Important external responses should be runtime validated where appropriate.

Zod or equivalent validation may be used for:

API responses
URL parameters
forms
configuration
critical external data

Malformed server data should produce controlled errors.

---

21. Server State vs UI State

The application must distinguish between:

Server State

lessons
curriculum
progress
games
analytics
notifications
student data
parent data

UI State

modal open/closed
selected tab
animation state
temporary form state
sidebar state
theme

Server state should preferably use TanStack Query or equivalent.

UI state should remain local unless multiple components genuinely need it.

---

22. Query Architecture

Queries must be tenant-aware.

Conceptually:

queryKey =
[
  tenantId,
  resource,
  parameters
]

Example:

[
  "tenant",
  tenantId,
  "lessons",
  subjectId
]

Never use global cache keys for tenant-sensitive resources.

---

23. Query Invalidation

After a mutation:

Mutation
   │
   ▼
Server Success
   │
   ▼
Invalidate Affected Queries
   │
   ▼
Refetch / Update Cache

Examples:

Lesson completion
    ↓
Invalidate lesson progress
    ↓
Invalidate subject progress
    ↓
Invalidate dashboard summary

Avoid broad application-wide cache invalidation when targeted invalidation is possible.

---

24. Optimistic Updates

Optimistic updates may be used for low-risk UI interactions.

Do NOT optimistically finalize authoritative:

score
XP
lesson completion
achievement
payment
game result

For these operations, display pending state until the server confirms the result.

---

25. Curriculum UI Architecture

The curriculum navigation follows:

Tenant
 │
 ▼
Curriculum
 │
 ▼
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

The UI must preserve this context during navigation.

---

26. Curriculum Navigation

Example:

Grade 1
  └── Term 1
      └── English
          └── Unit 1
              └── Lesson 1

Breadcrumbs should expose the hierarchy.

The frontend should not construct curriculum relationships independently.

The API response is authoritative.

---

27. Lesson Page Architecture

A lesson page may contain:

Lesson Header
    │
    ├── Title
    ├── Progress
    └── Status
    │
    ▼
Content Renderer
    │
    ├── Text
    ├── Video
    ├── Image
    ├── Infographic
    ├── Interactive Activity
    └── Other Blocks
    │
    ▼
Completion Area
    │
    ▼
Related Game

Content must be rendered according to server-provided content types.

---

28. Content Renderer

Use a type-driven renderer.

Conceptually:

ContentBlock
      │
      ├── text
      ├── image
      ├── video
      ├── infographic
      ├── audio
      ├── interactive
      └── activity

Each type has a dedicated renderer.

Unknown content types must fail gracefully rather than crash the entire lesson.

---

29. Lesson Completion UI

The frontend may display:

Not Started
In Progress
Completed

Completion must be confirmed by the backend.

Flow:

Student Learning
      │
      ▼
Frontend submits completion event
      │
      ▼
Backend evaluates rules
      │
      ▼
Server confirms completion
      │
      ▼
Frontend updates UI

---

30. Progress UI

Progress can be represented through:

Progress bars
Completion percentages
Lesson states
Unit completion
Subject completion
Learning streaks
Mastery indicators

Do not calculate authoritative progress using incomplete client-side data.

---

31. Game UI Architecture

The game experience should be isolated from normal application navigation.

Conceptually:

Game Lobby
    │
    ▼
Game Preparation
    │
    ▼
Game Session
    │
    ├── Question
    ├── Timer
    ├── Progress
    └── Feedback
    │
    ▼
Game Completion
    │
    ▼
Results
    │
    ▼
Rewards / Analytics

---

32. Game Session Lifecycle

The frontend does not create an authoritative game session locally.

Flow:

Start Game
   │
   ▼
POST /game-session
   │
   ▼
Server creates session
   │
   ▼
Server returns session state
   │
   ▼
Render Game

---

33. Question Presentation

The frontend receives only information required to present the question.

Conceptually:

Question
├── id
├── type
├── prompt
├── options
├── media
└── metadata required for UI

The frontend must not receive:

correct_answer
answer_key
server scoring formula
hidden validation state

---

34. Answer Submission UI

Flow:

Student Answer
      │
      ▼
Disable duplicate submission
      │
      ▼
Submit to API
      │
      ▼
Show pending state
      │
      ▼
Receive server result
      │
      ▼
Display feedback
      │
      ▼
Continue

Duplicate submissions must be prevented at the UI level where possible.

The backend remains the final protection.

---

35. Game Results

Results should display server-provided values.

Possible information:

Score
Correct Answers
Accuracy
XP Earned
Achievements
Performance Summary
Recommended Next Step

Do not reconstruct final score from client-side answers.

---

36. Difficulty UI

Games may expose:

Easy
Medium
Hard

However:

«Difficulty eligibility is a server decision.»

The frontend only requests or displays available difficulty options.

---

37. Gamification UI

Gamification may include:

XP
Level
Achievements
Badges
Streaks
Progress
Leaderboards

The frontend displays server-authoritative values.

Animations are presentation only.

---

38. Achievement UI

Achievement unlocks must come from server-confirmed state.

Flow:

Learning Event
      │
      ▼
Backend Evaluation
      │
      ▼
Achievement Awarded
      │
      ▼
Frontend Notification
      │
      ▼
Achievement UI

Never award an achievement solely because a frontend condition appears satisfied.

---

39. Analytics UI

Analytics pages consume server-generated analytics.

Examples:

Performance Overview
Subject Performance
Lesson Performance
Mastery
Weak Areas
Strong Areas
Learning Trends
Game Performance

Visualization belongs to the frontend.

Calculation of authoritative metrics belongs to the backend.

---

40. Recommendation UI

Recommendations should be represented as actionable cards.

Example:

Recommendation
├── Title
├── Reason
├── Target
├── Priority
└── Action

The action should navigate to the server-defined target.

---

41. Parent UI Architecture

Parent UI is a separate application experience.

Conceptually:

Parent Dashboard
│
├── Children
│
├── Child Selector
│
├── Progress
│
├── Subject Performance
│
├── Mastery
│
├── Games
│
├── Recommendations
│
└── Recent Activity

The parent must never be able to switch to a student who is not authorized through the backend.

---

42. Student Selector

For parents with multiple children:

Parent
 │
 ▼
Authorized Children
 │
 ▼
Select Child
 │
 ▼
Load Child Analytics

The frontend should derive the list from the server.

Never accept an arbitrary student ID as proof of relationship.

---

43. Administrative UI

Administrative interfaces must be isolated from student UI.

Administrative modules may include:

Tenant Management
Student Management
Curriculum
Lessons
Content
Question Bank
Games
Reports
Subscriptions
Audit

Administrative operations require server authorization.

---

44. Content Management UI

Content workflows should expose states such as:

Draft
Review
Approved
Published
Archived

The UI should make workflow state explicit.

Publishing is a server-side operation.

---

45. AI Content UI

AI-generated content must be visually distinguishable from published content during review.

Workflow:

Generate
  ↓
Preview
  ↓
Validate
  ↓
Review
  ↓
Approve
  ↓
Publish

The frontend must not directly publish AI output without the required backend workflow.

---

46. Social UI

Social features may include:

Friends
Friend Requests
Profiles
Messages
Conversations
Online Status
Multiplayer Invitations

All social resources remain subject to tenant and relationship authorization.

---

47. Chat Architecture

Chat UI should support:

Conversation List
Conversation View
Message Composer
Message Status
Unread Count
Realtime Updates

Message persistence occurs on the backend/database.

Realtime delivers updates.

The frontend must gracefully recover after connection loss.

---

48. Realtime Architecture

Realtime subscriptions should be feature-scoped.

Examples:

notifications
chat
challenge
multiplayer
leaderboard

Do not subscribe the entire application to all realtime channels.

Subscriptions must be cleaned up when components unmount or context changes.

---

49. Realtime Connection States

The UI should represent:

CONNECTED
CONNECTING
DISCONNECTED
RECONNECTING
ERROR

Realtime failure must not necessarily make the entire application unusable.

Fallback behavior should exist where appropriate.

---

50. Notifications UI

Notifications should support:

Unread
Read
Mark as Read
Notification List
Notification Detail

Realtime notification arrival should update the notification cache.

---

51. Challenge UI

Challenge experience:

Challenge List
      │
      ▼
Challenge Details
      │
      ▼
Eligibility
      │
      ▼
Join
      │
      ▼
Game
      │
      ▼
Results
      │
      ▼
Leaderboard

The frontend displays eligibility returned by the backend.

---

52. Leaderboard UI

Leaderboards must be treated as server-generated data.

Display:

Rank
Player
Score
Relevant Metric

Do not calculate global ranking in the browser.

For privacy and child safety, only information approved by the backend should be displayed.

---

53. Loading State Architecture

Every asynchronous feature should define loading behavior.

Use:

Skeleton
Spinner
Progress Indicator
Disabled Action
Placeholder

Avoid blank screens during loading.

Differentiate:

initial loading
background refetch
mutation pending
realtime reconnect

---

54. Error State Architecture

Every major screen should handle:

Loading
Success
Empty
Error

Example:

Loading
   │
   ├── Success → Content
   │
   ├── Empty → Empty State
   │
   └── Error → Error State

Error messages should be user-readable.

Internal technical details must not be exposed.

---

55. Global Error Boundary

The application must have a top-level React error boundary.

It should:

- Prevent total white-screen failure.
- Log/report the error.
- Display a recoverable error screen.
- Provide a retry/reload action.

---

56. Forms

Forms should use:

Controlled validation
Schema validation
Accessible labels
Inline errors
Submit states
Server error mapping

Forms must distinguish:

validation error
authentication error
authorization error
business-rule error
network error

---

57. Accessibility

Accessibility is mandatory.

The frontend should follow WCAG principles.

Required practices include:

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Accessible labels.
- Sufficient contrast.
- Screen-reader support.
- Reduced-motion support.
- Accessible error messages.
- Accessible game controls.

Educational games must not rely solely on animation or color.

---

58. Child-Focused UX

The primary student experience targets Egyptian primary-school children.

The UI should therefore prioritize:

Large touch targets
Simple navigation
Clear visual hierarchy
Short instructions
Immediate feedback
Readable typography
Controlled animation
Low cognitive overload

Gamification should enhance learning rather than distract from it.

---

59. Arabic / English / RTL Architecture

The platform must support bilingual educational content.

The frontend should be prepared for:

Arabic
English

and:

RTL
LTR

Direction must be configurable.

Do not hard-code layout assumptions that break under RTL.

Avoid using left/right positioning when logical CSS properties are appropriate.

Prefer:

margin-inline
padding-inline
inset-inline

over directional assumptions.

---

60. Localization

All interface strings should be externalized.

Avoid:

<button>Start Game</button>

Prefer a translation key architecture:

game.start

Curriculum content itself is data and should not be hard-coded into UI components.

---

61. Responsive Design

The application must support:

Mobile
Tablet
Desktop

Student game experiences should prioritize touch devices.

Administrative interfaces may prioritize desktop productivity while remaining usable on smaller screens.

---

62. Performance Architecture

Important strategies:

Route-level code splitting
Lazy loading
Image optimization
Virtualized long lists
Query caching
Targeted refetching
Memoization where justified
Avoid unnecessary rerenders

Games must remain responsive even on lower-end devices.

---

63. Media Performance

Educational media can be large.

Use:

Lazy loading
Responsive images
CDN delivery
Poster images
Progressive loading

Video should not automatically preload every resource on a lesson page.

---

64. Security Rules

The frontend must never contain:

Supabase service-role key
Database password
Private API secret
Payment secret
AI provider secret
Webhook secret

Public environment variables must contain only safe client-side configuration.

---

65. Client-Side Security Assumption

Everything in the browser must be considered potentially manipulable.

Therefore:

Hidden UI ≠ Security
Disabled Button ≠ Authorization
Route Guard ≠ Authorization
Local State ≠ Truth

The backend and database enforce security.

---

66. Game Security

The frontend must assume that a malicious user can modify:

JavaScript
Network requests
Timers
Displayed score
Displayed XP
Local storage

Therefore the frontend must never be the source of truth for game results.

---

67. Local Storage

Local storage may contain non-sensitive UI preferences.

Do not store sensitive authorization information or secrets in local storage.

Avoid storing authoritative:

XP
score
lesson completion
achievement state

as trusted state.

---

68. Offline Behavior

Offline support may be introduced incrementally.

The initial architecture should support graceful network failure.

Do not allow offline mode to fabricate authoritative learning results.

If offline learning is introduced later:

Offline Event
    ↓
Local Queue
    ↓
Sync
    ↓
Server Validation
    ↓
Authoritative Result

---

69. API Error Mapping

Backend errors should be normalized into frontend-safe categories.

Example:

401 → Authentication Required
403 → Access Denied
404 → Resource Not Found
409 → Conflict
422 → Validation Error
429 → Rate Limited
5xx → Server Error

Business error codes should be displayed through localized messages.

---

70. Navigation Error Handling

If a resource is unavailable:

Not Found

If the user lacks permission:

Access Denied

If authentication expires:

Session Expired

Avoid redirect loops.

---

71. Analytics Tracking

Frontend interaction tracking may record UI events.

Examples:

page_view
lesson_opened
game_opened
button_clicked

However, learning-critical events should be confirmed by backend/domain events.

Do not treat a browser analytics event as proof that a lesson was completed.

---

72. Testing Strategy

Frontend testing should exist at multiple levels.

Unit Tests

Test:

utilities
formatters
validators
pure components
hooks

Component Tests

Test:

forms
lesson rendering
question rendering
game controls
loading states
error states

Integration Tests

Test:

authentication flow
tenant switching
API interactions
game flow
parent child selection

End-to-End Tests

Test critical user journeys:

Login
↓
Select Tenant
↓
Open Curriculum
↓
Open Lesson
↓
Complete Lesson
↓
Start Game
↓
Answer Questions
↓
Receive Results
↓
View Progress

---

73. Security Testing

Frontend security testing should verify:

unauthorized routes
role-based UI
tenant switching behavior
expired sessions
malformed API responses
correct-answer leakage
sensitive data exposure

The primary tenant isolation tests remain backend/database tests.

---

74. Environment Configuration

Frontend environments should support:

development
staging
production

Example configuration categories:

VITE_API_BASE_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Only public client-safe values may use "VITE_" variables.

---

75. Build Architecture

Production build should:

Type-check
Lint
Run tests
Build assets
Generate production bundle

CI should fail if critical frontend checks fail.

---

76. Deployment

The frontend is designed to be deployable to a CDN-oriented platform such as Vercel.

Deployment flow:

Git Push
   │
   ▼
CI
   │
   ├── Type Check
   ├── Lint
   ├── Tests
   └── Build
   │
   ▼
Deployment
   │
   ▼
Production

---

77. Frontend Domain Boundaries

The following boundaries are mandatory:

UI Components
      ↓
Feature Hooks
      ↓
Feature Services / Queries
      ↓
API Client
      ↓
Backend API

Avoid:

Component
   ↓
Direct database manipulation

Avoid putting business rules into presentational components.

---

78. Component Architecture

Components should be classified as:

UI Component
Layout Component
Feature Component
Page Component

UI Component

Generic and reusable.

Example:

Button
Modal
Card
Input
ProgressBar

Feature Component

Domain-specific.

Example:

LessonCard
GameQuestion
AchievementCard
SubjectProgress

Page Component

Combines features into a route-level experience.

---

79. Avoid God Components

A component should not simultaneously handle:

API calls
authentication
tenant resolution
business calculations
routing
complex rendering
animations

Split responsibilities.

---

80. Hooks Architecture

Hooks should encapsulate reusable frontend behavior.

Examples:

useAuth()
useTenant()
useStudent()
useLessons()
useLessonProgress()
useGameSession()
useSubmitAnswer()
useParentChildren()
useNotifications()
useRealtime()

Hooks should not silently bypass the API architecture.

---

81. Service Architecture

Services represent communication or reusable application operations.

Example:

features/games/
    queries/
    mutations/

A service should not contain presentation code.

---

82. State Ownership Rules

Use the narrowest appropriate scope.

Component State
    ↓
Feature State
    ↓
Application State

Do not promote state globally without justification.

Server data belongs to server-state management.

---

83. Modal and Overlay Architecture

Global overlays should be managed centrally only when necessary.

Examples:

Achievement Unlock
Notification
Confirm Action
Game Result

Feature-specific dialogs should remain within their feature.

---

84. Design System

The platform should use a consistent design system.

It should define:

Typography
Spacing
Buttons
Cards
Inputs
Colors
Icons
Feedback
Navigation
Game UI

Student UI and administrative UI may use different visual densities while sharing core tokens.

---

85. Animation Architecture

Animations should be purposeful.

Good uses:

Game feedback
Achievement unlock
Progress completion
Navigation transitions
Reward presentation

Avoid excessive animation that interferes with learning.

Support:

prefers-reduced-motion

---

86. Game-Specific UX

Games should provide:

Clear objective
Current progress
Current question
Answer state
Immediate or controlled feedback
Time information when relevant
Exit behavior
Completion state

Accidental exits should be handled gracefully.

---

87. Game Session Recovery

If the browser refreshes or network connectivity changes during a game:

Reload
  ↓
Authenticate
  ↓
Recover Session
  ↓
Request Current Server State
  ↓
Resume or Finish

Do not reconstruct game state solely from browser memory.

---

88. Parent Data Privacy

Parent screens should expose only information authorized by the backend.

Avoid displaying unnecessary sensitive student information.

Use privacy-conscious summaries where detailed data is not necessary.

---

89. Admin Safety

Destructive administrative actions require confirmation.

Examples:

Delete
Suspend
Unpublish
Remove Membership
Cancel Subscription

The UI should clearly communicate consequences.

Server authorization remains mandatory.

---

90. Empty States

Every collection should have a meaningful empty state.

Examples:

No lessons available.
No games available yet.
No achievements earned yet.
No notifications.
No friends yet.
No children linked yet.

Empty states should provide the next useful action where appropriate.

---

91. Pagination

Large datasets should use server-side pagination.

Examples:

Students
Lessons
Questions
Notifications
Messages
Audit Logs
Leaderboard

Do not load unbounded collections into the browser.

---

92. Infinite Scroll

Infinite scrolling may be used for:

messages
notifications
activity feeds

Do not use infinite scroll where explicit pagination provides better usability, especially administrative tables.

---

93. Search and Filtering

Search/filter state should be URL-addressable where useful.

Example:

/admin/students?search=ahmed&status=active

The backend should perform large-dataset filtering.

The frontend should not download an entire dataset merely to filter it locally.

---

94. Frontend Observability

The frontend should support:

Error reporting
Performance monitoring
Request IDs
User-safe diagnostics

Never send secrets or sensitive information to monitoring systems.

---

95. Logging

Development logging may be verbose.

Production logging should be controlled.

Never log:

passwords
tokens
service-role keys
payment secrets
private messages
correct answers
sensitive student information

---

96. Dependency Rules

Before adding a dependency:

1. Verify the feature cannot reasonably be implemented with existing tools.
2. Check bundle impact.
3. Check maintenance status.
4. Check TypeScript compatibility.
5. Check security considerations.
6. Document its purpose.

Avoid dependency duplication.

---

97. Legacy Frontend Migration

The existing frontend must be audited before major replacement.

Every existing component/file should be classified:

KEEP
REFACTOR
REPLACE
DELETE

Do not preserve legacy architecture merely to avoid rewriting code.

Do not delete working functionality without confirming its replacement.

---

98. Migration Sequence

Recommended frontend implementation order:

1. Frontend Foundation
       ↓
2. Authentication
       ↓
3. Tenant Context
       ↓
4. Application Shell
       ↓
5. Curriculum Navigation
       ↓
6. Lesson Experience
       ↓
7. Progress
       ↓
8. Question Rendering
       ↓
9. Game Engine UI
       ↓
10. Gamification
       ↓
11. Analytics
       ↓
12. Parent Dashboard
       ↓
13. Challenges
       ↓
14. Notifications
       ↓
15. Social / Chat
       ↓
16. Admin
       ↓
17. AI Content Management
       ↓
18. Production Hardening

---

99. Minimum Student Learning Experience

The first complete frontend learning loop must support:

Login
  ↓
Tenant Context
  ↓
Student Dashboard
  ↓
Curriculum
  ↓
Subject
  ↓
Unit
  ↓
Lesson
  ↓
Lesson Content
  ↓
Completion
  ↓
Eligible Game
  ↓
Question
  ↓
Answer
  ↓
Server Result
  ↓
Score / XP
  ↓
Progress

This is the first critical vertical slice.

---

100. Frontend Critical Invariants

Invariant 1

The browser is never the authority for security.

Invariant 2

The browser is never the authority for score.

Invariant 3

The browser is never the authority for XP.

Invariant 4

The browser is never the authority for lesson completion.

Invariant 5

The browser must never receive hidden correct answers.

Invariant 6

Tenant-sensitive cache entries must include tenant context.

Invariant 7

Parent UI must operate only on server-authorized children.

Invariant 8

Realtime subscriptions must be scoped and cleaned up.

Invariant 9

All protected API requests require authenticated credentials.

Invariant 10

Frontend implementation must conform to the API Contract.

---

101. Definition of Done

The frontend architecture is considered correctly implemented when:

- [ ] React + TypeScript foundation exists.
- [ ] Routing is centralized.
- [ ] Authentication state is handled correctly.
- [ ] Tenant context exists.
- [ ] Server-state management is implemented.
- [ ] API communication is centralized.
- [ ] API responses are typed.
- [ ] Protected routes exist.
- [ ] Curriculum navigation follows the database hierarchy.
- [ ] Lesson rendering is content-type driven.
- [ ] Lesson completion is server-authoritative.
- [ ] Game UI uses server-created sessions.
- [ ] Correct answers are not exposed.
- [ ] Score and XP come from the server.
- [ ] Progress uses server state.
- [ ] Parent access is server-authorized.
- [ ] Realtime subscriptions are properly scoped.
- [ ] Notifications work without breaking normal application behavior.
- [ ] Arabic/English and RTL/LTR are supported by the architecture.
- [ ] Mobile/tablet/desktop layouts are supported.
- [ ] Accessibility requirements are implemented.
- [ ] Error/loading/empty states exist.
- [ ] Frontend tests cover the critical learning loop.
- [ ] Production build passes.
- [ ] No secrets are exposed.
- [ ] No legacy architecture violates the approved system architecture.

---

102. Mandatory Instructions for AI Coding Agents

Any AI coding agent modifying the frontend MUST:

1. Read "DATABASE_SCHEMA_MASTER_PLAN.md".
2. Read "PROJECT_ARCHITECTURE.md".
3. Read "FRONTEND_ARCHITECTURE.md".
4. Read "API_CONTRACT.md" when implementing API communication.
5. Inspect the existing frontend before modifying it.
6. Never invent database tables.
7. Never invent API response structures.
8. Never implement backend business rules inside the frontend.
9. Never calculate authoritative score locally.
10. Never calculate authoritative XP locally.
11. Never trust client-side tenant ownership.
12. Never expose correct answers.
13. Never place secrets in frontend code.
14. Preserve tenant boundaries.
15. Use typed API contracts.
16. Handle loading, empty, and error states.
17. Test critical user flows after changes.
18. Report architectural contradictions before implementing questionable behavior.
19. Avoid unnecessary global state.
20. Avoid unnecessary dependencies.
21. Do not delete legacy code without auditing its functionality.
22. Prefer incremental vertical slices over disconnected UI development.

---

103. Relationship to Backend Architecture

The frontend depends on the backend through the API Contract.

Frontend
   │
   │ API Contract
   ▼
Backend
   │
   ▼
Database

The frontend must not depend on backend implementation details such as:

database queries
internal repository structure
private service logic
database credentials

Only the public API contract is consumed.

---

104. Relationship to Database Architecture

The frontend does not directly redefine database entities.

Instead:

Database Contract
       ↓
Backend Domain Model
       ↓
API Response
       ↓
Frontend View Model
       ↓
UI

A frontend view model may differ from a database row for presentation purposes.

It must not contradict the underlying domain meaning.

---

105. Final Frontend Architecture Summary

TheTutor frontend is:

React + TypeScript
        │
        ▼
Application Shell
        │
        ├── Authentication
        ├── Tenant Context
        ├── Routing
        └── Global UI
        │
        ▼
Feature Modules
        │
        ├── Curriculum
        ├── Lessons
        ├── Progress
        ├── Games
        ├── Gamification
        ├── Analytics
        ├── Parent
        ├── Challenges
        ├── Social
        ├── Notifications
        └── Admin
        │
        ▼
Typed API Layer
        │
        ▼
FastAPI Backend
        │
        ▼
Supabase

The frontend is a presentation and interaction layer.

The backend and database remain authoritative for business rules, security, progress, scoring, eligibility, XP, and tenant isolation.

---

END OF FRONTEND ARCHITECTURE