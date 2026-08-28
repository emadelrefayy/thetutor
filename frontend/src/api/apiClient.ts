// src/api/apiClient.ts

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:8000/api';

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface Grade {
  id: number;
  title: string;
  level_code?: string | null;
  code?: string | null;
  created_at?: string | null;
}

export interface Term {
  id: number;
  title: string;
  code?: string | null;
  grade_id: number;
  created_at?: string | null;
}

export interface Subject {
  id: number;
  title: string;
  description?: string | null;
  code?: string | null;
  term_id: number;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface Unit {
  id: number;
  subject_id: number;
  unit_number?: number | null;
  title: string;
  description?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface Lesson {
  id: number;
  unit_id: number;
  lesson_number?: number | null;
  title: string;
  description?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface LessonContentBlock {
  id: number;
  lesson_id: number;
  block_type?: string | null;
  content?: unknown;
  sort_order?: number | null;
  is_published?: boolean;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface LessonAsset {
  id: number;
  lesson_id: number;
  asset_type?: string | null;
  url?: string | null;
  title?: string | null;
  sort_order?: number | null;
  is_published?: boolean;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface LearningObjective {
  id: number;
  lesson_id: number;
  objective?: string | null;
  description?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface LessonVocabulary {
  id: number;
  lesson_id: number;
  term?: string | null;
  definition?: string | null;
  example?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface LessonConcept {
  id: number;
  lesson_id: number;
  concept_id?: number | null;
  title?: string | null;
  description?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface LessonSourceRef {
  id: number;
  lesson_id: number;
  source_type?: string | null;
  source_url?: string | null;
  title?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface QuestionOption {
  id: string | number;
  question_id: string | number;
  option_key: string;
  option_text: string;
  sort_order?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface Question {
  id: string;
  question_type: string;
  difficulty?: string | number | null;
  prompt: string;
  metadata?: Record<string, unknown> | null;
  source?: string | null;
  status?: string | null;
  skill_type?: string | null;
  generation_source?: string | null;
  relevance?: number | null;
  options: QuestionOption[];
}

export interface StudentProfile {
  profile_id: string;
  [key: string]: unknown;
}

export interface LessonProgress {
  id?: string | number;
  student_profile_id: string;
  lesson_id: number;
  [key: string]: unknown;
}

export interface LearningEvent {
  id?: string | number;
  student_profile_id: string;
  [key: string]: unknown;
}

export interface StudentSubjectMetric {
  id?: string | number;
  student_profile_id: string;
  [key: string]: unknown;
}

export interface ConceptMastery {
  id?: string | number;
  student_profile_id: string;
  [key: string]: unknown;
}

export interface LearningRecommendation {
  id?: string | number;
  student_profile_id: string;
  is_dismissed?: boolean;
  priority?: number;
  [key: string]: unknown;
}

export interface StudentAnalytics {
  subject_metrics: StudentSubjectMetric[];
  concept_mastery: ConceptMastery[];
  recommendations: LearningRecommendation[];
}

export interface ParentInvitation {
  id?: string | number;
  student_profile_id: string;
  created_by?: string;
  code: string;
  expires_at?: string | null;
  used_at?: string | null;
  used_by?: string | null;
  [key: string]: unknown;
}

export interface ParentInvitationClaim {
  status: string;
  student_profile_id: string;
  relationship: unknown;
}

export interface GameDefinition {
  id: string | number;
  [key: string]: unknown;
}

export interface GameSession {
  id: string | number;
  [key: string]: unknown;
}

export interface GameSessionQuestion {
  id: string | number;
  [key: string]: unknown;
}

export interface QuestionAttempt {
  id: string | number;
  [key: string]: unknown;
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
): string {
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  const url = `${API_BASE_URL}${normalizedPath}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString
    ? `${url}?${queryString}`
    : url;
}

function getStoredToken(): string | null {
  const possibleKeys = [
    'access_token',
    'supabase_access_token',
    'supabase.auth.token',
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

function normalizeToken(token?: string | null): string | null {
  if (!token) {
    return getStoredToken();
  }

  return token.startsWith('Bearer ')
    ? token.substring(7).trim()
    : token.trim();
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType =
    response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();

  return text || null;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    token,
    headers: customHeaders,
    body,
    ...rest
  } = options;

  const normalizedToken = normalizeToken(token);

  const headers = new Headers(customHeaders);

  headers.set('Accept', 'application/json');

  if (body !== undefined && body !== null) {
    headers.set('Content-Type', 'application/json');
  }

  if (normalizedToken) {
    headers.set(
      'Authorization',
      `Bearer ${normalizedToken}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      buildUrl(path),
      {
        ...rest,
        headers,
        body,
      },
    );
  } catch (error) {
    throw {
      status: 0,
      message: 'تعذر الاتصال بخادم التطبيق.',
      details: error,
    } satisfies ApiError;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    if (
      data &&
      typeof data === 'object' &&
      'detail' in data
    ) {
      const detail = (data as { detail?: unknown }).detail;

      if (typeof detail === 'string') {
        message = detail;
      } else if (detail !== undefined) {
        message = JSON.stringify(detail);
      }
    } else if (typeof data === 'string' && data) {
      message = data;
    }

    throw {
      status: response.status,
      message,
      details: data,
    } satisfies ApiError;
  }

  return data as T;
}

async function get<T>(
  path: string,
  token?: string | null,
): Promise<T> {
  return request<T>(path, {
    method: 'GET',
    token,
  });
}

async function post<T>(
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    token,
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
): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    token,
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
): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    token,
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });
}

async function del<T>(
  path: string,
  token?: string | null,
): Promise<T> {
  return request<T>(path, {
    method: 'DELETE',
    token,
  });
}

/* ------------------------------------------------------------------
 * Curriculum
 * ------------------------------------------------------------------ */

async function getGrades(
  token?: string | null,
): Promise<Grade[]> {
  return get<Grade[]>(
    '/grades',
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

async function getLesson(
  lessonId: number,
  token?: string | null,
): Promise<Lesson> {
  return get<Lesson>(
    `/lessons/${lessonId}`,
    token,
  );
}

/* ------------------------------------------------------------------
 * Lesson Content
 * ------------------------------------------------------------------ */

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
): Promise<LessonSourceRef[]> {
  return get<LessonSourceRef[]>(
    `/lessons/${lessonId}/sources`,
    token,
  );
}

/* ------------------------------------------------------------------
 * Questions
 * ------------------------------------------------------------------ */

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
    `/questions/${questionId}`,
    token,
  );
}

/* ------------------------------------------------------------------
 * Student
 * ------------------------------------------------------------------ */

async function getStudent(
  studentProfileId: string,
  token?: string | null,
): Promise<StudentProfile> {
  return get<StudentProfile>(
    `/students/${studentProfileId}`,
    token,
  );
}

async function getStudentProgress(
  studentProfileId: string,
  token?: string | null,
): Promise<LessonProgress[]> {
  return get<LessonProgress[]>(
    `/students/${studentProfileId}/progress`,
    token,
  );
}

async function getStudentAnalytics(
  studentProfileId: string,
  token?: string | null,
): Promise<StudentAnalytics> {
  return get<StudentAnalytics>(
    `/students/${studentProfileId}/analytics`,
    token,
  );
}

async function getStudentEvents(
  studentProfileId: string,
  token?: string | null,
): Promise<LearningEvent[]> {
  return get<LearningEvent[]>(
    `/students/${studentProfileId}/events`,
    token,
  );
}

/* ------------------------------------------------------------------
 * Parent Invitations
 * ------------------------------------------------------------------ */

async function createParentInvitation(
  studentProfileId: string,
  token?: string | null,
): Promise<ParentInvitation> {
  return post<ParentInvitation>(
    `/parent/invitations?student_profile_id=${encodeURIComponent(
      studentProfileId,
    )}`,
    undefined,
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

/* ------------------------------------------------------------------
 * Games
 * ------------------------------------------------------------------ */

async function getGames(
  token?: string | null,
): Promise<GameDefinition[]> {
  return get<GameDefinition[]>(
    '/games',
    token,
  );
}

async function getGame(
  gameId: string | number,
  token?: string | null,
): Promise<GameDefinition> {
  return get<GameDefinition>(
    `/games/${encodeURIComponent(String(gameId))}`,
    token,
  );
}

async function getGameQuestions(
  gameId: string | number,
  token?: string | null,
): Promise<GameSessionQuestion[]> {
  return get<GameSessionQuestion[]>(
    `/games/${encodeURIComponent(String(gameId))}/questions`,
    token,
  );
}

async function createGameSession(
  gameId: string | number,
  body?: Record<string, unknown>,
  token?: string | null,
): Promise<GameSession> {
  return post<GameSession>(
    `/games/${encodeURIComponent(String(gameId))}/sessions`,
    body,
    token,
  );
}

async function getGameSession(
  sessionId: string | number,
  token?: string | null,
): Promise<GameSession> {
  return get<GameSession>(
    `/game-sessions/${encodeURIComponent(
      String(sessionId),
    )}`,
    token,
  );
}

async function getGameSessionQuestions(
  sessionId: string | number,
  token?: string | null,
): Promise<GameSessionQuestion[]> {
  return get<GameSessionQuestion[]>(
    `/game-sessions/${encodeURIComponent(
      String(sessionId),
    )}/questions`,
    token,
  );
}

/* ------------------------------------------------------------------
 * Generic helpers
 * ------------------------------------------------------------------ */

export const apiClient = {
  get,
  post,
  patch,
  put,
  delete: del,

  getGrades,
  getGradeTerms,
  getTermSubjects,

  getSubject,
  getUnits,
  getUnit,
  getUnitLessons,
  getLesson,

  getLessonContent,
  getLessonAssets,
  getLessonObjectives,
  getLessonVocabulary,
  getLessonConcepts,
  getLessonSources,

  getLessonQuestions,
  getQuestion,

  getStudent,
  getStudentProgress,
  getStudentAnalytics,
  getStudentEvents,

  createParentInvitation,
  claimParentInvitation,

  getGames,
  getGame,
  getGameQuestions,
  createGameSession,
  getGameSession,
  getGameSessionQuestions,
};

export default apiClient;