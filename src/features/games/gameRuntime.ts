import type {
  GameAnswerInput,
  GameAnswerResult,
  GameRuntimeConfig,
  GameRuntimeEvent,
  GameRuntimeResult,
  GameRuntimeState,
  SafeGameQuestion,
} from './gameTypes';

/**
 * TheTutor Game Runtime
 *
 * This module owns temporary client-side game state.
 *
 * It deliberately does NOT:
 *
 * - access Supabase
 * - determine whether an answer is correct
 * - calculate authoritative XP
 * - calculate authoritative score
 * - determine lesson eligibility
 * - expose or derive a correct answer
 *
 * The trusted backend/database operation must return the authoritative
 * GameAnswerResult and GameRuntimeResult.
 */

/* -------------------------------------------------------------------------- */
/* Runtime errors                                                             */
/* -------------------------------------------------------------------------- */

export class GameRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameRuntimeError';
  }
}

/* -------------------------------------------------------------------------- */
/* Runtime initialization                                                     */
/* -------------------------------------------------------------------------- */

export type InitializeGameRuntimeOptions = {
  config: GameRuntimeConfig;
  questions: SafeGameQuestion[];
  sessionId: string;
  startedAt?: string;
};

/**
 * Creates a ready-to-play runtime state.
 *
 * The session must already have been created by the trusted backend/database
 * layer. The runtime only receives the resulting session ID.
 */
export function initializeGameRuntime(
  options: InitializeGameRuntimeOptions,
): GameRuntimeState {
  const {
    config,
    questions,
    sessionId,
    startedAt = new Date().toISOString(),
  } = options;

  if (!sessionId.trim()) {
    throw new GameRuntimeError(
      'A valid game session ID is required.',
    );
  }

  if (questions.length === 0) {
    throw new GameRuntimeError(
      'The game contains no playable questions.',
    );
  }

  return {
    phase: 'ready',

    sessionId,

    config,

    questions,

    currentQuestionIndex: 0,

    selectedAnswer: null,

    answerResult: null,

    score: 0,

    correctAnswers: 0,

    incorrectAnswers: 0,

    startedAt,

    completedAt: null,

    error: null,

    result: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Current question                                                           */
/* -------------------------------------------------------------------------- */

export function getCurrentQuestion(
  state: GameRuntimeState,
): SafeGameQuestion | null {
  if (
    state.currentQuestionIndex < 0 ||
    state.currentQuestionIndex >=
      state.questions.length
  ) {
    return null;
  }

  return (
    state.questions[
      state.currentQuestionIndex
    ] ?? null
  );
}

export function isLastQuestion(
  state: GameRuntimeState,
): boolean {
  return (
    state.questions.length > 0 &&
    state.currentQuestionIndex ===
      state.questions.length - 1
  );
}

export function getQuestionNumber(
  state: GameRuntimeState,
): number {
  if (state.questions.length === 0) {
    return 0;
  }

  return state.currentQuestionIndex + 1;
}

/* -------------------------------------------------------------------------- */
/* Answer submission                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Builds the payload that the trusted answer-submission layer should send.
 *
 * No correctness information is included.
 */
export function createGameAnswerInput(
  state: GameRuntimeState,
): GameAnswerInput {
  const question =
    getCurrentQuestion(state);

  if (!question) {
    throw new GameRuntimeError(
      'There is no current question.',
    );
  }

  if (!state.sessionId) {
    throw new GameRuntimeError(
      'There is no active game session.',
    );
  }

  if (
    state.selectedAnswer === null ||
    state.selectedAnswer === undefined
  ) {
    throw new GameRuntimeError(
      'An answer must be selected before submission.',
    );
  }

  return {
    questionId: question.id,

    answer: state.selectedAnswer,

    answeredAt: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* State transition helpers                                                   */
/* -------------------------------------------------------------------------- */

function clearAnswerState(
  state: GameRuntimeState,
): GameRuntimeState {
  return {
    ...state,

    selectedAnswer: null,

    answerResult: null,
  };
}

function moveToNextQuestion(
  state: GameRuntimeState,
): GameRuntimeState {
  if (isLastQuestion(state)) {
    return {
      ...state,

      phase: 'completed',
    };
  }

  return {
    ...state,

    phase: 'playing',

    currentQuestionIndex:
      state.currentQuestionIndex + 1,

    selectedAnswer: null,

    answerResult: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Runtime reducer                                                            */
/* -------------------------------------------------------------------------- */

export function gameRuntimeReducer(
  state: GameRuntimeState,
  event: GameRuntimeEvent,
): GameRuntimeState {
  switch (event.type) {
    case 'START': {
      if (!state.config) {
        return {
          ...state,

          phase: 'error',

          error:
            'Game configuration is not available.',

          result: null,
        };
      }

      if (state.questions.length === 0) {
        return {
          ...state,

          phase: 'error',

          error:
            'The game contains no playable questions.',

          result: null,
        };
      }

      if (!state.sessionId) {
        return {
          ...state,

          phase: 'error',

          error:
            'Game session is not available.',

          result: null,
        };
      }

      return {
        ...state,

        phase: 'playing',

        error: null,

        selectedAnswer: null,

        answerResult: null,

        result: null,
      };
    }

    case 'SELECT_ANSWER': {
      if (
        state.phase !== 'playing' &&
        state.phase !== 'answering'
      ) {
        return state;
      }

      if (state.answerResult) {
        return state;
      }

      return {
        ...state,

        selectedAnswer: event.answer,

        error: null,
      };
    }

    case 'SUBMIT_ANSWER': {
      if (state.phase !== 'playing') {
        return state;
      }

      if (
        state.selectedAnswer === null ||
        state.selectedAnswer === undefined
      ) {
        return {
          ...state,

          error:
            'An answer must be selected before submission.',
        };
      }

      return {
        ...state,

        phase: 'answering',

        error: null,
      };
    }

    case 'ANSWER_RESULT': {
      if (
        state.phase !== 'answering' &&
        state.phase !== 'playing'
      ) {
        return state;
      }

      const currentQuestion =
        getCurrentQuestion(state);

      if (!currentQuestion) {
        return {
          ...state,

          phase: 'error',

          error:
            'Cannot apply an answer result without a current question.',
        };
      }

      if (
        event.result.questionId !==
        currentQuestion.id
      ) {
        return {
          ...state,

          phase: 'error',

          error:
            'The answer result does not belong to the current question.',
        };
      }

      const score =
        state.score +
        event.result.pointsEarned;

      const correctAnswers =
        state.correctAnswers +
        (event.result.isCorrect ? 1 : 0);

      const incorrectAnswers =
        state.incorrectAnswers +
        (event.result.isCorrect ? 0 : 1);

      return {
        ...state,

        phase: 'feedback',

        answerResult: event.result,

        score,

        correctAnswers,

        incorrectAnswers,

        error: null,
      };
    }

    case 'NEXT_QUESTION': {
      if (
        state.phase !== 'feedback'
      ) {
        return state;
      }

      return moveToNextQuestion(state);
    }

    case 'COMPLETE': {
      if (
        event.result.gameId !==
        state.config?.game.id
      ) {
        return {
          ...state,

          phase: 'error',

          error:
            'The completed result does not belong to this game.',
        };
      }

      if (
        state.sessionId &&
        event.result.sessionId !==
          state.sessionId
      ) {
        return {
          ...state,

          phase: 'error',

          error:
            'The completed result does not belong to this session.',
        };
      }

      return {
        ...state,

        phase: 'completed',

        completedAt:
          event.result.completedAt ??
          new Date().toISOString(),

        score: event.result.score,

        correctAnswers:
          event.result.correctAnswers,

        incorrectAnswers:
          event.result.incorrectAnswers,

        result: event.result,

        error: null,
      };
    }

    case 'ABANDON': {
      if (
        state.phase === 'completed'
      ) {
        return state;
      }

      return {
        ...state,

        phase: 'completed',

        completedAt:
          new Date().toISOString(),

        result: state.result
          ? {
              ...state.result,

              status: 'abandoned',

              completedAt:
                new Date().toISOString(),
            }
          : null,

        error: null,
      };
    }

    case 'ERROR': {
      return {
        ...state,

        phase: 'error',

        error: event.message,

        result: null,
      };
    }

    case 'RESET': {
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

    default: {
      return state;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Runtime predicates                                                         */
/* -------------------------------------------------------------------------- */

export function canStartGame(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'ready' &&
    state.config !== null &&
    state.sessionId !== null &&
    state.questions.length > 0
  );
}

export function canSelectAnswer(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'playing' &&
    state.answerResult === null
  );
}

export function canSubmitAnswer(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'playing' &&
    state.selectedAnswer !== null &&
    state.selectedAnswer !== undefined
  );
}

export function canShowFeedback(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'feedback' &&
    state.answerResult !== null
  );
}

export function canMoveToNextQuestion(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'feedback' &&
    state.answerResult !== null
  );
}

export function canCompleteGame(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'playing' ||
    state.phase === 'feedback'
  );
}

/* -------------------------------------------------------------------------- */
/* Runtime progress                                                           */
/* -------------------------------------------------------------------------- */

export type GameRuntimeProgress = {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  percentage: number;
};

export function getRuntimeProgress(
  state: GameRuntimeState,
): GameRuntimeProgress {
  const totalQuestions =
    state.questions.length;

  const answeredQuestions =
    state.correctAnswers +
    state.incorrectAnswers;

  const percentage =
    totalQuestions === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (answeredQuestions /
              totalQuestions) *
              100,
          ),
        );

  return {
    currentQuestion:
      totalQuestions === 0
        ? 0
        : Math.min(
            state.currentQuestionIndex + 1,
            totalQuestions,
          ),

    totalQuestions,

    answeredQuestions,

    percentage,
  };
}

/* -------------------------------------------------------------------------- */
/* Runtime result helpers                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns the latest server-authoritative result.
 *
 * This function does not manufacture a score or XP result.
 */
export function getCompletedResult(
  state: GameRuntimeState,
): GameRuntimeResult | null {
  return state.result;
}

/**
 * The runtime may display these counters while the game is running,
 * but they must not be treated as the authoritative persisted result.
 */
export function getDisplayedScore(
  state: GameRuntimeState,
): number {
  return state.score;
}

export function getDisplayedCorrectCount(
  state: GameRuntimeState,
): number {
  return state.correctAnswers;
}

export function getDisplayedIncorrectCount(
  state: GameRuntimeState,
): number {
  return state.incorrectAnswers;
}

/* -------------------------------------------------------------------------- */
/* Feedback helpers                                                           */
/* -------------------------------------------------------------------------- */

export function getAnswerFeedback(
  result: GameAnswerResult | null,
): string | null {
  if (!result) {
    return null;
  }

  return (
    result.feedback ??
    result.explanation ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Safe completion check                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Determines whether every question has received an authoritative answer
 * result from the trusted answer-submission layer.
 *
 * It does NOT decide whether the student passed.
 */
export function hasAnsweredAllQuestions(
  state: GameRuntimeState,
): boolean {
  if (state.questions.length === 0) {
    return false;
  }

  return (
    state.correctAnswers +
      state.incorrectAnswers >=
    state.questions.length
  );
}

/* -------------------------------------------------------------------------- */
/* Runtime lifecycle                                                          */
/* -------------------------------------------------------------------------- */

export function isGameActive(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'playing' ||
    state.phase === 'answering' ||
    state.phase === 'feedback'
  );
}

export function isGameFinished(
  state: GameRuntimeState,
): boolean {
  return state.phase === 'completed';
}

export function hasGameError(
  state: GameRuntimeState,
): boolean {
  return (
    state.phase === 'error' &&
    state.error !== null
  );
}

/* -------------------------------------------------------------------------- */
/* Answer transition                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Applies the authoritative result returned by the trusted layer.
 *
 * This helper exists to keep UI code simple:
 *
 * dispatch({
 *   type: 'ANSWER_RESULT',
 *   result,
 * });
 */
export function applyAnswerResult(
  state: GameRuntimeState,
  result: GameAnswerResult,
): GameRuntimeState {
  return gameRuntimeReducer(
    state,
    {
      type: 'ANSWER_RESULT',
      result,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Question transition                                                        */
/* -------------------------------------------------------------------------- */

export function selectAnswer(
  state: GameRuntimeState,
  answer: unknown,
): GameRuntimeState {
  return gameRuntimeReducer(
    state,
    {
      type: 'SELECT_ANSWER',
      answer,
    },
  );
}

export function submitAnswer(
  state: GameRuntimeState,
): GameRuntimeState {
  return gameRuntimeReducer(
    state,
    {
      type: 'SUBMIT_ANSWER',
    },
  );
}

export function nextQuestion(
  state: GameRuntimeState,
): GameRuntimeState {
  return gameRuntimeReducer(
    state,
    {
      type: 'NEXT_QUESTION',
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Runtime start                                                              */
/* -------------------------------------------------------------------------- */

export function startGame(
  state: GameRuntimeState,
): GameRuntimeState {
  return gameRuntimeReducer(
    state,
    {
      type: 'START',
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Runtime completion                                                         */
/* -------------------------------------------------------------------------- */

export function completeGame(
  state: GameRuntimeState,
  result: GameRuntimeResult,
): GameRuntimeState {
  return gameRuntimeReducer(
    state,
    {
      type: 'COMPLETE',
      result,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Runtime abandonment                                                        */
/* -------------------------------------------------------------------------- */

export function abandonGame(
  state: GameRuntimeState,
): GameRuntimeState {
  return gameRuntimeReducer(
    state,
    {
      type: 'ABANDON',
    },
  );
}