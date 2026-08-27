# The Tutor — Database Schema Master Plan

> **Status:** Architecture Specification — NOT YET IMPLEMENTED
>
> **Purpose:** Canonical database blueprint for The Tutor.
>
> This document defines the target database architecture for curriculum, lessons, questions, games, learning progress, analytics, gamification, parents, students, enrichment courses, AI-generated content, infographics, social features and future competitions.
>
> **Important:** This is a design specification. Do NOT execute it as a destructive migration. The existing Supabase database must first be audited and reconciled against this plan.

---

# 1. Core Architecture

The platform is built around this learning hierarchy:

```text
GRADE
  ↓
TERM
  ↓
SUBJECT
  ↓
UNIT
  ↓
LESSON
  ↓
CONCEPT / LEARNING OBJECTIVE
  ↓
QUESTION
  ↓
ACTIVITY / GAME
  ↓
ATTEMPT
  ↓
ANALYTICS
  ↓
MASTERY
  ↓
RECOMMENDATION