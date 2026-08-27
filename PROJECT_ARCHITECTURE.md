# The Tutor — Project Architecture

**Status:** ACTIVE  
**Repository:** `emadelrefayy/thetutor`  
**Frontend:** React / Vite  
**Backend:** FastAPI / Python  
**Cloud Platform:** Supabase  
**Database:** PostgreSQL

---

# 1. Architecture Overview

The Tutor uses a three-layer application architecture:

```text
┌──────────────────────────────┐
│          FRONTEND            │
│        React / Vite          │
│                              │
│ UI / UX / Student Experience │
└──────────────┬───────────────┘
               │
               │ HTTPS / REST API
               ▼
┌──────────────────────────────┐
│          BACKEND             │
│        FastAPI / Python      │
│                              │
│ Business Logic               │
│ Analytics                    │
│ AI Processing                │
│ Image Processing             │
│ Secure Operations            │
│ Integrations                 │
└──────────────┬───────────────┘
               │
               │ Secure API / DB Access
               ▼
┌──────────────────────────────┐
│           SUPABASE           │
│                              │
│ Auth                         │
│ PostgreSQL                   │
│ Storage                      │
│ Row Level Security           │
│ Database Functions           │
└──────────────────────────────┘