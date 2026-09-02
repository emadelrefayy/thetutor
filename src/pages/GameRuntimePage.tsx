import {
  useEffect,
  useReducer,
  useRef,
  useState,
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
  isLastQuestion,
} from '../features/games/gameRuntime';

import {
  completeGameSession,
  loadGameRuntime,
  submitGameAnswer,
} from '../features/games/gameApi';

import type {
  GameRuntimeEvent,
  GameRuntimeState,
} from '../features/games/gameTypes';

function createLoadingState(): GameRuntimeState {
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

function GameRuntimePage() {
  const {
    scope,
    gameId,
  } = useParams<{
    scope: string;
    gameId: string;
  }>();

  const location = useLocation();

  const searchParams = new URLSearchParams(
    location.search,
  );

  const tenantId =
    searchParams.get('tenantId')?.trim() ?? '';

  const studentProfileId =
    searchParams
      .get('studentProfileId')
      ?.trim() ?? '';

  const [state, dispatch] =
    useReducer<
      (
        currentState: GameRuntimeState,
        event: GameRuntimeEvent,
      ) => GameRuntimeState
    >(
      gameRuntimeReducer,
      undefined,
      createLoadingState,
    );

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadedKeyRef =
    useRef<string | null>(null);

  useEffect(() => {
    if (!scope || !gameId) {
      setLoadError(
        'تعذر تحديد نطاق اللعبة أو رقم اللعبة.',
      );
      return;
    }

    if (!tenantId || !studentProfileId) {
      setLoadError(
        'بيانات المركز والطالب غير متاحة لتشغيل اللعبة.',
      );
      return;
    }

    const loadKey =
      [
        scope,
        gameId,
        tenantId,
        studentProfileId,
      ].join(':');

    /*
     * Prevent duplicate game-session creation during
     * React Strict Mode development re-renders.
     *
     * loadGameRuntime creates a real backend session,
     * therefore it must not be invoked twice for the
     * same route/context during one mounted lifecycle.
     */
    if (
      loadedKeyRef.current ===
      loadKey
    ) {
      return;
    }

    loadedKeyRef.current =
      loadKey;

    let cancelled = false;

    setLoadError(null);

    const load = async () => {
      try {
        const loaded =
          await loadGameRuntime({
            gameId,
            tenantId,
            studentProfileId,
          });

        if (cancelled) {
          return;
        }

        /*
         * The backend/API layer has already:
         *
         * - authenticated the user
         * - validated the tenant/student context
         * - loaded the active game definition
         * - created the trusted game session
         * - selected eligible questions
         * - loaded safe question data
         * - aligned sessionQuestionIds with questions
         */
        const config =
          createGameRuntimeConfig(
            loaded.context.game,
          );

        const initialized =
          initializeGameRuntime({
            config,
            questions:
              loaded.questions,
            sessionId:
              loaded.sessionId,
          });

        /*
         * gameRuntimeReducer owns the transition from
         * ready -> playing.
         *
         * We intentionally do not manufacture score,
         * correctness, XP, or eligibility here.
         */
        const readyState =
          initialized;

        const playingState =
          gameRuntimeReducer(
            readyState,
            {
              type: 'START',
            },
          );

        /*
         * The reducer itself does not contain an event
         * for replacing the asynchronously loaded state.
         *
         * This dispatch is therefore represented through
         * the page-level loaded state below.
         */
        setRuntimeState(
          playingState,
        );

        setRuntimeSessionQuestionIds(
          loaded.sessionQuestionIds,
        );

        setRuntimeContext({
          tenantId:
            loaded.context.tenantId,
          studentProfileId:
            loaded.context.studentProfileId,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : 'تعذر تحميل اللعبة.',
        );
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    gameId,
    scope,
    studentProfileId,
    tenantId,
  ]);

  /*
   * The actual runtime state is kept separately because
   * the backend load is asynchronous while useReducer's
   * initializer runs synchronously.
   */
  const [runtimeState, setRuntimeState] =
    useState<GameRuntimeState>(
      createLoadingState,
    );

  const [
    runtimeSessionQuestionIds,
    setRuntimeSessionQuestionIds,
  ] = useState<string[]>([]);

  const [runtimeContext, setRuntimeContext] =
    useState<{
      tenantId: string;
      studentProfileId: string;
    } | null>(null);

  const runtimeDispatch =
    (
      event: GameRuntimeEvent,
    ) => {
      setRuntimeState(
        (currentState) =>
          gameRuntimeReducer(
            currentState,
            event,
          ),
      );
    };

  /*
   * Keep the reducer state above and the asynchronous
   * loading lifecycle in one rendering path.
   */
  const effectiveState =
    runtimeState;

  if (!scope || !gameId) {
    return (
      <RuntimeError
        title="رابط اللعبة غير صالح"
        message="تعذر تحديد نطاق اللعبة أو رقم اللعبة."
      />
    );
  }

  if (!tenantId || !studentProfileId) {
    return (
      <RuntimeError
        title="بيانات التشغيل غير مكتملة"
        message="بيانات المركز والطالب غير متاحة لتشغيل اللعبة."
      />
    );
  }

  if (
    effectiveState.phase ===
    'loading'
  ) {
    if (loadError) {
      return (
        <RuntimeError
          title="تعذر تشغيل اللعبة"
          message={loadError}
        />
      );
    }

    return (
      <RuntimeLoading />
    );
  }

  if (
    effectiveState.phase ===
    'error'
  ) {
    return (
      <RuntimeError
        title="تعذر تشغيل اللعبة"
        message={
          effectiveState.error ??
          loadError ??
          'حدث خطأ أثناء تشغيل اللعبة.'
        }
      />
    );
  }

  if (
    !effectiveState.config ||
    !effectiveState.sessionId ||
    !runtimeContext
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
      state={effectiveState}
      dispatch={runtimeDispatch}
      sessionQuestionIds={
        runtimeSessionQuestionIds
      }
      tenantId={
        runtimeContext.tenantId
      }
      studentProfileId={
        runtimeContext.studentProfileId
      }
      gameId={gameId}
    />
  );
}

function RuntimeLoading() {
  return (
    <main
      id="game-runtime-page"
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10"
    >
      <section
        aria-live="polite"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <p className="text-sm font-semibold text-sky-600">
          TheTutor · Game Runtime
        </p>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          جاري تجهيز اللعبة
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          يتم تحميل جلسة اللعبة والأسئلة المؤهلة بأمان.
        </p>

        <div
          className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100"
          aria-hidden="true"
        >
          <div className="h-full w-1/2 animate-pulse rounded-full bg-sky-500" />
        </div>
      </section>
    </main>
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
  sessionQuestionIds,
  tenantId,
  studentProfileId,
  gameId,
}: {
  state: GameRuntimeState;
  dispatch: Dispatch<GameRuntimeEvent>;
  sessionQuestionIds: string[];
  tenantId: string;
  studentProfileId: string;
  gameId: string;
}) {
  const question =
    getCurrentQuestion(state);

  const progress =
    getRuntimeProgress(state);

  const questionStartedAtRef =
    useRef<number>(Date.now());

  const previousQuestionIndexRef =
    useRef<number>(
      state.currentQuestionIndex,
    );

  const submittingRef =
    useRef(false);

  const completingRef =
    useRef(false);

  useEffect(() => {
    if (
      previousQuestionIndexRef.current !==
      state.currentQuestionIndex
    ) {
      previousQuestionIndexRef.current =
        state.currentQuestionIndex;

      questionStartedAtRef.current =
        Date.now();
    }
  }, [
    state.currentQuestionIndex,
  ]);

  if (
    state.phase ===
    'completed'
  ) {
    return (
      <CompletedGame
        state={state}
        tenantId={tenantId}
        studentProfileId={
          studentProfileId
        }
        gameId={gameId}
      />
    );
  }

  if (!question) {
    return (
      <RuntimeError
        title="لا يوجد سؤال حالي"
        message="تعذر تحديد السؤال الحالي داخل جلسة اللعبة."
      />
    );
  }

  const feedback =
    getAnswerFeedback(
      state.answerResult,
    );

  const handleSubmitAnswer =
    async () => {
      if (
        submittingRef.current ||
        !canSubmitAnswer(state)
      ) {
        return;
      }

      const sessionQuestionId =
        sessionQuestionIds[
          state.currentQuestionIndex
        ];

      if (
        !sessionQuestionId
      ) {
        dispatch({
          type: 'ERROR',
          message:
            'تعذر مطابقة السؤال الحالي مع جلسة اللعبة.',
        });

        return;
      }

      let input;

      try {
        input =
          createGameAnswerInput(
            state,
          );
      } catch (error) {
        dispatch({
          type: 'ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'تعذر تجهيز الإجابة.',
        });

        return;
      }

      const responseTimeMs =
        Math.max(
          0,
          Date.now() -
            questionStartedAtRef.current,
        );

      submittingRef.current =
        true;

      dispatch({
        type: 'SUBMIT_ANSWER',
      });

      try {
        const result =
          await submitGameAnswer({
            tenantId,
            tenantStudentProfileId:
              studentProfileId,
            sessionId:
              state.sessionId!,
            sessionQuestionId,
            questionId:
              input.questionId,
            answer:
              input.answer,
            responseTimeMs,
          });

        dispatch({
          type: 'ANSWER_RESULT',
          result,
        });
      } catch (error) {
        dispatch({
          type: 'ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'تعذر إرسال الإجابة.',
        });
      } finally {
        submittingRef.current =
          false;
      }
    };

  const handleNextQuestion =
    async () => {
      if (
        state.phase !==
        'feedback'
      ) {
        return;
      }

      if (
        !isLastQuestion(state)
      ) {
        dispatch({
          type: 'NEXT_QUESTION',
        });

        return;
      }

      if (
        completingRef.current
      ) {
        return;
      }

      if (!state.sessionId) {
        dispatch({
          type: 'ERROR',
          message:
            'جلسة اللعبة غير متاحة لإنهاء اللعبة.',
        });

        return;
      }

      completingRef.current =
        true;

      try {
        const result =
          await completeGameSession({
            gameId,
            sessionId:
              state.sessionId,
          });

        dispatch({
          type: 'COMPLETE',
          result,
        });
      } catch (error) {
        dispatch({
          type: 'ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'تعذر إنهاء جلسة اللعبة.',
        });
      } finally {
        completingRef.current =
          false;
      }
    };

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
            {state.config.game.title}
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
            value={
              progress.percentage
            }
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
                  ) ||
                  submittingRef.current
                }
                onClick={() => {
                  void handleSubmitAnswer();
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
            <div
              className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-5"
              aria-live="polite"
            >
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
                onClick={() => {
                  void handleNextQuestion();
                }}
                disabled={
                  completingRef.current
                }
                className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLastQuestion(state)
                  ? 'إنهاء اللعبة'
                  : 'السؤال التالي'}
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
  tenantId,
  studentProfileId,
  gameId,
}: {
  state: GameRuntimeState;
  tenantId: string;
  studentProfileId: string;
  gameId: string;
}) {
  const result =
    getCompletedResult(state);

  const returnTo =
    `/grades?tenantId=${encodeURIComponent(
      tenantId,
    )}&studentProfileId=${encodeURIComponent(
      studentProfileId,
    )}&gameId=${encodeURIComponent(
      gameId,
    )}`;

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
            value={
              result?.score ??
              state.score
            }
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
          <div className="mt-6 space-y-2 text-sm leading-7 text-slate-500">
            <p>
              النتيجة النهائية مصدرها طبقة التشغيل الموثوقة.
            </p>

            <p>
              نقاط الخبرة المكتسبة:{' '}
              <span className="font-bold text-slate-700">
                {result.xpEarned}
              </span>
            </p>

            <p>
              إجمالي الأسئلة:{' '}
              <span className="font-bold text-slate-700">
                {result.totalQuestions}
              </span>
            </p>

            <p>
              مدة اللعبة:{' '}
              <span className="font-bold text-slate-700">
                {result.durationSeconds}
              </span>{' '}
              ثانية
            </p>
          </div>
        )}

        <Link
          to={returnTo}
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