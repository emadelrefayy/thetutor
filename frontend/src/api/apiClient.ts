const API_BASE_URL =
import.meta.env.VITE_API_BASE_URL ||
"http://localhost:8000/api";

type RequestOptions = RequestInit & {
token?: string;
};

export interface Grade {
id: number;
title: string;
level_code?: number | null;
code: string;
created_at?: string;
}

export interface Term {
id: number;
grade_id: number;
title: string;
code: string;
created_at?: string;
}

export interface Subject {
id: number;
term_id: number;
title: string;
code: string;
icon_name?: string | null;
color_theme?: string | null;
created_at?: string;
}

export interface Unit {
id: number;
subject_id: number;
unit_number: number;
title: string;
description?: string | null;
created_at?: string;
}

export interface Lesson {
id: number;
subject_id: number;
unit_id?: number | null;
unit_number?: number | null;
lesson_number: number;
title: string;
content_summary?: string | null;
video_url?: string | null;
infographic_url?: string | null;
game_url?: string | null;
created_at?: string;
}

export interface LessonContentBlock {
id: string;
lesson_id: number;
block_type: string;
content: Record<string, unknown>;
asset_id?: string | null;
sort_order: number;
is_published: boolean;
created_at?: string;
}

export interface LessonAsset {
id: string;
lesson_id: number;
asset_type: string;
title?: string | null;
url: string;
storage_path?: string | null;
alt_text?: string | null;
metadata: Record<string, unknown>;
sort_order: number;
is_published: boolean;
created_at?: string;
}

export interface LearningObjective {
id: number;
lesson_id: number;
objective_code?: string | null;
statement: string;
cognitive_level?: string | null;
created_at?: string;
}

export interface LessonVocabulary {
id: number;
lesson_id: number;
term: string;
definition?: string | null;
pronunciation?: string | null;
example?: string | null;
created_at?: string;
}

export interface Concept {
id: number;
subject_id?: number | null;
name: string;
description?: string | null;
created_at?: string;
is_primary?: boolean;
}

export interface CurriculumSource {
id: string;
name: string;
source_type: string;
publisher?: string | null;
source_url?: string | null;
edition?: string | null;
academic_year?: string | null;
language?: string | null;
rights_notes?: string | null;
metadata: Record<string, unknown>;
locator?: string | null;
notes?: string | null;
created_at?: string;
}

export interface QuestionOption {
id: string;
question_id: string;
option_key: string;
option_text: string;
sort_order: number;
metadata: Record<string, unknown>;
}

export interface Question {
id: string;
question_type: string;
difficulty?: string | null;
prompt: string;
explanation?: string | null;
metadata: Record<string, unknown>;
source?: string | null;
status?: string | null;
created_at?: string;
updated_at?: string;
relevance?: number | null;
options?: QuestionOption[];
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
created_at?: string;
updated_at?: string;
}

export interface LessonProgress {
id: string;
student_profile_id: string;
lesson_id: number;
status: "not_started" | "in_progress" | "completed";
completion_percent: number;
first_started_at?: string | null;
completed_at?: string | null;
last_accessed_at?: string | null;
time_spent_seconds: number;
updated_at?: string;
}

export interface LearningEvent {
id: string;
student_profile_id: string;
event_type: string;
lesson_id?: number | null;
concept_id?: number | null;
metadata: Record<string, unknown>;
occurred_at?: string;
}

export interface StudentStreak {
student_profile_id: string;
current_streak: number;
longest_streak: number;
last_activity_date?: string | null;
updated_at?: string;
}

export interface XPTransaction {
id: string;
student_profile_id: string;
amount: number;
reason: string;
source_type?: string | null;
source_id?: string | null;
created_at?: string;
}

export interface Achievement {
id: string;
code: string;
name: string;
description?: string | null;
icon_url?: string | null;
xp_reward: number;
criteria: Record<string, unknown>;
earned_at?: string;
metadata?: Record<string, unknown>;
}

export interface StudentAnalytics {
subject_metrics: Record<string, unknown>[];
concept_mastery: Record<string, unknown>[];
recommendations: Record<string, unknown>[];
}

export interface StudentDashboard {
summary: Record<string, unknown> | null;
streak: StudentStreak | null;
recommendations: Record<string, unknown>[];
}

export interface Game {
id: number;
lesson_id?: number | null;
game_type: string;
title?: string | null;
game_data: Record<string, unknown>;
created_at?: string;
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
created_at?: string;
}

export interface GameDefinitionQuestion {
game_definition_id: string;
question_id: string;
sort_order: number;
points: number;
}

export interface GameDefinition {
id: string;
template_id: string;
scope_type: string;
lesson_id?: number | null;
unit_id?: number | null;
subject_id?: number | null;
course_id?: string | null;
challenge_id?: string | null;
title: string;
settings: Record<string, unknown>;
is_active: boolean;
created_at?: string;
questions?: GameDefinitionQuestion[];
}

export interface GameSession {
id: string;
student_profile_id: string;
game_definition_id: string;
started_at?: string;
completed_at?: string | null;
status: "started" | "completed" | "abandoned" | string;
score: number;
max_score: number;
accuracy?: number | null;
xp_earned: number;
metadata: Record<string, unknown>;
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
answered_at?: string;
feedback: Record<string, unknown>;
}

export interface Challenge {
id: string;
title: string;
description?: string | null;
grade_id?: number | null;
starts_at: string;
ends_at: string;
status: string;
settings: Record<string, unknown>;
created_at?: string;
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
joined_at?: string;
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
created_at?: string;
modules?: CourseModule[];
}

export interface CourseModule {
id: string;
course_id: string;
title: string;
description?: string | null;
sort_order: number;
created_at?: string;
lessons?: CourseLesson[];
}

export interface CourseLesson {
id: string;
module_id: string;
title: string;
description?: string | null;
content: Record<string, unknown>;
sort_order: number;
created_at?: string;
}

export interface CourseEnrollment {
id: string;
course_id: string;
student_profile_id: string;
status: "active" | "completed" | "cancelled" | string;
enrolled_at?: string;
completed_at?: string | null;
}

export interface ParentStudent {
parent_profile_id: string;
student_profile_id: string;
relationship?: string | null;
is_primary: boolean;
created_at?: string;
}

export interface ParentInvitation {
id: string;
student_profile_id: string;
code: string;
created_by?: string | null;
expires_at?: string | null;
used_at?: string | null;
used_by?: string | null;
created_at?: string;
}

export interface Conversation {
id: string;
conversation_type: "direct" | "group" | "challenge" | string;
title?: string | null;
created_at?: string;
}

export interface Message {
id: string;
conversation_id: string;
sender_id: string;
body: string;
message_type: "text" | "result_share" | "system" | string;
metadata: Record<string, unknown>;
created_at?: string;
}

export interface CreateLearningEventInput {
event_type: string;
lesson_id?: number | null;
concept_id?: number | null;
metadata?: Record<string, unknown>;
}

export interface UpdateLessonProgressInput {
status?: "not_started" | "in_progress" | "completed";
completion_percent?: number;
time_spent_seconds?: number;
}

export interface CreateGameSessionInput {
game_definition_id: string;
}

export interface UpdateGameSessionInput {
status: "started" | "completed" | "abandoned" | string;
score?: number;
max_score?: number;
accuracy?: number | null;
xp_earned?: number;
metadata?: Record<string, unknown>;
}

export interface CreateQuestionAttemptInput {
session_question_id: string;
answer: unknown;
is_correct: boolean;
points_awarded?: number;
response_time_ms?: number | null;
feedback?: Record<string, unknown>;
}

async function request<T>(
path: string,
options: RequestOptions = {},
): Promise<T> {
const headers = new Headers(options.headers);

headers.set(
"Accept",
"application/json",
);

if (options.body) {
headers.set(
"Content-Type",
"application/json",
);
}

if (options.token) {
headers.set(
"Authorization",
"Bearer ${options.token}",
);
}

const {
token: _token,
...fetchOptions
} = options;

const response = await fetch(
"${API_BASE_URL}${path}",
{
...fetchOptions,
headers,
},
);

if (!response.ok) {
let message =
"API request failed (${response.status})";

try {
  const error = await response.json();

  if (
    typeof error?.detail === "string"
  ) {
    message = error.detail;
  } else if (
    error?.detail?.message &&
    typeof error.detail.message === "string"
  ) {
    message = error.detail.message;
  }
} catch {
  // Keep the default error message.
}

throw new Error(message);

}

if (response.status === 204) {
return undefined as T;
}

return response.json() as Promise<T>;
}

function queryString(
params: Record<string, string | number | null | undefined>,
): string {
const search = new URLSearchParams();

for (const [key, value] of Object.entries(params)) {
if (
value !== undefined &&
value !== null
) {
search.set(key, String(value));
}
}

const result = search.toString();

return result ? "?${result}" : "";
}

export const apiClient = {
// ================================================================
// Health
// ================================================================

health() {
return request<{
service: string;
status: string;
}>("/health");
},

// ================================================================
// Curriculum
// ================================================================

getGrades() {
return request<Grade[]>("/grades");
},

getGrade(gradeId: number) {
return request<Grade>(
"/grades/${gradeId}",
);
},

getTerms(gradeId: number) {
return request<Term[]>(
"/grades/${gradeId}/terms",
);
},

getTerm(termId: number) {
return request<Term>(
"/terms/${termId}",
);
},

getSubjects(termId: number) {
return request<Subject[]>(
"/terms/${termId}/subjects",
);
},

getSubject(subjectId: number) {
return request<Subject>(
"/subjects/${subjectId}",
);
},

getUnits(subjectId: number) {
return request<Unit[]>(
"/subjects/${subjectId}/units",
);
},

getUnit(unitId: number) {
return request<Unit>(
"/units/${unitId}",
);
},

getLessons(unitId: number) {
return request<Lesson[]>(
"/units/${unitId}/lessons",
);
},

// ================================================================
// Lessons
// ================================================================

getLesson(lessonId: number) {
return request<Lesson>(
"/lessons/${lessonId}",
);
},

getLessonContent(lessonId: number) {
return request<LessonContentBlock[]>(
"/lessons/${lessonId}/content",
);
},

getLessonAssets(lessonId: number) {
return request<LessonAsset[]>(
"/lessons/${lessonId}/assets",
);
},

getLessonObjectives(lessonId: number) {
return request<LearningObjective[]>(
"/lessons/${lessonId}/objectives",
);
},

getLessonVocabulary(lessonId: number) {
return request<LessonVocabulary[]>(
"/lessons/${lessonId}/vocabulary",
);
},

getLessonConcepts(lessonId: number) {
return request<Concept[]>(
"/lessons/${lessonId}/concepts",
);
},

getLessonSources(lessonId: number) {
return request<CurriculumSource[]>(
"/lessons/${lessonId}/sources",
);
},

getLessonQuestions(lessonId: number) {
return request<Question[]>(
"/lessons/${lessonId}/questions",
);
},

getLessonGames(lessonId: number) {
return request<Game[]>(
"/lessons/${lessonId}/games",
);
},

// ================================================================
// Questions
// ================================================================

getQuestion(questionId: string) {
return request<Question>(
"/questions/${encodeURIComponent( questionId, )}",
);
},

// ================================================================
// Student
// ================================================================

getStudent(
studentProfileId: string,
token: string,
) {
return request<StudentProfile>(
"/students/${encodeURIComponent( studentProfileId, )}",
{
token,
},
);
},

getStudentDashboard(
studentProfileId: string,
token: string,
) {
return request<StudentDashboard>(
"/students/${encodeURIComponent( studentProfileId, )}/dashboard",
{
token,
},
);
},

getStudentProgress(
studentProfileId: string,
token: string,
) {
return request<LessonProgress[]>(
"/students/${encodeURIComponent( studentProfileId, )}/progress",
{
token,
},
);
},

getLessonProgress(
studentProfileId: string,
lessonId: number,
token: string,
) {
return request<LessonProgress | null>(
"/students/${encodeURIComponent( studentProfileId, )}/progress/${lessonId}",
{
token,
},
);
},

updateLessonProgress(
studentProfileId: string,
lessonId: number,
data: UpdateLessonProgressInput,
token: string,
) {
return request<LessonProgress>(
"/students/${encodeURIComponent( studentProfileId, )}/progress/${lessonId}",
{
method: "POST",
body: JSON.stringify(data),
token,
},
);
},

getStudentAnalytics(
studentProfileId: string,
token: string,
) {
return request<StudentAnalytics>(
"/students/${encodeURIComponent( studentProfileId, )}/analytics",
{
token,
},
);
},

// ================================================================
// Learning Events
// ================================================================

createLearningEvent(
studentProfileId: string,
data: CreateLearningEventInput,
token: string,
) {
return request<LearningEvent>(
"/students/${encodeURIComponent( studentProfileId, )}/events",
{
method: "POST",
body: JSON.stringify(data),
token,
},
);
},

// ================================================================
// XP / Gamification
// ================================================================

getStudentStreak(
studentProfileId: string,
token: string,
) {
return request<StudentStreak | null>(
"/students/${encodeURIComponent( studentProfileId, )}/streak",
{
token,
},
);
},

getStudentXP(
studentProfileId: string,
token: string,
) {
return request<{
profile: {
profile_id: string;
xp: number;
level: number;
} | null;
transactions: XPTransaction[];
}>(
"/students/${encodeURIComponent( studentProfileId, )}/xp",
{
token,
},
);
},

getStudentAchievements(
studentProfileId: string,
token: string,
) {
return request<Achievement[]>(
"/students/${encodeURIComponent( studentProfileId, )}/achievements",
{
token,
},
);
},

// ================================================================
// Games
// ================================================================

getGames(lessonId?: number) {
return request<Game[]>(
"/games${queryString({ lesson_id: lessonId, })}",
);
},

getGameTemplates() {
return request<GameTemplate[]>(
"/game-templates",
);
},

getGameDefinitions(params?: {
lessonId?: number;
unitId?: number;
subjectId?: number;
courseId?: string;
}) {
return request<GameDefinition[]>(
"/game-definitions${queryString({ lesson_id: params?.lessonId, unit_id: params?.unitId, subject_id: params?.subjectId, course_id: params?.courseId, })}",
);
},

getGameDefinition(
gameDefinitionId: string,
) {
return request<GameDefinition>(
"/game-definitions/${encodeURIComponent( gameDefinitionId, )}",
);
},

createGameSession(
studentProfileId: string,
data: CreateGameSessionInput,
token: string,
) {
return request<GameSession>(
"/students/${encodeURIComponent( studentProfileId, )}/game-sessions",
{
method: "POST",
body: JSON.stringify(data),
token,
},
);
},

updateGameSession(
studentProfileId: string,
sessionId: string,
data: UpdateGameSessionInput,
token: string,
) {
return request<GameSession>(
"/students/${encodeURIComponent( studentProfileId, )}/game-sessions/${encodeURIComponent( sessionId, )}",
{
method: "PATCH",
body: JSON.stringify(data),
token,
},
);
},

createQuestionAttempt(
studentProfileId: string,
data: CreateQuestionAttemptInput,
token: string,
) {
return request<QuestionAttempt>(
"/students/${encodeURIComponent( studentProfileId, )}/question-attempts",
{
method: "POST",
body: JSON.stringify(data),
token,
},
);
},

// ================================================================
// Challenges
// ================================================================

getChallenges(gradeId?: number) {
return request<Challenge[]>(
"/challenges${queryString({ grade_id: gradeId, })}",
);
},

getChallenge(challengeId: string) {
return request<
Challenge & {
questions: ChallengeQuestion[];
}
>(
"/challenges/${encodeURIComponent( challengeId, )}",
);
},

joinChallenge(
studentProfileId: string,
challengeId: string,
token: string,
) {
return request<ChallengeParticipant>(
"/students/${encodeURIComponent( studentProfileId, )}/challenges/${encodeURIComponent( challengeId, )}/join",
{
method: "POST",
token,
},
);
},

// ================================================================
// Parent
// ================================================================

createParentInvitation(
studentProfileId: string,
token: string,
) {
return request<ParentInvitation>(
"/parent/invitations${queryString({ student_profile_id: studentProfileId, })}",
{
method: "POST",
token,
},
);
},

claimParentInvitation(
code: string,
token: string,
) {
return request<{
status: string;
student_profile_id: string;
relationship: ParentStudent[];
}>(
"/parent/invitations/${encodeURIComponent( code, )}/claim",
{
method: "POST",
token,
},
);
},

getParentStudents(
parentProfileId: string,
token: string,
) {
return request<Record<string, unknown>[]>(
"/parents/${encodeURIComponent( parentProfileId, )}/students",
{
token,
},
);
},

getParentStudent(
parentProfileId: string,
studentProfileId: string,
token: string,
) {
return request<Record<string, unknown>>(
"/parents/${encodeURIComponent( parentProfileId, )}/students/${encodeURIComponent( studentProfileId, )}",
{
token,
},
);
},

// ================================================================
// Courses
// ================================================================

getCourses() {
return request<Course[]>("/courses");
},

getCourse(courseId: string) {
return request<Course>(
"/courses/${encodeURIComponent( courseId, )}",
);
},

getCourseModules(courseId: string) {
return request<CourseModule[]>(
"/courses/${encodeURIComponent( courseId, )}/modules",
);
},

getCourseModuleLessons(moduleId: string) {
return request<CourseLesson[]>(
"/course-modules/${encodeURIComponent( moduleId, )}/lessons",
);
},

getCourseEnrollment(
courseId: string,
studentProfileId: string,
token: string,
) {
return request<CourseEnrollment | null>(
"/courses/${encodeURIComponent( courseId, )}/enrollment${queryString({ student_profile_id: studentProfileId, })}",
{
token,
},
);
},

// ================================================================
// Messaging
// ================================================================

getConversations(
studentProfileId: string,
token: string,
) {
return request<Conversation[]>(
"/conversations${queryString({ student_profile_id: studentProfileId, })}",
{
token,
},
);
},

getMessages(
conversationId: string,
studentProfileId: string,
token: string,
) {
return request<Message[]>(
"/conversations/${encodeURIComponent( conversationId, )}/messages${queryString({ student_profile_id: studentProfileId, })}",
{
token,
},
);
},
};