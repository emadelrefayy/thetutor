import {
  useReducer,
  type Dispatch,
} from 'react';

import {
  Link,
  useLocation,
  useParams,
} from 'react-router-dom';

import {
  canSelectAnswer,
  canSubmitAnswer,
  createGameAnswerInput,
  createGameRuntimeConfig,
  gameRuntimeReducer,
  getAnswerFeedback,
  getCompletedResult,
  getCurrentQuestion,
  getRuntimeProgress,
  initializeGameRuntime,
} from '../features/games/gameRuntime';

import type {
  GameRuntimeContext,
  GameRuntimeEvent,
  GameRuntimeState,
  SafeGameQuestion,
} from '../features/games/gameTypes';

type GameRuntimeNavigationState = {
  context?: GameRuntimeContext;
  questions?: SafeGameQuestion[];
  sessionId?: string;
};

function readNavigationState(
  value: unknown,
): GameRuntimeNavigationState | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as GameRuntimeNavigationState;
}

function createInitialState(
  navigationState: GameRuntimeNavigationState | null,
): GameRuntimeState {
  const context =
    navigationState?.context ?? null;

  const questions =
    navigationState?.questions ?? [];

  const sessionId =
    navigationState?.sessionId ?? null;

  if (!context) {
    return {
      phase: 'error',
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
      error:
        'بيانات اللعبة غير متاحة.',
      result: null,
    };
  }

  if (!sessionId?.trim()) {
    return {
      phase: 'error',
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
      error:
        'جلسة اللعبة غير متاحة. يجب إنشاء جلسة موثقة قبل تشغيل اللعبة.',
      result: null,
    };
  }

  if (questions.length === 0) {
    return {
      phase: 'error',
      sessionId,
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
      error:
        'لا توجد أسئلة آمنة متاحة لتشغيل اللعبة.',
      result: null,
    };
  }

  try {
    const config =
      createGameRuntimeConfig(
        context.game,
      );

    return initializeGameRuntime({
      config,
      questions,
      sessionId,
    });
  } catch (error) {
    return {
      phase: 'error',
      sessionId,
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
      error:
        error instanceof Error
          ? error.message
          : 'تعذر تهيئة مشغل اللعبة.',
      result: null,
    };
  }
}

function GameRuntimePage() {
  const {
    scope,
    gameId,
  } = useParams<{
    scope: string;
    gameId: string;
  }>();

  const location =
    useLocation();

  const navigationState =
    readNavigationState(
      location.state,
    );

  const [state, dispatch] =
    useReducer<
      (
        currentState: GameRuntimeState,
        event: GameRuntimeEvent,
      ) => GameRuntimeState
    >(
      gameRuntimeReducer,
      navigationState,
      createInitialState,
    );

  if (!scope || !gameId) {
    return (
      <RuntimeError
        title="رابط اللعبة غير صالح"
        message="تعذر تحديد نطاق اللعبة أو رقم اللعبة."
      />
    );
  }

  if (state.phase === 'error') {
    return (
      <RuntimeError
        title="تعذر تشغيل اللعبة"
        message={
          state.error ??
          'حدث خطأ أثناء تشغيل اللعبة.'
        }
      />
    );
  }

  if (
    !state.config ||
    !state.sessionId
  ) {
    return (
      <RuntimeError
        title="بيانات اللعبة غير مكتملة"
        message="بيانات تشغيل اللعبة المطلوبة غير متاحة."
      />
    );
  }

  return (
    <RuntimeGameView
      state={state}
      dispatch={dispatch}
    />
  );
}

function RuntimeError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main
      id="game-runtime-page"
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10"
    >
      <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold text-sky-600">
          TheTutor
        </p>

        <h1 className="mt-2 text-xl font-bold text-red-700">
          {title}
        </h1>

        <p
          role="alert"
          className="mt-3 text-sm leading-7 text-slate-600"
        >
          {message}
        </p>

        <Link
          to="/grades"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          العودة إلى الصفوف الدراسية
        </Link>
      </section>
    </main>
  );
}

function RuntimeGameView({
  state,
  dispatch,
}: {
  state: GameRuntimeState;
  dispatch: Dispatch<GameRuntimeEvent>;
}) {
  const question =
    getCurrentQuestion(state);

  const progress =
    getRuntimeProgress(state);

  if (!question) {
    return (
      <RuntimeError
        title="لا يوجد سؤال حالي"
        message="تعذر تحديد السؤال الحالي داخل جلسة اللعبة."
      />
    );
  }

  if (state.phase === 'completed') {
    return (
      <CompletedGame
        state={state}
      />
    );
  }

  const feedback =
    getAnswerFeedback(
      state.answerResult,
    );

  return (
    <main
      id="game-runtime-page"
      dir="rtl"
      className="min-h-screen bg-slate-50 px-6 py-10"
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-sky-600">
            TheTutor · Game Runtime
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {state.config?.game.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            السؤال {progress.currentQuestion} من{' '}
            {progress.totalQuestions}
          </p>
        </header>

        <section
          aria-label="Game progress"
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-600">
            <span>التقدم</span>

            <span>
              {progress.percentage}%
            </span>
          </div>

          <progress
            value={progress.percentage}
            max={100}
            className="h-3 w-full"
          >
            {progress.percentage}%
          </progress>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt=""
              className="mb-6 max-h-72 w-full rounded-xl object-contain"
            />
          )}

          <h2 className="text-xl font-bold leading-9 text-slate-900">
            {question.prompt}
          </h2>

          {question.audioUrl && (
            <audio
              className="mt-5 w-full"
              controls
              src={question.audioUrl}
            >
              متصفحك لا يدعم تشغيل الصوت.
            </audio>
          )}

          <div
            className="mt-6 grid gap-3"
            role="group"
            aria-label="Question answers"
          >
            {question.options.map(
              (option) => {
                const selected =
                  state.selectedAnswer ===
                  option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={
                      !canSelectAnswer(
                        state,
                      )
                    }
                    onClick={() =>
                      dispatch({
                        type:
                          'SELECT_ANSWER',
                        answer:
                          option.id,
                      })
                    }
                    className={[
                      'rounded-xl border px-5 py-4 text-right text-sm font-semibold transition',
                      selected
                        ? 'border-sky-500 bg-sky-50 text-sky-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300',
                      'disabled:cursor-not-allowed disabled:opacity-60',
                    ].join(' ')}
                  >
                    <span>
                      {option.label}
                    </span>

                    {option.imageUrl && (
                      <img
                        src={
                          option.imageUrl
                        }
                        alt=""
                        className="mt-3 max-h-32 w-full rounded-lg object-contain"
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>

          {state.phase ===
            'playing' && (
            <>
              <button
                type="button"
                disabled={
                  !canSubmitAnswer(
                    state,
                  )
                }
                onClick={() => {
                  if (
                    !canSubmitAnswer(
                      state,
                    )
                  ) {
                    return;
                  }

                  /*
                   * This creates the client submission payload.
                   *
                   * It intentionally does NOT calculate correctness.
                   * The trusted answer layer must return ANSWER_RESULT.
                   */
                  const input =
                    createGameAnswerInput(
                      state,
                    );

                  void input;

                  dispatch({
                    type:
                      'SUBMIT_ANSWER',
                  });
                }}
                className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                تأكيد الإجابة
              </button>

              {!state.selectedAnswer && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  اختر إجابة أولًا.
                </p>
              )}
            </>
          )}

          {state.phase ===
            'answering' && (
            <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-5">
              <p className="font-bold text-sky-900">
                جارٍ التحقق من الإجابة
              </p>

              <p className="mt-2 text-sm leading-7 text-sky-800">
                يتم انتظار النتيجة من طبقة التحقق الموثوقة.
              </p>
            </div>
          )}

          {state.phase ===
            'feedback' &&
            state.answerResult && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p
                className={
                  state.answerResult
                    .isCorrect
                    ? 'font-bold text-emerald-700'
                    : 'font-bold text-red-700'
                }
              >
                {state.answerResult
                  .isCorrect
                  ? 'إجابة صحيحة'
                  : 'إجابة غير صحيحة'}
              </p>

              {feedback && (
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {feedback}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type:
                      'NEXT_QUESTION',
                  })
                }
                className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                السؤال التالي
              </button>
            </div>
          )}
        </section>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <span>
            الصحيحة: {state.correctAnswers}
          </span>

          <span>
            غير الصحيحة:{' '}
            {state.incorrectAnswers}
          </span>

          <span>
            النقاط: {state.score}
          </span>
        </footer>
      </div>
    </main>
  );
}

function CompletedGame({
  state,
}: {
  state: GameRuntimeState;
}) {
  const result =
    getCompletedResult(state);

  return (
    <main
      id="game-runtime-page"
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10"
    >
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-sky-600">
          TheTutor · Game Runtime
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          انتهت اللعبة
        </h1>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            label="النقاط"
            value={result?.score ?? state.score}
          />

          <Stat
            label="إجابات صحيحة"
            value={
              result?.correctAnswers ??
              state.correctAnswers
            }
          />

          <Stat
            label="إجابات غير صحيحة"
            value={
              result?.incorrectAnswers ??
              state.incorrectAnswers
            }
          />
        </div>

        {result && (
          <p className="mt-6 text-sm leading-7 text-slate-500">
            النتيجة النهائية مصدرها طبقة التشغيل الموثوقة.
          </p>
        )}

        <Link
          to="/grades"
          className="mt-7 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          العودة إلى المنهج
        </Link>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default GameRuntimePage;