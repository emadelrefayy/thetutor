import type {
GameDefinition,
GameScopeType,
} from '../../lib/database';

/**

* ---
* TheTutor Game Runtime Types
* ---
* 
* This file defines the frontend contract used by the Game Runtime.
* 
* Important:
* 
* - These types do NOT replace the database contract.
* - GameDefinition remains the database-backed game definition.
* - The browser is NOT authoritative for correctness, score, XP, or
* eligibility.
* - Server/database operations remain authoritative for those concerns.
* - Runtime state below is temporary UI/session state only.
    */

/* -------------------------------------------------------------------------- /
/ Game scope                                                                  /
/ -------------------------------------------------------------------------- */

export type RuntimeGameScope =
| 'lesson'
| 'unit'
| 'subject'
| 'course'
| 'challenge';

export const GAME_SCOPES: readonly RuntimeGameScope[] = [
'lesson',
'unit',
'subject',
'course',
'challenge',
] as const;

export function isRuntimeGameScope(
value: unknown,
): value is RuntimeGameScope {
return (
typeof value === 'string' &&
GAME_SCOPES.includes(
value as RuntimeGameScope,
)
);
}

/**

* Keeps the runtime scope aligned with the database contract.
  */
  export function isSupportedGameScope(
  scope: GameScopeType,
  ): scope is RuntimeGameScope {
  return isRuntimeGameScope(scope);
  }

/* -------------------------------------------------------------------------- /
/ Game mode                                                                   /
/ -------------------------------------------------------------------------- */

export type GameMode =
| 'solo'
| 'multiplayer';

export const GAME_MODES: readonly GameMode[] = [
'solo',
'multiplayer',
] as const;

export function isGameMode(
value: unknown,
): value is GameMode {
return (
typeof value === 'string' &&
GAME_MODES.includes(
value as GameMode,
)
);
}

/* -------------------------------------------------------------------------- /
/ Difficulty                                                                  /
/ -------------------------------------------------------------------------- */

export type GameDifficulty =
| 'easy'
| 'medium'
| 'hard';

export const GAME_DIFFICULTIES: readonly GameDifficulty[] = [
'easy',
'medium',
'hard',
] as const;

export function isGameDifficulty(
value: unknown,
): value is GameDifficulty {
return (
typeof value === 'string' &&
GAME_DIFFICULTIES.includes(
value as GameDifficulty,
)
);
}

/* -------------------------------------------------------------------------- /
/ Question types                                                              /
/ -------------------------------------------------------------------------- */

/**

* These are the initial question formats defined by the database
* architecture contract.
* 
* The union is intentionally extensible.
  */
  export type GameQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'ordering'
  | 'fill_blank'
  | 'image_choice'
  | 'drag_drop';

export const GAME_QUESTION_TYPES: readonly GameQuestionType[] = [
'multiple_choice',
'true_false',
'matching',
'ordering',
'fill_blank',
'image_choice',
'drag_drop',
] as const;

export function isGameQuestionType(
value: unknown,
): value is GameQuestionType {
return (
typeof value === 'string' &&
GAME_QUESTION_TYPES.includes(
value as GameQuestionType,
)
);
}

/* -------------------------------------------------------------------------- /
/ Runtime phase                                                               /
/ -------------------------------------------------------------------------- */

export type GameRuntimePhase =
| 'loading'
| 'ready'
| 'playing'
| 'answering'
| 'feedback'
| 'completed'
| 'error';

export const GAME_RUNTIME_PHASES: readonly GameRuntimePhase[] = [
'loading',
'ready',
'playing',
'answering',
'feedback',
'completed',
'error',
] as const;

/* -------------------------------------------------------------------------- /
/ Session status                                                              /
/ -------------------------------------------------------------------------- */

export type GameSessionStatus =
| 'created'
| 'active'
| 'completed'
| 'abandoned'
| 'expired';

export const GAME_SESSION_STATUSES: readonly GameSessionStatus[] = [
'created',
'active',
'completed',
'abandoned',
'expired',
] as const;

/* -------------------------------------------------------------------------- /
/ Runtime settings                                                            /
/ -------------------------------------------------------------------------- */

/**

* Settings are stored by the database as JSON.
* 
* The runtime therefore treats every field as optional and validates
* values before using them.
* 
* This prevents the frontend from assuming a database configuration
* that has not been explicitly stored.
  */
  export type GameRuntimeSettings = {
  mode?: GameMode;
  difficulty?: GameDifficulty;

questionType?: GameQuestionType;

questionCount?: number;

timeLimitSeconds?: number | null;

shuffleQuestions?: boolean;
shuffleAnswers?: boolean;

allowRetry?: boolean;
showFeedback?: boolean;

passingScore?: number;

metadata?: Record<
string,
unknown

«;
};»

/* -------------------------------------------------------------------------- /
/ Runtime configuration                                                       /
/ -------------------------------------------------------------------------- */

export type GameRuntimeConfig = {
game: GameDefinition;

scope: RuntimeGameScope;

mode: GameMode;

difficulty: GameDifficulty;

questionType: GameQuestionType;

questionCount: number;

timeLimitSeconds: number | null;

shuffleQuestions: boolean;

shuffleAnswers: boolean;

allowRetry: boolean;

showFeedback: boolean;

passingScore: number;
};

/* -------------------------------------------------------------------------- /
/ Safe question data                                                          /
/ -------------------------------------------------------------------------- */

/**

* This is the question shape the browser is allowed to render.
* 
* IMPORTANT:
* 
* There is deliberately NO correctAnswer field here.
* 
* The database architecture explicitly requires the authoritative
* answer key to remain protected from the browser.
  */
  export type SafeGameQuestionOption = {
  id: string;

label: string;

value?: string;

imageUrl?: string | null;

metadata?: Record<
string,
unknown

«;
};»

export type SafeGameQuestion = {
id: string;

type: GameQuestionType;

prompt: string;

explanation?: string | null;

imageUrl?: string | null;

audioUrl?: string | null;

options: SafeGameQuestionOption[];

metadata?: Record<
string,
unknown

«;
};»

/* -------------------------------------------------------------------------- /
/ Question attempt                                                            /
/ -------------------------------------------------------------------------- */

/**

* Temporary client representation of an answer submission.
* 
* This does NOT contain the authoritative correctness result until the
* trusted backend/database operation returns it.
  */
  export type GameAnswerInput = {
  questionId: string;

answer: unknown;

answeredAt: string;
};

/**

* Server-authoritative answer result as consumed by the runtime.
  */
  export type GameAnswerResult = {
  questionId: string;

isCorrect: boolean;

pointsEarned: number;

feedback?: string | null;

explanation?: string | null;

attemptNumber?: number;
};

/* -------------------------------------------------------------------------- /
/ Runtime question state                                                      /
/ -------------------------------------------------------------------------- */

export type GameQuestionState = {
question: SafeGameQuestion;

index: number;

total: number;

selectedAnswer: unknown | null;

answerResult: GameAnswerResult | null;

answered: boolean;
};

/* -------------------------------------------------------------------------- /
/ Runtime result                                                              /
/ -------------------------------------------------------------------------- */

export type GameRuntimeResult = {
sessionId: string;

gameId: string;

status: 'completed' | 'abandoned' | 'expired';

score: number;

maxScore: number;

correctAnswers: number;

incorrectAnswers: number;

totalQuestions: number;

durationSeconds: number;

xpEarned: number;

completedAt: string | null;
};

/* -------------------------------------------------------------------------- /
/ Runtime state                                                               /
/ -------------------------------------------------------------------------- */

export type GameRuntimeState = {
phase: GameRuntimePhase;

sessionId: string | null;

config: GameRuntimeConfig | null;

questions: SafeGameQuestion[];

currentQuestionIndex: number;

selectedAnswer: unknown | null;

answerResult: GameAnswerResult | null;

score: number;

correctAnswers: number;

incorrectAnswers: number;

startedAt: string | null;

completedAt: string | null;

error: string | null;

result: GameRuntimeResult | null;
};

/* -------------------------------------------------------------------------- /
/ Runtime context                                                             /
/ -------------------------------------------------------------------------- */

export type GameRuntimeContext = {
tenantId: string;

studentProfileId: string;

game: GameDefinition;
};

/* -------------------------------------------------------------------------- /
/ Runtime events                                                              /
/ -------------------------------------------------------------------------- */

export type GameRuntimeEvent =
| {
type: 'START';
}
| {
type: 'SELECT_ANSWER';
answer: unknown;
}
| {
type: 'SUBMIT_ANSWER';
}
| {
type: 'ANSWER_RESULT';
result: GameAnswerResult;
}
| {
type: 'NEXT_QUESTION';
}
| {
type: 'COMPLETE';
result: GameRuntimeResult;
}
| {
type: 'ABANDON';
}
| {
type: 'ERROR';
message: string;
}
| {
type: 'RESET';
};

/* -------------------------------------------------------------------------- /
/ Runtime configuration helpers                                               /
/ -------------------------------------------------------------------------- */

function getObject(
value: unknown,
): Record<string, unknown> {
if (
typeof value !== 'object' ||
value === null ||
Array.isArray(value)
) {
return {};
}

return value as Record<
string,
unknown

«;
}»

function getPositiveInteger(
value: unknown,
fallback: number,
): number {
return typeof value === 'number' &&
Number.isInteger(value) &&
value > 0
? value
: fallback;
}

function getNonNegativeInteger(
value: unknown,
fallback: number,
): number {
return typeof value === 'number' &&
Number.isInteger(value) &&
value >= 0
? value
: fallback;
}

function getBoolean(
value: unknown,
fallback: boolean,
): boolean {
return typeof value === 'boolean'
? value
: fallback;
}

/**

* Converts the JSON settings stored on GameDefinition into a validated
* runtime configuration.
* 
* No database access occurs here.
  */
  export function createGameRuntimeConfig(
  game: GameDefinition,
  ): GameRuntimeConfig {
  if (
  !isSupportedGameScope(
  game.scope_type,
  )
  ) {
  throw new Error(
  "Unsupported game scope: ${game.scope_type}",
  );
  }

const settings =
getObject(game.settings);

const mode =
isGameMode(settings.mode)
? settings.mode
: 'solo';

const difficulty =
isGameDifficulty(
settings.difficulty,
)
? settings.difficulty
: 'easy';

const questionType =
isGameQuestionType(
settings.questionType,
)
? settings.questionType
: 'multiple_choice';

const questionCount =
getPositiveInteger(
settings.questionCount,
10,
);

const timeLimitSeconds =
settings.timeLimitSeconds ===
null
? null
: getNonNegativeInteger(
settings.timeLimitSeconds,
0,
);

const normalizedTimeLimit =
timeLimitSeconds === 0
? null
: timeLimitSeconds;

const shuffleQuestions =
getBoolean(
settings.shuffleQuestions,
true,
);

const shuffleAnswers =
getBoolean(
settings.shuffleAnswers,
true,
);

const allowRetry =
getBoolean(
settings.allowRetry,
false,
);

const showFeedback =
getBoolean(
settings.showFeedback,
true,
);

const passingScore =
typeof settings.passingScore ===
'number' &&
settings.passingScore >= 0 &&
settings.passingScore <= 100
? settings.passingScore
: 60;

return {
game,

scope: game.scope_type,

mode,

difficulty,

questionType,

questionCount,

timeLimitSeconds:
  normalizedTimeLimit,

shuffleQuestions,

shuffleAnswers,

allowRetry,

showFeedback,

passingScore,

};
}

/* -------------------------------------------------------------------------- /
/ Initial runtime state                                                       /
/ -------------------------------------------------------------------------- */

export function createInitialGameRuntimeState(): GameRuntimeState {
return {
phase: 'loading',

sessionId: null,

config: null,

questions: [],

currentQuestionIndex: 0,

selectedAnswer: null,

answerResult: null,

score: 0,

correctAnswers: 0,

incorrectAnswers: 0,

startedAt: null,

completedAt: null,

error: null,

result: null,

};
}