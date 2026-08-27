# The Tutor — Project Architecture

**Status:** ACTIVE  
**Repository:** `emadelrefayy/thetutor`  
**Database:** Supabase PostgreSQL  
**Database Project:** `thetutor`

---

## 1. Architecture Source of Truth

The live Supabase database is the source of truth for the data architecture.

The canonical database specification is:

`DATABASE_SCHEMA_MASTER_PLAN.md`

Application code and documentation must follow the canonical schema.

No legacy architecture should be reintroduced.

---

# 2. System Architecture

```text
┌─────────────────────────────┐
│        The Tutor UI         │
│       React / Vite          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Supabase Client       │
│      Auth + PostgreSQL      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Supabase PostgreSQL    │
│        Canonical Schema     │
└─────────────────────────────┘