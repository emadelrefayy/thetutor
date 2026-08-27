# The Tutor — Database Architecture
## Canonical Database Specification

**Status:** ACTIVE  
**Source of Truth:** Supabase project `thetutor`  
**Repository:** `emadelrefayy/thetutor`  
**Schema:** `public`

---

## 1. Purpose

This document defines the canonical database architecture for The Tutor.

The live Supabase database is the source of truth.

This document must describe the database that actually exists and the architecture that the application is expected to use.

No new database architecture should be introduced in documentation unless the corresponding database design has been explicitly approved and implemented.

---

# 2. Core Architecture

The Tutor database is organized into the following domains:

1. Academic Curriculum
2. Lesson Content
3. Learning Concepts and Objectives
4. Question Bank
5. Games and Assessments
6. Student Progress
7. Learning Analytics
8. Gamification
9. Parents and Students
10. Challenges
11. Enrichment Courses
12. Social Features
13. AI Content Pipeline
14. Subscriptions
15. Curriculum Sources
16. Multi-tenancy

---

# 3. Academic Curriculum

The main curriculum hierarchy is:

```text
Grade
  ↓
Term
  ↓
Subject
  ↓
Unit
  ↓
Lesson