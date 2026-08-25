# PROJECT ARCHITECTURE & DESIGN DOCUMENTATION
## System Stack
- Frontend: React 18 (TypeScript, Vite, Tailwind CSS)
- Backend: Python FastAPI (v3.6.0) running under Virtual Environment ~/thetutor_fresh/venv
- Database: Supabase PostgreSQL Cloud

## Database Tables & Relationships
1. grades (id) -> terms (grade_id) -> subjects (term_id) -> lessons (subject_id) -> quizzes/games (lesson_id)
2. profiles (id) -> children (profile_id) -> student_progress (user_id, lesson_id)

## Current Database Metrics
- Lessons total: 1360
- Quizzes total: 4
- Games total: 0
- Profiles/Children: 0

## Known Issues & Critical Rules for AI Agents
1. FastAPI `fetch_from_supabase` uses Header `Range: 0-999`. Must be updated to fetch all 1360 lessons.
2. Frontend queries `http://localhost:8000/api/full-curriculum` for curriculum structure.
3. Python environment path is `~/thetutor_fresh/venv/bin/python`.
