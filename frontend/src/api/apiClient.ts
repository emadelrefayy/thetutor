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

export interface LessonAsset {
  id: string;
  lesson_id: number;
  asset_type:
    | 'image'
    | 'infographic'
    | 'video'
    | 'audio'
    | 'document'
    | 'game'
    | 'external';
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

export interface CurriculumSource {
  id: string;
  name: string;
  source_type:
    | 'official'
    | 'licensed'
    | 'teacher_created'
    | 'ai_generated'
    | 'other';
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
  sort_order: number;
  metadata?: Record<string, unknown> | null;
}

export interface Question {
  id: string;
  question_type:
    | 'multiple_choice'
    | 'true_false'
    | 'matching'
    | 'ordering'
    | 'fill_blank'
    | 'short_answer'
    | 'image_choice'
    | 'drag_drop'
    | string;
  difficulty?: string | null;
  prompt: string;
  explanation?: string | null;
  metadata?: Record<string, unknown> | null;
  source?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  relevance?: number | null;
  options: QuestionOption[];
}

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
  status:
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | string;
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
    | 'lesson'
    | 'concept'
    | 'practice'
    | 'vocabulary'
    | 'game'
    | 'course'
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

export interface StudentDashboard {
  summary: Record<string, unknown> | null;
  streak: StudentStreak | null;
  recommendations: LearningRecommendation[];
}

export interface StudentStreak {
  student_profile_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string | null;
  updated_at?: string | null;
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
  [key: string]: unknown;
}

export interface Game {
  id: number;
  lesson_id?: number | null;
  game_type: string;
  title?: string | null;
  game_data: Record<string, unknown>;
  created_at?: string | null;
}

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
    | 'lesson'
    | 'unit'
    | 'subject'
    | 'course'
    | 'challenge';
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
  status:
    | 'started'
    | 'completed'
    | 'abandoned'
    | string;
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

export interface Challenge {
  id: string;
  title: string;
  description?: string | null;
  grade_id?: number | null;
  starts_at: string;
  ends_at: string;
  status:
    | 'draft'
    | 'scheduled'
    | 'live'
    | 'finished'
    | 'cancelled'
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
  status:
    | 'active'
    | 'completed'
    | 'cancelled'
    | string;
  enrolled_at?: string | null;
  completed_at?: string | null;
}

export interface Conversation {
  id: string;
  conversation_type:
    | 'direct'
    | 'group'
    | 'challenge'
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
    | 'text'
    | 'result_share'
    | 'system'
    | string;
  metadata: Record<string, unknown>;
  created_at?: string | null;
}


interface RequestOptions extends RequestInit {
  token?: string | null;
}


function buildUrl(
  path: string,
  query?: Record<
    string,
    string | number | boolean | null | undefined
  >,
): string {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = `${API_BASE_URL}${normalizedPath}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null
      ) {
        params.set(
          key,
          String(value),
        );
      }
    },
  );

  const queryString = params.toString();

  return queryString
    ? `${url}?${queryString}`
    : url;
}


function getStoredToken(): string | null {
  const possibleKeys = [
    "access_token",
    "supabase_access_token",
    "supabase.auth.token",
  ];

  for (const key of possibleKeys) {
    const value =
      localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}


function normalizeToken(
  token?: string | null,
): string | null {
  if (!token) {
    return getStoredToken();
  }

  return token
    .startsWith("Bearer ")
    ? token.substring(7).trim()
    : token.trim();
}


async function parseResponse(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

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

  const normalizedToken =
    normalizeToken(token);

  const headers =
    new Headers(customHeaders);

  headers.set(
    "Accept",
    "application/json",
  );

  if (
    body !== undefined &&
    body !== null
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (normalizedToken) {
    headers.set(
      "Authorization",
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
      message:
        "تعذر الاتصال بخادم التطبيق.",
      details: error,
    } satisfies ApiError;
  }

  const data =
    await parseResponse(response);

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}.`;

    if (
      data &&
      typeof data === "object" &&
      "detail" in data
    ) {
      const detail = (
        data as {
          detail?: unknown;
        }
      ).detail;

      if (
        typeof detail === "string"
      ) {
        message = detail;
      } else if (
        detail !== undefined
      ) {
        message =
          JSON.stringify(detail);
      }
    } else if (
      typeof data === "string" &&
      data
    ) {
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
  return request<T>(
    path,
    {
      method: "GET",
      token,
    },
  );
}


async function post<T>(
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "POST",
      token,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );
}


async function patch<T>(
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "PATCH",
      token,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );
}


async function put<T>(
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "PUT",
      token,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );
}


async function del<T>(
  path: string,
  token?: string | null,
): Promise<T> {
  return request<T>(
    path,
    {
      method: "DELETE",
      token,
    },
  );
}


/* =====================================================================
 * Curriculum
 * ===================================================================== */

async function getGrades(
  token?: string | null,
) {
  return get<Grade[]>(
    "/grades",
    token,
  );
}


async function getGrade(
  gradeId: number,
  token?: string | null,
) {
  return get<Grade>(
    `/grades/${gradeId}`,
    token,
  );
}


async function getGradeTerms(
  gradeId: number,
  token?: string | null,
) {
  return get<Term[]>(
    `/grades/${gradeId}/terms`,
    token,
  );
}


async function getTerm(
  termId: number,
  token?: string | null,
) {
  return get<Term>(
    `/terms/${termId}`,
    token,
  );
}


async function getTermSubjects(
  termId: number,
  token?: string | null,
) {
  return get<Subject[]>(
    `/terms/${termId}/subjects`,
    token,
  );
}


async function getSubject(
  subjectId: number,
  token?: string | null,
) {
  return get<Subject>(
    `/subjects/${subjectId}`,
    token,
  );
}


async function getUnits(
  subjectId: number,
  token?: string | null,
) {
  return get<Unit[]>(
    `/subjects/${subjectId}/units`,
    token,
  );
}


async function getUnit(
  unitId: number,
  token?: string | null,
) {
  return get<Unit>(
    `/units/${unitId}`,
    token,
  );
}


async function getUnitLessons(
  unitId: number,
  token?: string | null,
) {
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
) {
  return get<Lesson>(
    `/lessons/${lessonId}`,
    token,
  );
}


async function getLessonContent(
  lessonId: number,
  token?: string | null,
) {
  return get<LessonContentBlock[]>(
    `/lessons/${lessonId}/content`,
    token,
  );
}


async function getLessonAssets(
  lessonId: number,
  token?: string | null,
) {
  return get<LessonAsset[]>(
    `/lessons/${lessonId}/assets`,
    token,
  );
}


async function getLessonObjectives(
  lessonId: number,
  token?: string | null,
) {
  return get<LearningObjective[]>(
    `/lessons/${lessonId}/objectives`,
    token,
  );
}


async function getLessonVocabulary(
  lessonId: number,
  token?: string | null,
) {
  return get<LessonVocabulary[]>(
    `/lessons/${lessonId}/vocabulary`,
    token,
  );
}


async function getLessonConcepts(
  lessonId: number,
  token?: string | null,
) {
  return get<LessonConcept[]>(
    `/lessons/${lessonId}/concepts`,
    token,
  );
}


async function getLessonSources(
  lessonId: number,
  token?: string | null,
) {
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
) {
  return get<Question[]>(
    `/lessons/${lessonId}/questions`,
    token,
  );
}


async function getQuestion(
  questionId: string,
  token?: string | null,
) {
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
) {
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
) {
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
) {
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
) {
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
) {
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
) {
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
    metadata?: Record<
      string,
      unknown
    >;
  },
  token?: string | null,
) {
  return post<LearningEvent>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/events`,
    body,
    token,
  );
}


/* =====================================================================
 * Gamification
 * ===================================================================== */

async function getStudentStreak(
  studentProfileId: string,
  token?: string | null,
) {
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
) {
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
) {
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
) {
  return post<ParentInvitation>(
    `/parent/invitations`,
    undefined,
    token,
  ).then(
    (result) => result,
  );
}


async function createParentInvitationForStudent(
  studentProfileId: string,
  token?: string | null,
) {
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
) {
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
) {
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
) {
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
 * Games
 * ===================================================================== */

async function getGames(
  lessonId?: number,
  token?: string | null,
) {
  return get<Game[]>(
    "/games",
    token,
  ).then(
    (games) =>
      lessonId === undefined
        ? games
        : games.filter(
            (game) =>
              game.lesson_id === lessonId,
          ),
  );
}


async function getLessonGames(
  lessonId: number,
  token?: string | null,
) {
  return get<Game[]>(
    `/lessons/${lessonId}/games`,
    token,
  );
}


async function getGameTemplates(
  token?: string | null,
) {
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
) {
  const params: Record<
    string,
    string | number | boolean | null | undefined
  > = {
    lesson_id: query?.lesson_id,
    unit_id: query?.unit_id,
    subject_id: query?.subject_id,
    course_id: query?.course_id,
    challenge_id: query?.challenge_id,
  };

  const queryString =
    new URLSearchParams(
      Object.entries(params)
        .filter(
          ([, value]) =>
            value !== undefined &&
            value !== null,
        )
        .map(
          ([key, value]) => [
            key,
            String(value),
          ],
        ),
    ).toString();

  return get<GameDefinition[]>(
    queryString
      ? `/game-definitions?${queryString}`
      : "/game-definitions",
    token,
  );
}


async function getGameDefinition(
  gameDefinitionId: string,
  token?: string | null,
) {
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
) {
  return post<GameSession>(
    `/students/${encodeURIComponent(
      studentProfileId,
    )}/game-sessions`,
    {
      game_definition_id:
        gameDefinitionId,
    },
    token,
  );
}


async function getStudentGameSessions(
  studentProfileId: string,
  token?: string | null,
) {
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
) {
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
    metadata?: Record<
      string,
      unknown
    >;
  },
  token?: string | null,
) {
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
    feedback?: Record<
      string,
      unknown
    >;
  },
  token?: string | null,
) {
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
) {
  const query =
    gradeId === undefined
      ? ""
      : `?grade_id=${gradeId}`;

  return get<Challenge[]>(
    `/challenges${query}`,
    token,
  );
}


async function getChallenge(
  challengeId: string,
  token?: string | null,
) {
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
) {
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
) {
  return get<Course[]>(
    "/courses",
    token,
  );
}


async function getCourse(
  courseId: string,
  token?: string | null,
) {
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
) {
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
) {
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
) {
  return get<CourseEnrollment | null>(
    `/courses/${encodeURIComponent(
      courseId,
    )}/enrollment?student_profile_id=${encodeURIComponent(
      studentProfileId,
    )}`,
    token,
  );
}


/* =====================================================================
 * Messaging
 * ===================================================================== */

async function getConversations(
  studentProfileId: string,
  token?: string | null,
) {
  return get<Conversation[]>(
    `/conversations?student_profile_id=${encodeURIComponent(
      studentProfileId,
    )}`,
    token,
  );
}


async function getMessages(
  conversationId: string,
  studentProfileId: string,
  token?: string | null,
) {
  return get<Message[]>(
    `/conversations/${encodeURIComponent(
      conversationId,
    )}/messages?student_profile_id=${encodeURIComponent(
      studentProfileId,
    )}`,
    token,
  );
}


/* =====================================================================
 * Public API
 * ===================================================================== */

export const apiClient = {
  get,
  post,
  patch,
  put,
  delete: del,

  getGrades,
  getGrade,
  getGradeTerms,

  getTerm,
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
  getStudentDashboard,
  getStudentProgress,
  getLessonProgress,
  updateLessonProgress,
  getStudentAnalytics,
  createLearningEvent,

  getStudentStreak,
  getStudentXp,
  getStudentAchievements,

  createParentInvitation,
  createParentInvitationForStudent,
  claimParentInvitation,
  getParentStudents,
  getParentStudent,

  getGames,
  getLessonGames,
  getGameTemplates,
  getGameDefinitions,
  getGameDefinition,

  createGameSession,
  getStudentGameSessions,
  getGameSession,
  updateGameSession,
  createQuestionAttempt,

  getChallenges,
  getChallenge,
  joinChallenge,

  getCourses,
  getCourse,
  getCourseModules,
  getCourseModuleLessons,
  getCourseEnrollment,

  getConversations,
  getMessages,
};


export default apiClient;