import { supabase } from '../../lib/supabase';

import {
  isGameQuestionType,
  type GameAnswerResult,
  type GameDefinition,
  type GameRuntimeContext,
  type GameRuntimeResult,
  type SafeGameQuestion,
} from './gameTypes';

type GameSessionQuestionRow = {
  id: string;
  question_id: string;
  sequence_no: number;
  points_possible: number;
};

type GameQuestionRpcRow = {
  id: string;
  question_type: string;
  difficulty?: string | null;
  prompt: string;
  options?: Array<{
    id: string;
    option_key?: string | null;
    option_text: string;
  }>;
};

type GameAnswerRpcResult = {
  attempt_id: string;
  is_correct: boolean;
  points_awarded: number;
  explanation?: string | null;
  source_lesson_id?: number | null;
  source_lesson_title?: string | null;
};

type GameSessionRow = {
  id: string;
  game_definition_id: string;
  student_profile_id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  score: number;
  max_score: number;
  accuracy: number | null;
  xp_earned: number;
};

type StudentProfileRow = {
  id: string;
  tenant_id: string;
  profile_id: string;
  student_code: string;
  display_name: string | null;
  grade_id: number | null;
  is_active: boolean;
};

export type LoadedGameRuntime = {
  context: GameRuntimeContext;
  questions: SafeGameQuestion[];
  sessionQuestionIds: string[];
  sessionId: string;
};

const GAME_DEFINITION_SELECT =
  'id, template_id, scope_type, lesson_id, unit_id, subject_id, course_id, challenge_id, title, settings, is_active, tenant_id, created_at';

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'يجب تسجيل الدخول قبل تشغيل اللعبة.',
    );
  }

  return user.id;
}

async function resolveStudentProfile(
  tenantId: string,
  tenantStudentProfileId: string,
): Promise<StudentProfileRow> {
  const userId =
    await getAuthenticatedUserId();

  const { data, error } =
    await supabase
      .from('tenant_student_profiles')
      .select(
        'id, tenant_id, profile_id, student_code, display_name, grade_id, is_active',
      )
      .eq(
        'id',
        tenantStudentProfileId,
      )
      .eq('tenant_id', tenantId)
      .eq('profile_id', userId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'الطالب المحدد غير متاح لهذا الحساب أو لهذا المركز.',
    );
  }

  return data;
}

async function loadGameDefinition(
  gameId: string,
  tenantId: string,
): Promise<GameDefinition> {
  const { data, error } =
    await supabase
      .from('game_definitions')
      .select(
        GAME_DEFINITION_SELECT,
      )
      .eq('id', gameId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'اللعبة المطلوبة غير متاحة في هذا المركز.',
    );
  }

  return data as GameDefinition;
}

async function loadSessionQuestions(
  sessionId: string,
): Promise<GameSessionQuestionRow[]> {
  const { data, error } =
    await supabase
      .from('game_session_questions')
      .select(
        'id, question_id, sequence_no, points_possible',
      )
      .eq('session_id', sessionId)
      .order('sequence_no', {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (
    (data as GameSessionQuestionRow[] | null) ??
    []
  );
}

async function loadSafeQuestion(
  sessionQuestionId: string,
): Promise<SafeGameQuestion> {
  const { data, error } =
    await supabase.rpc(
      'get_game_question',
      {
        p_session_question_id:
          sessionQuestionId,
      },
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'تعذر تحميل السؤال الآمن من جلسة اللعبة.',
    );
  }

  const row =
    data as GameQuestionRpcRow;

  if (
    !isGameQuestionType(
      row.question_type,
    )
  ) {
    throw new Error(
      `نوع السؤال غير مدعوم في Runtime: ${row.question_type}`,
    );
  }

  const options =
    Array.isArray(row.options)
      ? row.options.map(
          (option) => ({
            id: String(option.id),
            label: option.option_text,
            value:
              option.option_key ??
              undefined,
          }),
        )
      : [];

  return {
    id: String(row.id),

    type: row.question_type,

    prompt: row.prompt,

    options,

    metadata: {
      difficulty:
        row.difficulty ?? null,
    },
  };
}

export async function loadGameRuntime(
  options: {
    gameId: string;
    tenantId: string;
    studentProfileId: string;
    questionCount?: number;
  },
): Promise<LoadedGameRuntime> {
  const {
    gameId,
    tenantId,
    studentProfileId,
    questionCount = 10,
  } = options;

  const student =
    await resolveStudentProfile(
      tenantId,
      studentProfileId,
    );

  const game =
    await loadGameDefinition(
      gameId,
      tenantId,
    );

  const { data: sessionIdData, error } =
    await supabase.rpc(
      'start_game',
      {
        /*
         * IMPORTANT:
         *
         * The route carries
         * tenant_student_profiles.id.
         *
         * start_game expects profiles.id
         * and validates it against auth.uid().
         */
        p_student_profile_id:
          student.profile_id,

        p_game_definition_id:
          game.id,

        p_question_count:
          questionCount,
      },
    );

  if (error) {
    throw error;
  }

  if (
    typeof sessionIdData !==
    'string'
  ) {
    throw new Error(
      'تعذر إنشاء جلسة اللعبة.',
    );
  }

  const sessionId =
    sessionIdData;

  const sessionQuestions =
    await loadSessionQuestions(
      sessionId,
    );

  if (
    sessionQuestions.length === 0
  ) {
    throw new Error(
      'تم إنشاء جلسة اللعبة ولكن لا توجد أسئلة مؤهلة لها.',
    );
  }

  const loadedQuestions =
    await Promise.all(
      sessionQuestions.map(
        (sessionQuestion) =>
          loadSafeQuestion(
            sessionQuestion.id,
          ),
      ),
    );

  const context: GameRuntimeContext =
    {
      tenantId,

      studentProfileId,

      game,
    };

  return {
    context,

    questions:
      loadedQuestions,

    sessionQuestionIds:
      sessionQuestions.map(
        (item) => item.id,
      ),

    sessionId,
  };
}

export async function submitGameAnswer(
  options: {
    tenantId: string;
    tenantStudentProfileId: string;
    sessionId: string;
    sessionQuestionId: string;
    questionId: string;
    answer: unknown;
    responseTimeMs?: number | null;
  },
): Promise<GameAnswerResult> {
  const {
    tenantId,
    tenantStudentProfileId,
    sessionId,
    sessionQuestionId,
    questionId,
    answer,
    responseTimeMs = null,
  } = options;

  const student =
    await resolveStudentProfile(
      tenantId,
      tenantStudentProfileId,
    );

  const { data, error } =
    await supabase.rpc(
      'submit_game_answer',
      {
        p_student_profile_id:
          student.profile_id,

        p_session_id:
          sessionId,

        p_session_question_id:
          sessionQuestionId,

        p_answer: answer,

        p_response_time_ms:
          responseTimeMs,
      },
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'لم تُرجع قاعدة البيانات نتيجة الإجابة.',
    );
  }

  const result =
    data as GameAnswerRpcResult;

  return {
    questionId,

    isCorrect:
      result.is_correct,

    pointsEarned:
      result.points_awarded,

    feedback:
      result.explanation ??
      null,

    explanation:
      result.explanation ??
      null,
  };
}

export async function completeGameSession(
  options: {
    gameId: string;
    sessionId: string;
  },
): Promise<GameRuntimeResult> {
  const {
    gameId,
    sessionId,
  } = options;

  const {
    data: completionData,
    error: completionError,
  } = await supabase.rpc(
    'complete_game',
    {
      p_session_id:
        sessionId,
    },
  );

  if (completionError) {
    throw completionError;
  }

  if (!completionData) {
    throw new Error(
      'تعذر إنهاء جلسة اللعبة.',
    );
  }

  const { data: session, error } =
    await supabase
      .from('game_sessions')
      .select(
        'id, game_definition_id, student_profile_id, started_at, completed_at, status, score, max_score, accuracy, xp_earned',
      )
      .eq('id', sessionId)
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!session) {
    throw new Error(
      'تعذر قراءة النتيجة النهائية لجلسة اللعبة.',
    );
  }

  const typedSession =
    session as GameSessionRow;

  const {
    data: sessionQuestions,
    error: sessionQuestionsError,
  } = await supabase
    .from('game_session_questions')
    .select('id')
    .eq(
      'session_id',
      sessionId,
    );

  if (sessionQuestionsError) {
    throw sessionQuestionsError;
  }

  const sessionQuestionIds =
    (
      sessionQuestions ?? []
    ).map(
      (row) =>
        String(row.id),
    );

  let correctAnswers = 0;

  let incorrectAnswers = 0;

  if (
    sessionQuestionIds.length > 0
  ) {
    const {
      data: attempts,
      error: attemptsError,
    } = await supabase
      .from('question_attempts')
      .select(
        'is_correct',
      )
      .in(
        'session_question_id',
        sessionQuestionIds,
      );

    if (attemptsError) {
      throw attemptsError;
    }

    for (
      const attempt of
        attempts ?? []
    ) {
      if (
        attempt.is_correct
      ) {
        correctAnswers += 1;
      } else {
        incorrectAnswers += 1;
      }
    }
  }

  const startedAt =
    new Date(
      typedSession.started_at,
    ).getTime();

  const completedAt =
    typedSession.completed_at
      ? new Date(
          typedSession.completed_at,
        ).getTime()
      : Date.now();

  const durationSeconds =
    Math.max(
      0,
      Math.round(
        (completedAt -
          startedAt) /
          1000,
      ),
    );

  return {
    sessionId,

    gameId,

    status:
      typedSession.status ===
      'completed'
        ? 'completed'
        : typedSession.status ===
          'abandoned'
          ? 'abandoned'
          : 'expired',

    score:
      typedSession.score,

    maxScore:
      typedSession.max_score,

    correctAnswers,

    incorrectAnswers,

    totalQuestions:
      sessionQuestionIds.length,

    durationSeconds,

    xpEarned:
      typedSession.xp_earned,

    completedAt:
      typedSession.completed_at,
  };
}