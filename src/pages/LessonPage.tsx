import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  getCurrentStudentProfiles,
  type GameDefinition,
  type Lesson,
  type LessonAsset,
  type LessonContentBlock,
  type LessonProgress,
} from '../lib/database';

import {
  loadLessonDetails,
  loadLessons,
  loadSubject,
  loadTerm,
} from '../lib/curriculum';

type NavigationContext = {
  tenantId: string;
  studentProfileId: string;
};

type PageState =
  | {
      status: 'loading';
    }
  | {
      status: 'ready';
      lessons: Lesson[];
      lesson: Lesson;
      assets: LessonAsset[];
      contentBlocks: LessonContentBlock[];
      progress: LessonProgress | null;
      game: GameDefinition | null;
      context: NavigationContext;
    }
  | {
      status: 'list';
      lessons: Lesson[];
      context: NavigationContext;
    }
  | {
      status: 'error';
      message: string;
    };

function getYouTubeEmbedUrl(
  url: string,
): string | null {
  try {
    const parsed = new URL(url);
    const hostname =
      parsed.hostname.toLowerCase();

    if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com'
    ) {
      const videoId =
        parsed.searchParams.get('v');

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (
      hostname === 'youtu.be' ||
      hostname === 'www.youtu.be'
    ) {
      const videoId = parsed.pathname
        .replace(/^\/+/, '')
        .split('/')[0]
        .trim();

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (
      hostname === 'youtube-nocookie.com' ||
      hostname ===
        'www.youtube-nocookie.com'
    ) {
      return parsed.href;
    }

    return null;
  } catch {
    return null;
  }
}

function getAssetUrl(
  asset: LessonAsset,
): string | null {
  const url = asset.url.trim();

  if (url) {
    return url;
  }

  const storagePath =
    asset.storage_path?.trim();

  if (storagePath) {
    return storagePath;
  }

  return null;
}

function getString(
  value: unknown,
): string | null {
  return typeof value === 'string'
    ? value
    : null;
}

function getContentText(
  content: Record<string, unknown>,
): string | null {
  const candidates = [
    content.text,
    content.content,
    content.body,
    content.description,
    content.value,
  ];

  for (const candidate of candidates) {
    const text = getString(candidate);

    if (text?.trim()) {
      return text;
    }
  }

  return null;
}

function getContentTitle(
  content: Record<string, unknown>,
): string | null {
  const candidates = [
    content.title,
    content.heading,
    content.label,
  ];

  for (const candidate of candidates) {
    const text = getString(candidate);

    if (text?.trim()) {
      return text;
    }
  }

  return null;
}

function getContentUrl(
  content: Record<string, unknown>,
): string | null {
  const candidates = [
    content.url,
    content.media_url,
    content.image_url,
    content.video_url,
    content.href,
  ];

  for (const candidate of candidates) {
    const url = getString(candidate);

    if (url?.trim()) {
      return url;
    }
  }

  return null;
}

function ContentBlock({
  block,
}: {
  block: LessonContentBlock;
}) {
  const title = getContentTitle(
    block.content,
  );

  const text = getContentText(
    block.content,
  );

  const url = getContentUrl(
    block.content,
  );

  switch (block.block_type) {
    case 'heading':
      return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {title || text ? (
            <h3 className="text-xl font-bold text-slate-900">
              {title ?? text}
            </h3>
          ) : null}
        </article>
      );

    case 'image':
    case 'infographic':
      return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {title && (
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {title}
            </h3>
          )}

          {url ? (
            <img
              src={url}
              alt={
                title ??
                'Lesson visual'
              }
              loading="lazy"
              className="h-auto w-full rounded-xl object-contain"
            />
          ) : text ? (
            <p className="text-sm leading-7 text-slate-600">
              {text}
            </p>
          ) : null}
        </article>
      );

    case 'video': {
      const embedUrl = url
        ? getYouTubeEmbedUrl(url)
        : null;

      return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {title && (
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {title}
            </h3>
          )}

          {embedUrl ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-slate-100">
              <iframe
                src={embedUrl}
                title={
                  title ??
                  'Lesson video'
                }
                loading="lazy"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-sky-700 hover:text-sky-800"
            >
              Open video
            </a>
          ) : text ? (
            <p className="text-sm leading-7 text-slate-600">
              {text}
            </p>
          ) : null}
        </article>
      );
    }

    case 'example':
    case 'tip':
    case 'warning':
    case 'vocabulary':
    case 'activity':
    case 'quiz':
    case 'game':
    case 'text':
    case 'embed':
    default:
      return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {title && (
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              {title}
            </h3>
          )}

          {text && (
            <p className="whitespace-pre-wrap text-sm leading-8 text-slate-700">
              {text}
            </p>
          )}

          {!text &&
            !title &&
            Object.keys(
              block.content,
            ).length > 0 && (
              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {JSON.stringify(
                  block.content,
                  null,
                  2,
                )}
              </pre>
            )}

          {url &&
            block.block_type ===
              'embed' && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex font-semibold text-sky-700 hover:text-sky-800"
              >
                Open resource
              </a>
            )}
        </article>
      );
  }
}

function ProgressSummary({
  progress,
}: {
  progress: LessonProgress | null;
}) {
  if (!progress) {
    return (
      <section
        aria-labelledby="progress-title"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2
          id="progress-title"
          className="text-lg font-bold text-slate-900"
        >
          Progress
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          This lesson has not been
          started yet.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="progress-title"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="progress-title"
          className="text-lg font-bold text-slate-900"
        >
          Progress
        </h2>

        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
          {progress.status}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">
            Completion
          </span>

          <span className="font-bold text-slate-900">
            {progress.completion_percent}%
          </span>
        </div>

        <progress
          value={
            progress.completion_percent
          }
          max={100}
          className="h-3 w-full"
        >
          {progress.completion_percent}%
        </progress>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Time spent:{' '}
        <strong className="text-slate-900">
          {Math.floor(
            progress.time_spent_seconds /
              60,
          )}{' '}
          minutes
        </strong>
      </p>
    </section>
  );
}

function buildContextSearch(
  context: NavigationContext,
): string {
  const params =
    new URLSearchParams();

  params.set(
    'tenantId',
    context.tenantId,
  );

  params.set(
    'studentProfileId',
    context.studentProfileId,
  );

  return `?${params.toString()}`;
}

function LessonGame({
  lesson,
  game,
  context,
}: {
  lesson: Lesson;
  game: GameDefinition | null;
  context: NavigationContext;
}) {
  const gameUrl =
    lesson.game_url?.trim() ??
    '';

  const fallbackGameUrl = game
    ? `/games/lesson/${game.id}${buildContextSearch(
        context,
      )}`
    : null;

  const resolvedGameUrl =
    gameUrl || fallbackGameUrl;

  if (!resolvedGameUrl) {
    return null;
  }

  const isInternalRoute =
    resolvedGameUrl.startsWith('/');

  return (
    <section
      aria-labelledby="game-title"
      className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
            Interactive practice
          </p>

          <h2
            id="game-title"
            className="mt-1 text-xl font-bold text-slate-900"
          >
            Lesson game
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            Practice what you learned
            in this lesson.
          </p>
        </div>

        {isInternalRoute ? (
          <Link
            to={resolvedGameUrl}
            className="inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Play lesson game
          </Link>
        ) : (
          <a
            href={resolvedGameUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Play lesson game
          </a>
        )}
      </div>
    </section>
  );
}

function LessonPage() {
  const {
    gradeId,
    termId,
    subjectId,
    unitId,
    lessonId,
  } = useParams<{
    gradeId: string;
    termId: string;
    subjectId: string;
    unitId: string;
    lessonId?: string;
  }>();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const parsedGradeId =
    Number(gradeId);

  const parsedTermId =
    Number(termId);

  const parsedSubjectId =
    Number(subjectId);

  const parsedUnitId =
    Number(unitId);

  const parsedLessonId =
    lessonId
      ? Number(lessonId)
      : null;

  const [state, setState] =
    useState<PageState>({
      status: 'loading',
    });

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      if (
        !Number.isInteger(
          parsedGradeId,
        ) ||
        parsedGradeId <= 0 ||
        !Number.isInteger(
          parsedTermId,
        ) ||
        parsedTermId <= 0 ||
        !Number.isInteger(
          parsedSubjectId,
        ) ||
        parsedSubjectId <= 0 ||
        !Number.isInteger(
          parsedUnitId,
        ) ||
        parsedUnitId <= 0
      ) {
        setState({
          status: 'error',
          message:
            'Invalid curriculum path.',
        });

        return;
      }

      try {
        setState({
          status: 'loading',
        });

        /*
         * The tenant and student profile are
         * carried from UnitsPage through the
         * addressable query string.
         */
        const params =
          new URLSearchParams(
            location.search,
          );

        const tenantId =
          params.get('tenantId');

        const studentProfileId =
          params.get(
            'studentProfileId',
          );

        /*
         * Never infer a tenant when more than
         * one tenant-scoped student profile
         * exists.
         *
         * We only auto-resolve the context when
         * the authenticated student has exactly
         * one active student profile.
         */
        let context:
          | NavigationContext
          | null = null;

        if (
          tenantId &&
          studentProfileId
        ) {
          context = {
            tenantId,
            studentProfileId,
          };
        } else {
          const studentProfiles =
            await getCurrentStudentProfiles();

          if (cancelled) {
            return;
          }

          if (
            studentProfiles.length ===
            1
          ) {
            context = {
              tenantId:
                studentProfiles[0]
                  .tenant_id,
              studentProfileId:
                studentProfiles[0].id,
            };
          } else if (
            studentProfiles.length ===
            0
          ) {
            throw new Error(
              'No active student profile is available for this account.',
            );
          } else {
            throw new Error(
              'Multiple tenant student profiles are available. A tenantId and studentProfileId are required.',
            );
          }
        }

        /*
         * Verify the selected student profile
         * against the authenticated account.
         *
         * URL parameters are never trusted as
         * authorization.
         */
        const studentProfiles =
          await getCurrentStudentProfiles();

        if (cancelled) {
          return;
        }

        const selectedStudent =
          studentProfiles.find(
            (student) =>
              student.id ===
                context!.studentProfileId &&
              student.tenant_id ===
                context!.tenantId,
          );

        if (!selectedStudent) {
          throw new Error(
            'The selected student profile is not available for this account.',
          );
        }

        /*
         * The student can only open curriculum
         * belonging to the student's assigned
         * grade.
         */
        if (
          selectedStudent.grade_id !==
          parsedGradeId
        ) {
          throw new Error(
            'The selected lesson does not belong to the selected student grade.',
          );
        }

        /*
         * Validate the complete tenant-scoped
         * parent chain:
         *
         * Grade -> Term -> Subject -> Unit
         *
         * Numeric IDs are never sufficient by
         * themselves.
         */
        const term =
          await loadTerm(
            parsedTermId,
            context.tenantId,
          );

        if (cancelled) {
          return;
        }

        if (!term) {
          throw new Error(
            'The selected term was not found in the selected tenant.',
          );
        }

        if (
          term.grade_id !==
          parsedGradeId
        ) {
          throw new Error(
            'The selected term does not belong to the selected grade.',
          );
        }

        const subject =
          await loadSubject(
            parsedSubjectId,
            context.tenantId,
          );

        if (cancelled) {
          return;
        }

        if (!subject) {
          throw new Error(
            'The selected subject was not found in the selected tenant.',
          );
        }

        if (
          subject.term_id !==
          parsedTermId
        ) {
          throw new Error(
            'The selected subject does not belong to the selected term.',
          );
        }

        /*
         * Load lessons from the same tenant.
         */
        const lessonList =
          await loadLessons(
            parsedUnitId,
            context.tenantId,
          );

        if (cancelled) {
          return;
        }

        /*
         * If this is the lesson-list route,
         * normalize the URL so the context
         * survives browser refresh.
         */
        const expectedSearch =
          buildContextSearch(
            context,
          );

        if (
          location.search !==
          expectedSearch
        ) {
          navigate(
            {
              pathname:
                location.pathname,
              search:
                expectedSearch,
            },
            {
              replace: true,
              state: {
                tenantId:
                  context.tenantId,
                studentProfileId:
                  context.studentProfileId,
                gradeId:
                  parsedGradeId,
                termId:
                  parsedTermId,
                subjectId:
                  parsedSubjectId,
                unitId:
                  parsedUnitId,
              },
            },
          );

          return;
        }

        if (
          parsedLessonId === null
        ) {
          setState({
            status: 'list',
            lessons:
              lessonList,
            context,
          });

          return;
        }

        if (
          !Number.isInteger(
            parsedLessonId,
          ) ||
          parsedLessonId <= 0
        ) {
          throw new Error(
            'Invalid lesson.',
          );
        }

        /*
         * Load every lesson detail through the
         * same tenant + student context.
         *
         * This is critical because progress
         * belongs to a specific student profile.
         */
        const details =
          await loadLessonDetails(
            parsedLessonId,
            {
              tenantId:
                context.tenantId,
              studentProfileId:
                context.studentProfileId,
            },
          );

        if (cancelled) {
          return;
        }

        /*
         * Prevent opening a lesson outside
         * the current unit.
         */
        if (
          details.lesson.unit_id !==
          parsedUnitId
        ) {
          throw new Error(
            'The selected lesson does not belong to this unit.',
          );
        }

        /*
         * Defensive subject validation.
         */
        if (
          details.lesson.subject_id !==
          parsedSubjectId
        ) {
          throw new Error(
            'The selected lesson does not belong to this subject.',
          );
        }

        setState({
          status: 'ready',
          lessons:
            lessonList,
          lesson:
            details.lesson,
          assets:
            details.assets,
          contentBlocks:
            details.contentBlocks,
          progress:
            details.progress,
          game:
            details.game,
          context,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to load lesson.',
        });
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [
    location.pathname,
    location.search,
    navigate,
    parsedGradeId,
    parsedTermId,
    parsedSubjectId,
    parsedUnitId,
    parsedLessonId,
  ]);

  const unitPath =
    `/grades/${parsedGradeId}` +
    `/terms/${parsedTermId}` +
    `/subjects/${parsedSubjectId}` +
    `/units/${parsedUnitId}`;

  const lessonPath = (
    id: number,
    context: NavigationContext,
  ) =>
    `${unitPath}/lessons/${id}${buildContextSearch(
      context,
    )}`;

  const orderedContentBlocks =
    useMemo(() => {
      if (
        state.status !==
        'ready'
      ) {
        return [];
      }

      return [
        ...state.contentBlocks,
      ].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order,
      );
    }, [state]);

  const orderedAssets =
    useMemo(() => {
      if (
        state.status !==
        'ready'
      ) {
        return [];
      }

      return [...state.assets].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order,
      );
    }, [state]);

  if (state.status === 'loading') {
    return (
      <main
        id="lesson-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              جاري تحميل الدرس...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main
        id="lesson-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
          <section className="w-full rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              تعذر تحميل الدرس
            </h1>

            <p
              role="alert"
              className="mt-3 text-sm leading-7 text-slate-600"
            >
              {state.message}
            </p>

            <Link
              to={`${unitPath}${location.search}`}
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              العودة إلى الوحدة
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (state.status === 'list') {
    return (
      <main
        id="lesson-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <Link
              to={`${unitPath}${buildContextSearch(
                state.context,
              )}`}
              className="text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              ← العودة إلى الوحدة
            </Link>

            <p className="mt-6 text-sm font-semibold text-sky-600">
              TheTutor
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Lessons
            </h1>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              اختر درسًا لعرض المحتوى
              والتقدم واللعبة الخاصة به.
            </p>
          </header>

          {state.lessons.length ===
          0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <p
                role="status"
                className="text-sm leading-7 text-slate-600"
              >
                No lessons are
                currently available
                for this unit.
              </p>
            </section>
          ) : (
            <ol className="space-y-4">
              {state.lessons.map(
                (item) => (
                  <li
                    key={`${state.context.tenantId}:${item.id}`}
                  >
                    <Link
                      to={lessonPath(
                        item.id,
                        state.context,
                      )}
                      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-sky-600">
                            Lesson{' '}
                            {
                              item.lesson_number
                            }
                          </p>

                          <h2 className="mt-1 text-lg font-bold text-slate-900">
                            {item.title}
                          </h2>
                        </div>

                        <span className="text-sm font-semibold text-sky-700">
                          Open lesson →
                        </span>
                      </div>

                      {item.content_summary && (
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {
                            item.content_summary
                          }
                        </p>
                      )}
                    </Link>
                  </li>
                ),
              )}
            </ol>
          )}
        </div>
      </main>
    );
  }

  const {
    lessons,
    lesson, 
    progress,
    game,
    context,
  } = state;

  const currentLessonIndex =
    lessons.findIndex(
      (item) =>
        item.id === lesson.id,
    );

  const previousLesson =
    currentLessonIndex > 0
      ? lessons[
          currentLessonIndex - 1
        ]
      : null;

  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex <
      lessons.length - 1
      ? lessons[
          currentLessonIndex + 1
        ]
      : null;

  const videoEmbedUrl =
    lesson.video_url
      ? getYouTubeEmbedUrl(
          lesson.video_url,
        )
      : null;

  return (
    <main
      id="lesson-page"
      dir="rtl"
      className="min-h-screen bg-slate-50 px-6 py-10"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <Link
            to={`${unitPath}${buildContextSearch(
              context,
            )}`}
            className="text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            ← العودة إلى الوحدة
          </Link>

          <p className="mt-6 text-sm font-semibold text-sky-600">
            TheTutor
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Lesson{' '}
            {lesson.lesson_number}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {lesson.title}
          </h1>

          {lesson.content_summary && (
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
              {
                lesson.content_summary
              }
            </p>
          )}
        </header>

        <div className="space-y-6">
          <ProgressSummary
            progress={progress}
          />

          {videoEmbedUrl && (
            <section
              aria-labelledby="video-title"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2
                id="video-title"
                className="mb-4 text-xl font-bold text-slate-900"
              >
                Lesson video
              </h2>

              <div className="aspect-video overflow-hidden rounded-xl bg-slate-100">
                <iframe
                  src={videoEmbedUrl}
                  title={`Video for ${lesson.title}`}
                  loading="lazy"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {lesson.video_url && (
                <p className="mt-4">
                  <a
                    href={
                      lesson.video_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                  >
                    Open video on
                    YouTube
                  </a>
                </p>
              )}
            </section>
          )}

          {!videoEmbedUrl &&
            lesson.video_url && (
              <section
                aria-labelledby="video-link-title"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2
                  id="video-link-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Lesson video
                </h2>

                <a
                  href={
                    lesson.video_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
                >
                  Watch lesson
                  video
                </a>
              </section>
            )}

          {lesson.infographic_url && (
            <section
              aria-labelledby="infographic-title"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2
                id="infographic-title"
                className="mb-4 text-xl font-bold text-slate-900"
              >
                Lesson infographic
              </h2>

              <img
                src={
                  lesson.infographic_url
                }
                alt={`Infographic for ${lesson.title}`}
                loading="lazy"
                className="h-auto w-full rounded-xl object-contain"
              />
            </section>
          )}

          {orderedContentBlocks.length >
            0 && (
            <section
              aria-labelledby="content-title"
            >
              <h2
                id="content-title"
                className="mb-4 text-xl font-bold text-slate-900"
              >
                Lesson content
              </h2>

              <div className="space-y-4">
                {orderedContentBlocks.map(
                  (block) => (
                    <ContentBlock
                      key={block.id}
                      block={block}
                    />
                  ),
                )}
              </div>
            </section>
          )}

          {orderedAssets.length >
            0 && (
            <section
              aria-labelledby="resources-title"
            >
              <h2
                id="resources-title"
                className="mb-4 text-xl font-bold text-slate-900"
              >
                Lesson resources
              </h2>

              <ul className="space-y-4">
                {orderedAssets.map(
                  (asset) => {
                    const url =
                      getAssetUrl(
                        asset,
                      );

                    if (!url) {
                      return (
                        <li
                          key={asset.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {asset.title ??
                              asset.asset_type}
                          </span>
                        </li>
                      );
                    }

                    if (
                      asset.asset_type ===
                        'image' ||
                      asset.asset_type ===
                        'infographic'
                    ) {
                      return (
                        <li
                          key={asset.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <figure>
                            <img
                              src={url}
                              alt={
                                asset.alt_text ??
                                asset.title ??
                                asset.asset_type
                              }
                              loading="lazy"
                              className="h-auto w-full rounded-xl object-contain"
                            />

                            {asset.title && (
                              <figcaption className="mt-3 text-sm font-semibold text-slate-700">
                                {
                                  asset.title
                                }
                              </figcaption>
                            )}
                          </figure>
                        </li>
                      );
                    }

                    return (
                      <li
                        key={asset.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-sky-700 hover:text-sky-800"
                        >
                          {asset.title ??
                            `Open ${asset.asset_type}`}
                        </a>
                      </li>
                    );
                  },
                )}
              </ul>
            </section>
          )}

          <LessonGame
            lesson={lesson}
            game={game}
            context={context}
          />

          <nav
            aria-label="Lesson navigation"
            className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6"
          >
            {previousLesson ? (
              <Link
                to={lessonPath(
                  previousLesson.id,
                  context,
                )}
                className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                ← Previous
                lesson
              </Link>
            ) : (
              <span />
            )}

            {nextLesson ? (
              <Link
                to={lessonPath(
                  nextLesson.id,
                  context,
                )}
                className="inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                Next lesson
                →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>
    </main>
  );
}

export default LessonPage;