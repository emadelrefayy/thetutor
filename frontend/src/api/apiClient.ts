import { supabase } from "../lib/supabase";

/* =====================================================================
 * Configuration
 * ===================================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000/api";

/* =====================================================================
 * Shared Types
 * ===================================================================== */

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface HealthResponse {
  service?: string;
  status?: string;
  version?: string;
}

export interface Grade {
  id: number;
  title: string;
  level_code?: number | null;
  code?: string | null;
  created_at?: string | null;
}

export interface Term {
  id: number;
  grade_id: number;
  title: string;
  code: string;
  created_at?: string | null;
}

export interface Subject {
  id: number;
  term_id: number;
  title: string;
  code: string;
  icon_name?: string | null;
  color_theme?: string | null;
  created_at?: string | null;
}

export interface Unit {
  id: number;
  subject_id: number;
  unit_number: number;
  title: string;
  description?: string | null;
  created_at?: string | null;
}

export interface Lesson {
  id: number;
  subject_id: number;
  unit_id: number;
  unit_number: number;
  lesson_number: number;
  title: string;
  content_summary?: string | null;
  video_url?: string | null;
  infographic_url?: string | null;
  game_url?: string | null;
  created_at?: string | null;
}

export interface LessonContentBlock {
  id: string;
  lesson_id: number;
  block_type: string;
  content: Record<string, unknown>;
  asset_id?: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string | null;
}

export type LessonAssetType =
  | "image"
  | "infographic"
  | "video"
  | "audio"
  | "document"
  | "game"
  | "external";

export interface LessonAsset {
  id: string;
  lesson_id: number;
  asset_type: LessonAssetType;
  title?: string | null;
  url: string;
  storage_path?: string | null;
  alt_text?: string | null;
  metadata?: Record<string, unknown> | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string | null;
}

export interface LearningObjective {
  id: number;
  lesson_id: number;
  objective_code?: string | null;
  statement: string;
  cognitive_level?: string | null;
  created_at?: string | null;
}

export interface LessonVocabulary {
  id: number;
  lesson_id: number;
  term: string;
  definition?: string | null;
  pronunciation?: string | null;
  example?: string | null;
  created_at?: string | null;
}

export interface Concept {
  id: number;
  subject_id?: number | null;
  name: string;
  description?: string | null;
  created_at?: string | null;
}

export interface LessonConcept extends Concept {
  is_primary?: boolean;
}

export type CurriculumSourceType =
  | "official"
  | "licensed"
  | "teacher_created"
  | "ai_generated"
  | "other";

export interface CurriculumSource {
  id: string;
  name: string;
  source_type: CurriculumSourceType;
  publisher?: string | null;
  source_url?: string | null;
  edition?: string | null;
  academic_year?: string | null;
  language: string;
  rights_notes?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  locator?: string | null;
  notes?: string | null;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_key: string;
  option_text: string;
  is_correct?: boolean;
  sort_order: number;
  metadata?: Record<string, unknown> | null;
}

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "matching"
  | "ordering"
  | "fill_blank"
  | "short_answer"
  | "image_choice"
  | "drag_drop"
  | string;

export interface Question {
  id: string;
  question_type: QuestionType;
  difficulty?: string | null;
  prompt: string;
  explanation?: string | null;
  correct_answer?: unknown;
  metadata?: Record<string, unknown> | null;
  source?: string | null;
  status?: string | null;
  skill_type?: string | null;
  generation_source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  relevance?: number | null;
  options: QuestionOption[];
}

/* =====================================================================
 * Student
 * ===================================================================== */

export interface StudentProfile {
  profile_id: string;
  grade_id?: number | null;
  display_name?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
  xp: number;
  level: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LessonProgress {
  id: string;
  student_profile_id: string;
  lesson_id: number;
  status: "not_started" | "in_progress" | "completed" | string;
  completion_percent: number;
  first_started_at?: string | null;
  completed_at?: string | null;
  last_accessed_at?: string | null;
  time_spent_seconds: number;
  updated_at?: string | null;
}

export interface LearningEvent {
  id: string;
  student_profile_id: string;
  event_type: string;
  lesson_id?: number | null;
  concept_id?: number | null;
  metadata?: Record<string, unknown> | null;
  occurred_at?: string | null;
}

export interface StudentSubjectMetric {
  student_profile_id: string;
  subject_id: number;
  lessons_total: number;
  lessons_completed: number;
  questions_answered: number;
  questions_correct: number;
  accuracy: number;
  mastery_score: number;
  xp_earned: number;
  last_activity_at?: string | null;
  updated_at?: string | null;
}

export interface ConceptMastery {
  student_profile_id: string;
  concept_id: number;
  mastery_score: number;
  attempts_count: number;
  correct_count: number;
  last_attempt_at?: string | null;
  updated_at?: string | null;
}

export interface LearningRecommendation {
  id: string;
  student_profile_id: string;
  recommendation_type:
    | "lesson"
    | "concept"
    | "practice"
    | "vocabulary"
    | "game"
    | "course"
    | string;
  lesson_id?: number | null;
  concept_id?: number | null;
  game_definition_id?: string | null;
  title: string;
  reason?: string | null;
  priority: number;
  generated_by: string;
  is_dismissed: boolean;
  created_at?: string | null;
  expires_at?: string | null;
}

export interface StudentAnalytics {
  subject_metrics: StudentSubjectMetric[];
  concept_mastery: ConceptMastery[];
  recommendations: LearningRecommendation[];
}

export interface StudentStreak {
  student_profile_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string | null;
  updated_at?: string | null;
}

export interface StudentDashboard {
  summary: Record<string, unknown> | null;
  streak: StudentStreak | null;
  recommendations: LearningRecommendation[];
}

export interface XpTransaction {
  id: string;
  student_profile_id: string;
  amount: number;
  reason: string;
  source_type?: string | null;
  source_id?: string | null;
  created_at?: string | null;
}

export interface StudentXp {
  profile: {
    profile_id: string;
    xp: number;
    level: number;
  } | null;
  transactions: XpTransaction[];
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  icon_url?: string | null;
  criteria?: Record<string, unknown> | null;
  xp_reward: number;
  is_active: boolean;
  created_at?: string | null;
  earned_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

/* =====================================================================
 * Parent
 * ===================================================================== */

export interface ParentInvitation {
  id: string;
  student_profile_id: string;
  code: string;
  created_by?: string | null;
  expires_at?: string | null;
  used_at?: string | null;
  used_by?: string | null;
  created_at?: string | null;
}

export interface ParentInvitationClaim {
  status: string;
  student_profile_id: string;
  relationship: unknown;
}

export interface ParentStudent {
  parent_profile_id: string;
  student_profile_id: string;
  relationship?: string | null;
  is_primary: boolean;
  created_at?: string | null;
  grade_id?: number | null;
  xp?: number | null;
  level?: number | null;
  is_active?: boolean | null;
  completed_lessons?: number | null;
  games_played?: number | null;
  questions_answered?: number | null;
  correct_answers?: number | null;
  accuracy_percent?: number | null;
}

/* =====================================================================
 * Canonical Games
 *
 * IMPORTANT:
 * The legacy `Game` type and `/games` contract were intentionally
 * removed. The database source of truth is now:
 *
 * game_templates
 *   -> game_definitions
 *   -> game_definition_questions
 *   -> game_sessions
 *   -> game_session_questions
 *   -> question_attempts
 * ===================================================================== */

export interface GameTemplate {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  game_type: string;
  supported_question_types: string[];
  configuration: Record<string, unknown>;
  frontend_url?: string | null;
  thumbnail_url?: string | null;
  is_active: boolean;
  created_at?: string | null;
}

export interface GameDefinition {
  id: string;
  template_id: string;
  scope_type:
    | "lesson"
    | "unit"
    | "subject"
    | "course"
    | "challenge";
  lesson_id?: number | null;
  unit_id?: number | null;
  subject_id?: number | null;
  course_id?: string | null;
  challenge_id?: string | null;
  title: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at?: string | null;
  template?: GameTemplate | null;
  questions?: GameDefinitionQuestion[];
}

export interface GameDefinitionQuestion {
  game_definition_id: string;
  question_id: string;
  sort_order: number;
  points: number;
}

export interface GameSession {
  id: string;
  student_profile_id: string;
  game_definition_id: string;
  started_at?: string | null;
  completed_at?: string | null;
  status: "started" | "completed" | "abandoned" | string;
  score: number;
  max_score: number;
  accuracy?: number | null;
  xp_earned: number;
  metadata: Record<string, unknown>;
  questions?: GameSessionQuestion[];
}

export interface GameSessionQuestion {
  id: string;
  session_id: string;
  question_id: string;
  sequence_no: number;
  points_possible: number;
}

export interface QuestionAttempt {
  id: string;
  session_question_id: string;
  student_profile_id: string;
  answer: unknown;
  is_correct: boolean;
  points_awarded: number;
  response_time_ms?: number | null;
  answered_at?: string | null;
  feedback: Record<string, unknown>;
}

/* =====================================================================
 * Challenges
 * ===================================================================== */

export interface Challenge {
  id: string;
  title: string;
  description?: string | null;
  grade_id?: number | null;
  starts_at: string;
  ends_at: string;
  status:
    | "draft"
    | "scheduled"
    | "live"
    | "finished"
    | "cancelled"
    | string;
  settings: Record<string, unknown>;
  created_at?: string | null;
  questions?: ChallengeQuestion[];
}

export interface ChallengeQuestion {
  challenge_id: string;
  question_id: string;
  sort_order: number;
  points: number;
}

export interface ChallengeParticipant {
  challenge_id: string;
  student_profile_id: string;
  joined_at?: string | null;
  finished_at?: string | null;
  score: number;
  rank?: number | null;
}

/* =====================================================================
 * Courses / Messaging
 * ===================================================================== */

export interface Course {
  id: string;
  title: string;
  subject_code: string;
  grade_level?: string | null;
  term?: string | null;
  description?: string | null;
  icon?: string | null;
  is_experimental: boolean;
  created_at?: string | null;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  sort_order: number;
  created_at?: string | null;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  created_at?: string | null;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_profile_id: string;
  status: "active" | "completed" | "cancelled" | string;
  enrolled_at?: string | null;
  completed_at?: string | null;
}

export interface Conversation {
  id: string;
  conversation_type:
    | "direct"
    | "group"
    | "challenge"
    | string;
  title?: string | null;
  created_at?: string | null;
  joined_at?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  message_type:
    | "text"
    | "result_share"
    | "system"
    | string;
  metadata: Record<string, unknown>;
  created_at?: string | null;
}

/* =====================================================================
 * Admin Types
 * ===================================================================== */

export interface AdminProfile {
  id: string;
  name: string;
  role: "admin" | "super_admin" | string;
  grade_id?: number | null;
  created_at?: string | null;
}

export interface AdminContentOverview {
  grades: number;
  terms: number;
  subjects: number;
  units: number;
  lessons: number;
  lesson_content_blocks: number;
  lesson_assets: number;
  learning_objectives: number;
  lesson_vocabulary: number;
  concepts: number;
  questions: number;
  curriculum_sources: number;
  game_templates: number;
  game_definitions: number;
}
export interface AdminDashboardResponse {
  content: {
    grades: number;
    terms: number;
    subjects: number;
    units: number;
    lessons: number;
    lesson_content_blocks: number;
    lesson_assets: number;
    learning_objectives: number;
    lesson_vocabulary: number;
    concepts: number;
    questions: number;
    curriculum_sources: number;
    game_templates: number;
    game_definitions: number;
  };
  users: {
    profiles: number;
    students: number;
  };
  subscriptions: {
    plans: number;
    subscriptions: number;
  };
}

export type AdminDiagnosticStatus =
  | "pass"
  | "fail";

export interface AdminDiagnosticCheck {
  name: string;
  status: AdminDiagnosticStatus;
  duration_ms: number;
  error?: unknown;
}

export interface AdminDiagnosticsResponse {
  status: "healthy" | "degraded";
  checked_at: string;
  duration_ms: number;
  checks: AdminDiagnosticCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}
export interface AdminLessonCreateInput {
  subject_id: number;
  unit_id: number;
  unit_number: number;
  lesson_number: number;
  title: string;
  content_summary?: string;
  video_url?: string;
  infographic_url?: string;
  game_url?: string;
}

export interface AdminLessonUpdateInput {
  subject_id?: number;
  unit_id?: number;
  unit_number?: number;
  lesson_number?: number;
  title?: string;
  content_summary?: string;
  video_url?: string;
  infographic_url?: string;
  game_url?: string;
}

export interface AdminContentBlockCreateInput {
  lesson_id: number;
  block_type: string;
  content?: Record<string, unknown>;
  asset_id?: string | null;
  sort_order?: number;
  is_published?: boolean;
}

export interface AdminContentBlockUpdateInput {
  block_type?: string;
  content?: Record<string, unknown>;
  asset_id?: string | null;
  sort_order?: number;
  is_published?: boolean;
}

export interface AdminAssetCreateInput {
  lesson_id: number;
  asset_type: LessonAssetType;
  title?: string | null;
  url: string;
  storage_path?: string | null;
  alt_text?: string | null;
  metadata?: Record<string, unknown>;
  sort_order?: number;
  is_published?: boolean;
}

export interface AdminAssetUpdateInput {
  asset_type?: LessonAssetType;
  title?: string | null;
  url?: string;
  storage_path?: string | null;
  alt_text?: string | null;
  metadata?: Record<string, unknown>;
  sort_order?: number;
  is_published?: boolean;
}

export interface AdminObjectiveCreateInput {
  lesson_id: number;
  objective_code?: string | null;
  statement: string;
  cognitive_level?: string | null;
}

export interface AdminObjectiveUpdateInput {
  objective_code?: string | null;
  statement?: string;
  cognitive_level?: string | null;
}

export interface AdminVocabularyCreateInput {
  lesson_id: number;
  term: string;
  definition?: string | null;
  pronunciation?: string | null;
  example?: string | null;
}

export interface AdminVocabularyUpdateInput {
  term?: string;
  definition?: string | null;
  pronunciation?: string | null;
  example?: string | null;
}

export interface AdminConceptCreateInput {
  subject_id: number;
  name: string;
  description?: string | null;
}

export interface AdminConceptUpdateInput {
  name?: string;
  description?: string | null;
}

export interface AdminSourceCreateInput {
  name: string;
  source_type: CurriculumSourceType;
  publisher?: string | null;
  source_url?: string | null;
  edition?: string | null;
  academic_year?: string | null;
  language?: string;
  rights_notes?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AdminSourceUpdateInput {
  name?: string;
  source_type?: CurriculumSourceType;
  publisher?: string | null;
  source_url?: string | null;
  edition?: string | null;
  academic_year?: string | null;
  language?: string;
  rights_notes?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AdminQuestionOptionInput {
  option_key: string;
  option_text: string;
  is_correct?: boolean;
  sort_order?: number;
  metadata?: Record<string, unknown>;
}

export interface AdminQuestionCreateInput {
  question_type: string;
  difficulty?: string;
  prompt: string;
  explanation?: string | null;
  correct_answer?: unknown;
  metadata?: Record<string, unknown>;
  source?: "manual" | "ai" | "imported" | string;
  status?:
    | "draft"
    | "review"
    | "approved"
    | "published"
    | "archived"
    | string;
  skill_type?: string | null;
  generation_source?: string | null;
  lesson_ids?: number[];
  options?: AdminQuestionOptionInput[];
}

export interface AdminQuestionUpdateInput {
  question_type?: string;
  difficulty?: string;
  prompt?: string;
  explanation?: string | null;
  correct_answer?: unknown;
  metadata?: Record<string, unknown>;
  source?: string;
  status?: string;
  skill_type?: string | null;
  generation_source?: string | null;
  lesson_ids?: number[];
  options?: AdminQuestionOptionInput[];
}

export interface AdminQuestionRecord extends Question {
  correct_answer?: unknown;
  lessons?: Array<{
    question_id: string;
    lesson_id: number;
    relevance: number;
  }>;
}

/* =====================================================================
 * Request Helpers
 * ===================================================================== */

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined;

interface RequestOptions extends RequestInit {
  token?: string | null;
  query?: Record<string, QueryValue>;
}

function buildUrl(
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = new URL(
    `${API_BASE_URL}${normalizedPath}`,
    window.location.origin,
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function resolveAccessToken(
  explicitToken?: string | null,
): Promise<string | null> {
  if (explicitToken !== undefined) {
    const normalized = explicitToken.trim();

    if (!normalized) {
      return null;
    }

    return normalized.toLowerCase().startsWith("bearer ")
      ? normalized.slice(7).trim()
      : normalized;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw {
      status: 401,
      message: "تعذر الحصول على جلسة تسجيل الدخول.",
      details: error,
    } satisfies ApiError;
  }

  return session?.access_token ?? null;
}

async function parseResponse(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function getErrorMessage(
  data: unknown,
  status: number,
): string {
  if (
    data &&
    typeof data === "object" &&
    "detail" in data
  ) {
    const detail = (
      data as { detail?: unknown }
    ).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (detail !== undefined) {
      try {
        return JSON.stringify(detail);
      } catch {
        return "حدث خطأ في الخادم.";
      }
    }
  }

  if (typeof data === "string" && data) {
    return data;
  }

  return `Request failed with status ${status}.`;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    token,
    query,
    headers: customHeaders,
    body,
    ...rest
  } = options;

  const accessToken =
    await resolveAccessToken(token);

  const headers = new Headers(customHeaders);

  headers.set("Accept", "application/json");

  if (body !== undefined && body !== null) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      buildUrl(path, query),
      {
        ...rest,
        headers,
        body,
      },
    );
  } catch (error) {
    throw {
      status: 0,
      message: "تعذر الاتصال بخادم التطبيق.",
      details: error,
    } satisfies ApiError;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw {
      status: response.status,
      message: getErrorMessage(
        data,
        response.status,
      ),
      details: data,
    } satisfies ApiError;
  }

  return data as T;
}

async function get<T>(
  path: string,
  token?: string | null,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return request<T>(path, {
    method: "GET",
    token,
    query,
  });
}

async function post<T>(
  path: string,
  body?: unknown,
  token?: string | null,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    token,
    query,
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });
}

async function patch<T>(
  path: string,
  body?: unknown,
  token?: string | null,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    token,
    query,
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });
}

async function put<T>(
  path: string,
  body?: unknown,
  token?: string | null,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    token,
    query,
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });
}

async function del<T>(
  path: string,
  token?: string | null,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return request<T>(path, {
    method: "DELETE",
    token,
    query,
  });
}

/* =====================================================================
 * Health
 * ===================================================================== */

async function health(
  token?: string | null,
): Promise<HealthResponse> {
  return get<HealthResponse>("/health", token);
}

/* =====================================================================
 * Curriculum
 * ===================================================================== */

async function getGrades(
  token?: string | null,
): Promise<Grade[]> {
  return get<Grade[]>("/grades", token);
}

async function getGrade(
  gradeId: number,
  token?: string | null,
): Promise<Grade> {
  return get<Grade>(
    `/grades/${gradeId}`,
    token,
  );
}

async function getGradeTerms(
  gradeId: number,
  token?: string | null,
): Promise<Term[]> {
  return get<Term[]>(
    `/grades/${gradeId}/terms`,
    token,
  );
}

async function getTerm(
  termId: number,
  token?: string | null,
): Promise<Term> {
  return get<Term>(
    `/terms/${termId}`,
    token,
  );
}

async function getTermSubjects(
  termId: number,
  token?: string | null,
): Promise<Subject[]> {
  return get<Subject[]>(
    `/terms/${termId}/subjects`,
    token,
  );
}

async function getSubject(
  subjectId: number,
  token?: string | null,
): Promise<Subject> {
  return get<Subject>(
    `/subjects/${subjectId}`,
    token,
  );
}

async function getUnits(
  subjectId: number,
  token?: string | null,
): Promise<Unit[]> {
  return get<Unit[]>(
    `/subjects/${subjectId}/units`,
    token,
  );
}

async function getUnit(
  unitId: number,
  token?: string | null,
): Promise<Unit> {
  return get<Unit>(
    `/units/${unitId}`,
    token,
  );
}

async function getUnitLessons(
  unitId: number,
  token?: string | null,
): Promise<Lesson[]> {
  return get<Lesson[]>(
    `/units/${unitId}/lessons`,
    token,
  );
}

/* =====================================================================
 * Lessons
 * ===================================================================== */

async function getLesson(
  lessonId: number,
  token?: string | null,
): Promise<Lesson> {
  return get<Lesson>(
    `/lessons/${lessonId}`,
    token,
  );
}

async function getLessonContent(
  lessonId: number,
  token?: string | null,
): Promise<LessonContentBlock[]> {
  return get<LessonContentBlock[]>(
    `/lessons/${lessonId}/content`,
    token,
  );
}

async function getLessonAssets(
  lessonId: number,
  token?: string | null,
): Promise<LessonAsset[]> {
  return get<LessonAsset[]>(
    `/lessons/${lessonId}/assets`,
    token,
  );
}

async function getLessonObjectives(
  lessonId: number,
  token?: string | null,
): Promise<LearningObjective[]> {
  return get<LearningObjective[]>(
    `/lessons/${lessonId}/objectives`,
    token,
  );
}

async function getLessonVocabulary(
  lessonId: number,
  token?: string | null,
): Promise<LessonVocabulary[]> {
  return get<LessonVocabulary[]>(
    `/lessons/${lessonId}/vocabulary`,
    token,
  );
}

async function getLessonConcepts(
  lessonId: number,
  token?: string | null,
): Promise<LessonConcept[]> {
  return get<LessonConcept[]>(
    `/lessons/${lessonId}/concepts`,
    token,
  );
}

async function getLessonSources(
  lessonId: number,
  token?: string | null,
): Promise<CurriculumSource[]> {
  return get<CurriculumSource[]>(
    `/lessons/${lessonId}/sources`,
    token,
  );
}

/* =====================================================================
 * Questions
 * ===================================================================== */

async function getLessonQuestions(
  lessonId: number,
  token?: string | null,
): Promise<Question[]> {
  return get<Question[]>(
    `/lessons/${lessonId}/questions`,
    token,
  );
}

async function getQuestion(
  questionId: string,
  token?: string | null,
): Promise<Question> {
  return get<Question>(
    `/questions/${encodeURIComponent(
      questionId,
    )}`,
    token,
  );
}

/* =====================================================================
 * Student
 * ===================================================================== */

async function getStudent(
  studentProfileId: string,
  token?: string | null,
): Promise<StudentProfile> {
  return get<StudentProfile>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}`,
    token,
  );
}

async function getStudentDashboard(
  studentProfileId: string,
  token?: string | null,
): Promise<StudentDashboard> {
  return get<StudentDashboard>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/dashboard`,
    token,
  );
}

async function getStudentProgress(
  studentProfileId: string,
  token?: string | null,
): Promise<LessonProgress[]> {
  return get<LessonProgress[]>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/progress`,
    token,
  );
}

async function getLessonProgress(
  studentProfileId: string,
  lessonId: number,
  token?: string | null,
): Promise<LessonProgress | null> {
  return get<LessonProgress | null>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/progress/${lessonId}`,
    token,
  );
}

async function updateLessonProgress(
  studentProfileId: string,
  lessonId: number,
  body: {
    status: string;
    completion_percent: number;
    time_spent_seconds: number;
  },
  token?: string | null,
): Promise<LessonProgress> {
  return post<LessonProgress>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/progress/${lessonId}`,
    body,
    token,
  );
}

async function getStudentAnalytics(
  studentProfileId: string,
  token?: string | null,
): Promise<StudentAnalytics> {
  return get<StudentAnalytics>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/analytics`,
    token,
  );
}

async function createLearningEvent(
  studentProfileId: string,
  body: {
    event_type: string;
    lesson_id?: number | null;
    concept_id?: number | null;
    metadata?: Record<string, unknown>;
  },
  token?: string | null,
): Promise<LearningEvent> {
  return post<LearningEvent>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/events`,
    body,
    token,
  );
}

/* =====================================================================
 * Student Gamification
 * ===================================================================== */

async function getStudentStreak(
  studentProfileId: string,
  token?: string | null,
): Promise<StudentStreak | null> {
  return get<StudentStreak | null>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/streak`,
    token,
  );
}

async function getStudentXp(
  studentProfileId: string,
  token?: string | null,
): Promise<StudentXp> {
  return get<StudentXp>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/xp`,
    token,
  );
}

async function getStudentAchievements(
  studentProfileId: string,
  token?: string | null,
): Promise<Achievement[]> {
  return get<Achievement[]>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/achievements`,
    token,
  );
}

/* =====================================================================
 * Parent
 * ===================================================================== */

async function createParentInvitation(
  studentProfileId: string,
  token?: string | null,
): Promise<ParentInvitation> {
  return post<ParentInvitation>(
    "/parent/invitations",
    undefined,
    token,
    {
      student_profile_id: studentProfileId,
    },
  );
}

async function createParentInvitationForStudent(
  studentProfileId: string,
  token?: string | null,
): Promise<ParentInvitation> {
  return createParentInvitation(
    studentProfileId,
    token,
  );
}

async function claimParentInvitation(
  code: string,
  token?: string | null,
): Promise<ParentInvitationClaim> {
  return post<ParentInvitationClaim>(
    `/parent/invitations/${encodeURIComponent(
      code,
    )}/claim`,
    undefined,
    token,
  );
}

async function getParentStudents(
  parentProfileId: string,
  token?: string | null,
): Promise<ParentStudent[]> {
  return get<ParentStudent[]>(
    `/parents/${encodeURIComponent(
      parentProfileId,
    )}/students`,
    token,
  );
}

async function getParentStudent(
  parentProfileId: string,
  studentProfileId: string,
  token?: string | null,
): Promise<ParentStudent> {
  return get<ParentStudent>(
    `/parents/${encodeURIComponent(
      parentProfileId,
    )}/students/${encodeURIComponent(
      studentProfileId,
    )}`,
    token,
  );
}

/* =====================================================================
 * Canonical Games
 * ===================================================================== */

async function getGameTemplates(
  token?: string | null,
): Promise<GameTemplate[]> {
  return get<GameTemplate[]>(
    "/game-templates",
    token,
  );
}

async function getGameDefinitions(
  query?: {
    lesson_id?: number;
    unit_id?: number;
    subject_id?: number;
    course_id?: string;
    challenge_id?: string;
  },
  token?: string | null,
): Promise<GameDefinition[]> {
  return get<GameDefinition[]>(
    "/game-definitions",
    token,
    query,
  );
}

async function getGameDefinition(
  gameDefinitionId: string,
  token?: string | null,
): Promise<GameDefinition> {
  return get<GameDefinition>(
    `/game-definitions/${encodeURIComponent(
      gameDefinitionId,
    )}`,
    token,
  );
}

async function createGameSession(
  studentProfileId: string,
  gameDefinitionId: string,
  token?: string | null,
): Promise<GameSession> {
  return post<GameSession>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/game-sessions`,
    {
      game_definition_id: gameDefinitionId,
    },
    token,
  );
}

async function getStudentGameSessions(
  studentProfileId: string,
  token?: string | null,
): Promise<GameSession[]> {
  return get<GameSession[]>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/game-sessions`,
    token,
  );
}

async function getGameSession(
  studentProfileId: string,
  sessionId: string,
  token?: string | null,
): Promise<GameSession> {
  return get<GameSession>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/game-sessions/${encodeURIComponent(
      sessionId,
    )}`,
    token,
  );
}

async function updateGameSession(
  studentProfileId: string,
  sessionId: string,
  body: {
    status: string;
    score: number;
    max_score: number;
    accuracy?: number | null;
    xp_earned: number;
    metadata?: Record<string, unknown>;
  },
  token?: string | null,
): Promise<GameSession> {
  return patch<GameSession>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/game-sessions/${encodeURIComponent(
      sessionId,
    )}`,
    body,
    token,
  );
}

async function createQuestionAttempt(
  studentProfileId: string,
  body: {
    session_question_id: string;
    answer: unknown;
    is_correct: boolean;
    points_awarded: number;
    response_time_ms?: number | null;
    feedback?: Record<string, unknown>;
  },
  token?: string | null,
): Promise<QuestionAttempt> {
  return post<QuestionAttempt>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/question-attempts`,
    body,
    token,
  );
}

/* =====================================================================
 * Challenges
 * ===================================================================== */

async function getChallenges(
  gradeId?: number,
  token?: string | null,
): Promise<Challenge[]> {
  return get<Challenge[]>(
    "/challenges",
    token,
    gradeId === undefined
      ? undefined
      : { grade_id: gradeId },
  );
}

async function getChallenge(
  challengeId: string,
  token?: string | null,
): Promise<Challenge> {
  return get<Challenge>(
    `/challenges/${encodeURIComponent(
      challengeId,
    )}`,
    token,
  );
}

async function joinChallenge(
  studentProfileId: string,
  challengeId: string,
  token?: string | null,
): Promise<ChallengeParticipant> {
  return post<ChallengeParticipant>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/challenges/${encodeURIComponent(
      challengeId,
    )}/join`,
    undefined,
    token,
  );
}

/* =====================================================================
 * Courses
 * ===================================================================== */

async function getCourses(
  token?: string | null,
): Promise<Course[]> {
  return get<Course[]>("/courses", token);
}

async function getCourse(
  courseId: string,
  token?: string | null,
): Promise<Course> {
  return get<Course>(
    `/courses/${encodeURIComponent(
      courseId,
    )}`,
    token,
  );
}

async function getCourseModules(
  courseId: string,
  token?: string | null,
): Promise<CourseModule[]> {
  return get<CourseModule[]>(
    `/courses/${encodeURIComponent(
      courseId,
    )}/modules`,
    token,
  );
}

async function getCourseModuleLessons(
  moduleId: string,
  token?: string | null,
): Promise<CourseLesson[]> {
  return get<CourseLesson[]>(
    `/course-modules/${encodeURIComponent(
      moduleId,
    )}/lessons`,
    token,
  );
}

async function getCourseEnrollment(
  courseId: string,
  studentProfileId: string,
  token?: string | null,
): Promise<CourseEnrollment | null> {
  return get<CourseEnrollment | null>(
    `/courses/${encodeURIComponent(
      courseId,
    )}/enrollment`,
    token,
    {
      student_profile_id: studentProfileId,
    },
  );
}

/* =====================================================================
 * Messaging
 * ===================================================================== */

async function getConversations(
  studentProfileId: string,
  token?: string | null,
): Promise<Conversation[]> {
  return get<Conversation[]>(
    "/conversations",
    token,
    {
      student_profile_id: studentProfileId,
    },
  );
}

async function getMessages(
  conversationId: string,
  studentProfileId: string,
  token?: string | null,
): Promise<Message[]> {
  return get<Message[]>(
    `/conversations/${encodeURIComponent(
      conversationId,
    )}/messages`,
    token,
    {
      student_profile_id: studentProfileId,
    },
  );
}

/* =====================================================================
 * Admin
 * ===================================================================== */

async function getAdminMe(
  token?: string | null,
): Promise<AdminProfile> {
  return get<AdminProfile>("/admin/me", token);
}

async function getAdminContentOverview(
  token?: string | null,
): Promise<AdminContentOverview> {
  return get<AdminContentOverview>(
    "/admin/content/overview",
    token,
  );
}
async function getAdminDashboard(
  token?: string | null,
): Promise<AdminDashboardResponse> {
  return get<AdminDashboardResponse>(
    "/admin/dashboard",
    token,
  );
}

async function getAdminDiagnostics(
  token?: string | null,
): Promise<AdminDiagnosticsResponse> {
  return get<AdminDiagnosticsResponse>(
    "/admin/diagnostics",
    token,
  );
}
/* ---------------------------------------------------------------------
 * Admin lessons
 * --------------------------------------------------------------------- */

async function adminCreateLesson(
  body: AdminLessonCreateInput,
  token?: string | null,
): Promise<Lesson> {
  return post<Lesson>(
    "/admin/lessons",
    body,
    token,
  );
}

async function adminUpdateLesson(
  lessonId: number,
  body: AdminLessonUpdateInput,
  token?: string | null,
): Promise<Lesson> {
  return patch<Lesson>(
    `/admin/lessons/${lessonId}`,
    body,
    token,
  );
}

async function adminDeleteLesson(
  lessonId: number,
  token?: string | null,
): Promise<{
  deleted: boolean;
  lesson_id: number;
}> {
  return del(
    `/admin/lessons/${lessonId}`,
    token,
  );
}

/* ---------------------------------------------------------------------
 * Admin content blocks
 * --------------------------------------------------------------------- */

async function adminCreateContentBlock(
  body: AdminContentBlockCreateInput,
  token?: string | null,
): Promise<LessonContentBlock> {
  return post<LessonContentBlock>(
    "/admin/content-blocks",
    body,
    token,
  );
}

async function adminUpdateContentBlock(
  blockId: string,
  body: AdminContentBlockUpdateInput,
  token?: string | null,
): Promise<LessonContentBlock> {
  return patch<LessonContentBlock>(
    `/admin/content-blocks/${encodeURIComponent(
      blockId,
    )}`,
    body,
    token,
  );
}

async function adminDeleteContentBlock(
  blockId: string,
  token?: string | null,
): Promise<{
  deleted: boolean;
  id: string;
}> {
  return del(
    `/admin/content-blocks/${encodeURIComponent(
      blockId,
    )}`,
    token,
  );
}

/* ---------------------------------------------------------------------
 * Admin assets
 * --------------------------------------------------------------------- */

async function adminCreateAsset(
  body: AdminAssetCreateInput,
  token?: string | null,
): Promise<LessonAsset> {
  return post<LessonAsset>(
    "/admin/assets",
    body,
    token,
  );
}

async function adminUpdateAsset(
  assetId: string,
  body: AdminAssetUpdateInput,
  token?: string | null,
): Promise<LessonAsset> {
  return patch<LessonAsset>(
    `/admin/assets/${encodeURIComponent(
      assetId,
    )}`,
    body,
    token,
  );
}

async function adminDeleteAsset(
  assetId: string,
  token?: string | null,
): Promise<{
  deleted: boolean;
  id: string;
}> {
  return del(
    `/admin/assets/${encodeURIComponent(
      assetId,
    )}`,
    token,
  );
}

/* ---------------------------------------------------------------------
 * Admin objectives
 * --------------------------------------------------------------------- */

async function adminCreateObjective(
  body: AdminObjectiveCreateInput,
  token?: string | null,
): Promise<LearningObjective> {
  return post<LearningObjective>(
    "/admin/objectives",
    body,
    token,
  );
}

async function adminUpdateObjective(
  objectiveId: number,
  body: AdminObjectiveUpdateInput,
  token?: string | null,
): Promise<LearningObjective> {
  return patch<LearningObjective>(
    `/admin/objectives/${objectiveId}`,
    body,
    token,
  );
}

async function adminDeleteObjective(
  objectiveId: number,
  token?: string | null,
): Promise<{
  deleted: boolean;
  id: number;
}> {
  return del(
    `/admin/objectives/${objectiveId}`,
    token,
  );
}

/* ---------------------------------------------------------------------
 * Admin vocabulary
 * --------------------------------------------------------------------- */

async function adminCreateVocabulary(
  body: AdminVocabularyCreateInput,
  token?: string | null,
): Promise<LessonVocabulary> {
  return post<LessonVocabulary>(
    "/admin/vocabulary",
    body,
    token,
  );
}

async function adminUpdateVocabulary(
  vocabularyId: number,
  body: AdminVocabularyUpdateInput,
  token?: string | null,
): Promise<LessonVocabulary> {
  return patch<LessonVocabulary>(
    `/admin/vocabulary/${vocabularyId}`,
    body,
    token,
  );
}

async function adminDeleteVocabulary(
  vocabularyId: number,
  token?: string | null,
): Promise<{
  deleted: boolean;
  id: number;
}> {
  return del(
    `/admin/vocabulary/${vocabularyId}`,
    token,
  );
}

/* ---------------------------------------------------------------------
 * Admin concepts
 * --------------------------------------------------------------------- */

async function adminCreateConcept(
  body: AdminConceptCreateInput,
  token?: string | null,
): Promise<Concept> {
  return post<Concept>(
    "/admin/concepts",
    body,
    token,
  );
}

async function adminUpdateConcept(
  conceptId: number,
  body: AdminConceptUpdateInput,
  token?: string | null,
): Promise<Concept> {
  return patch<Concept>(
    `/admin/concepts/${conceptId}`,
    body,
    token,
  );
}

async function adminDeleteConcept(
  conceptId: number,
  token?: string | null,
): Promise<{
  deleted: boolean;
  id: number;
}> {
  return del(
    `/admin/concepts/${conceptId}`,
    token,
  );
}

async function adminAttachConcept(
  lessonId: number,
  conceptId: number,
  isPrimary = false,
  token?: string | null,
): Promise<LessonConcept> {
  return post<LessonConcept>(
    `/admin/lessons/${lessonId}/concepts/${conceptId}`,
    undefined,
    token,
    {
      is_primary: isPrimary,
    },
  );
}

async function adminDetachConcept(
  lessonId: number,
  conceptId: number,
  token?: string | null,
): Promise<{
  deleted: boolean;
  lesson_id: number;
  concept_id: number;
}> {
  return del(
    `/admin/lessons/${lessonId}/concepts/${conceptId}`,
    token,
  );
}

/* ---------------------------------------------------------------------
 * Admin curriculum sources
 * --------------------------------------------------------------------- */

async function adminCreateSource(
  body: AdminSourceCreateInput,
  token?: string | null,
): Promise<CurriculumSource> {
  return post<CurriculumSource>(
    "/admin/sources",
    body,
    token,
  );
}

async function adminUpdateSource(
  sourceId: string,
  body: AdminSourceUpdateInput,
  token?: string | null,
): Promise<CurriculumSource> {
  return patch<CurriculumSource>(
    `/admin/sources/${encodeURIComponent(
      sourceId,
    )}`,
    body,
    token,
  );
}

async function adminDeleteSource(
  sourceId: string,
  token?: string | null,
): Promise<{
  deleted: boolean;
  id: string;
}> {
  return del(
    `/admin/sources/${encodeURIComponent(
      sourceId,
    )}`,
    token,
  );
}

async function adminAttachSource(
  lessonId: number,
  sourceId: string,
  options?: {
    locator?: string | null;
    notes?: string | null;
  },
  token?: string | null,
): Promise<CurriculumSource> {
  return post<CurriculumSource>(
    `/admin/lessons/${lessonId}/sources/${encodeURIComponent(
      sourceId,
    )}`,
    undefined,
    token,
    {
      locator: options?.locator ?? null,
      notes: options?.notes ?? null,
    },
  );
}

async function adminDetachSource(
  lessonId: number,
  sourceId: string,
  token?: string | null,
): Promise<{
  deleted: boolean;
  lesson_id: number;
  source_id: string;
}> {
  return del(
    `/admin/lessons/${lessonId}/sources/${encodeURIComponent(
      sourceId,
    )}`,
    token,
  );
}

/* ---------------------------------------------------------------------
 * Admin questions
 * --------------------------------------------------------------------- */

async function adminCreateQuestion(
  body: AdminQuestionCreateInput,
  token?: string | null,
): Promise<AdminQuestionRecord> {
  return post<AdminQuestionRecord>(
    "/admin/questions",
    body,
    token,
  );
}

async function adminGetQuestion(
  questionId: string,
  token?: string | null,
): Promise<AdminQuestionRecord> {
  return get<AdminQuestionRecord>(
    `/admin/questions/${encodeURIComponent(
      questionId,
    )}`,
    token,
  );
}

async function adminUpdateQuestion(
  questionId: string,
  body: AdminQuestionUpdateInput,
  token?: string | null,
): Promise<AdminQuestionRecord> {
  return patch<AdminQuestionRecord>(
    `/admin/questions/${encodeURIComponent(
      questionId,
    )}`,
    body,
    token,
  );
}

async function adminDeleteQuestion(
  questionId: string,
  token?: string | null,
): Promise<{
  deleted: boolean;
  id: string;
}> {
  return del(
    `/admin/questions/${encodeURIComponent(
      questionId,
    )}`,
    token,
  );
}

/* =====================================================================
 * Exported API
 * ===================================================================== */

export const apiClient = {
  /* Low-level */
  get,
  post,
  patch,
  put,
  delete: del,

  /* Health */
  health,

  /* Curriculum */
  getGrades,
  getGrade,
  getGradeTerms,
  getTerm,
  getTermSubjects,
  getSubject,
  getUnits,
  getUnit,
  getUnitLessons,

  /* Lessons */
  getLesson,
  getLessonContent,
  getLessonAssets,
  getLessonObjectives,
  getLessonVocabulary,
  getLessonConcepts,
  getLessonSources,

  /* Questions */
  getLessonQuestions,
  getQuestion,

  /* Student */
  getStudent,
  getStudentDashboard,
  getStudentProgress,
  getLessonProgress,
  updateLessonProgress,
  getStudentAnalytics,
  createLearningEvent,

  /* Student gamification */
  getStudentStreak,
  getStudentXp,
  getStudentAchievements,

  /* Parent */
  createParentInvitation,
  createParentInvitationForStudent,
  claimParentInvitation,
  getParentStudents,
  getParentStudent,

  /* Canonical games */
  getGameTemplates,
  getGameDefinitions,
  getGameDefinition,
  createGameSession,
  getStudentGameSessions,
  getGameSession,
  updateGameSession,
  createQuestionAttempt,

  /* Challenges */
  getChallenges,
  getChallenge,
  joinChallenge,

  /* Courses */
  getCourses,
  getCourse,
  getCourseModules,
  getCourseModuleLessons,
  getCourseEnrollment,

  /* Messaging */
  getConversations,
  getMessages,

  /* Admin */
    getAdminMe,
  getAdminContentOverview,
  getAdminDashboard,
  getAdminDiagnostics,

  adminCreateLesson,
  adminUpdateLesson,
  adminDeleteLesson,

  adminCreateContentBlock,
  adminUpdateContentBlock,
  adminDeleteContentBlock,

  adminCreateAsset,
  adminUpdateAsset,
  adminDeleteAsset,

  adminCreateObjective,
  adminUpdateObjective,
  adminDeleteObjective,

  adminCreateVocabulary,
  adminUpdateVocabulary,
  adminDeleteVocabulary,

  adminCreateConcept,
  adminUpdateConcept,
  adminDeleteConcept,
  adminAttachConcept,
  adminDetachConcept,

  adminCreateSource,
  adminUpdateSource,
  adminDeleteSource,
  adminAttachSource,
  adminDetachSource,

  adminCreateQuestion,
  adminGetQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
};

export default apiClient;