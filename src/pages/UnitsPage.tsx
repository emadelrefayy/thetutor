import {
  useEffect,
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
  type Unit,
} from '../lib/database';

import {
  loadSubject,
  loadTerm,
  loadUnits,
  loadUnitGame,
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
      units: Unit[];
      unitGames: Record<
        number,
        GameDefinition | null
      >;
      context: NavigationContext;
      subjectTitle: string;
    }
  | {
      status: 'empty';
      message: string;
      context: NavigationContext;
      subjectTitle: string;
    }
  | {
      status: 'error';
      message: string;
    };

function readNavigationContext(
  locationState: unknown,
): NavigationContext | null {
  if (
    typeof locationState !== 'object' ||
    locationState === null
  ) {
    return null;
  }

  const state =
    locationState as Record<
      string,
      unknown
    >;

  if (
    typeof state.tenantId !== 'string' ||
    state.tenantId.length === 0 ||
    typeof state.studentProfileId !== 'string' ||
    state.studentProfileId.length === 0
  ) {
    return null;
  }

  return {
    tenantId: state.tenantId,
    studentProfileId:
      state.studentProfileId,
  };
}

function readQueryContext(
  search: string,
): NavigationContext | null {
  const params =
    new URLSearchParams(search);

  const tenantId =
    params.get('tenantId');

  const studentProfileId =
    params.get('studentProfileId');

  if (
    !tenantId ||
    !studentProfileId
  ) {
    return null;
  }

  return {
    tenantId,
    studentProfileId,
  };
}

function UnitsPage() {
  const {
    gradeId,
    termId,
    subjectId,
  } = useParams<{
    gradeId: string;
    termId: string;
    subjectId: string;
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

  const [
    state,
    setState,
  ] = useState<PageState>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchUnits() {
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
        parsedSubjectId <= 0
      ) {
        setState({
          status: 'error',
          message:
            'Invalid grade, term, or subject.',
        });

        return;
      }

      try {
        setState({
          status: 'loading',
        });

        /*
         * The selected tenant and student profile are
         * carried through router state and query parameters.
         *
         * Query parameters make this curriculum location
         * addressable after a browser refresh.
         */
        const navigationContext =
          readNavigationContext(
            location.state,
          );

        const queryContext =
          readQueryContext(
            location.search,
          );

        const context =
          navigationContext ??
          queryContext;

        if (!context) {
          throw new Error(
            'A tenant and student profile are required to open this subject.',
          );
        }

        /*
         * Never trust the student/tenant pair merely
         * because it came from the URL.
         *
         * Verify that the authenticated account actually
         * owns the selected tenant-scoped student profile.
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
                context.studentProfileId &&
              student.tenant_id ===
                context.tenantId,
          );

        if (!selectedStudent) {
          throw new Error(
            'The selected student profile is not available for this account.',
          );
        }

        /*
         * The student may only access subjects belonging
         * to the grade assigned to the selected profile.
         */
        if (
          selectedStudent.grade_id !==
          parsedGradeId
        ) {
          throw new Error(
            'The selected subject does not belong to the selected student grade.',
          );
        }

        /*
         * Validate the term in the same tenant and verify
         * its parent grade.
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

        /*
         * Validate the subject in the same tenant.
         */
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

        /*
         * Validate the complete parent chain:
         *
         * Grade -> Term -> Subject
         *
         * A numeric subject ID by itself is never enough.
         */
        if (
          subject.term_id !==
          parsedTermId
        ) {
          throw new Error(
            'The selected subject does not belong to the selected term.',
          );
        }

        /*
         * Normalize the URL so the selected curriculum
         * context survives a browser refresh.
         */
        const expectedSearch =
          `?tenantId=${encodeURIComponent(
            context.tenantId,
          )}&studentProfileId=${encodeURIComponent(
            context.studentProfileId,
          )}`;

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
              },
            },
          );

          return;
        }

        /*
         * Load only units belonging to this tenant-scoped
         * subject.
         */
        const units =
          await loadUnits(
            parsedSubjectId,
            context.tenantId,
          );

        if (cancelled) {
          return;
        }

        /*
         * Load the unit-level game definition for every
         * available unit using the same tenant context.
         *
         * This prepares the page for the unit-game entry
         * point without exposing a route that does not yet
         * exist in App.tsx.
         */
        const games =
          await Promise.all(
            units.map(
              async (unit) => ({
                unitId: unit.id,
                game:
                  await loadUnitGame(
                    unit.id,
                    context.tenantId,
                  ),
              }),
            ),
          );

        if (cancelled) {
          return;
        }

        const unitGames =
          Object.fromEntries(
            games.map(
              ({
                unitId,
                game,
              }) => [
                unitId,
                game,
              ],
            ),
          );

        if (units.length === 0) {
          setState({
            status: 'empty',
            message:
              'No units are currently available for this subject.',
            context,
            subjectTitle:
              subject.title,
          });

          return;
        }

        setState({
          status: 'ready',
          units,
          unitGames,
          context,
          subjectTitle:
            subject.title,
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
              : 'Failed to load units.',
        });
      }
    }

    void fetchUnits();

    return () => {
      cancelled = true;
    };
  }, [
    location.pathname,
    location.search,
    location.state,
    navigate,
    parsedGradeId,
    parsedTermId,
    parsedSubjectId,
  ]);

  const subjectsPath =
    `/grades/${parsedGradeId}/terms/${parsedTermId}/subjects`;

  if (state.status === 'loading') {
    return (
      <main
        id="units-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              جاري تحميل الوحدات الدراسية...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main
        id="units-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
          <section className="w-full rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              تعذر تحميل الوحدات الدراسية
            </h1>

            <p
              role="alert"
              className="mt-3 text-sm leading-7 text-slate-600"
            >
              {state.message}
            </p>

            <Link
              to="/grades"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              العودة إلى الصفوف الدراسية
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const {
    units,
    unitGames,
    context,
    subjectTitle,
  } = state;

  if (state.status === 'empty') {
    return (
      <main
        id="units-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <Link
              to={`${subjectsPath}?tenantId=${encodeURIComponent(
                context.tenantId,
              )}&studentProfileId=${encodeURIComponent(
                context.studentProfileId,
              )}`}
              state={{
                tenantId:
                  context.tenantId,
                studentProfileId:
                  context.studentProfileId,
                gradeId:
                  parsedGradeId,
                termId:
                  parsedTermId,
              }}
              className="text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              ← العودة إلى المواد
            </Link>

            <p className="mt-6 text-sm font-semibold text-sky-600">
              TheTutor
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              الوحدات الدراسية
            </h1>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {subjectTitle}
            </p>
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
            <p
              role="status"
              className="text-sm leading-7 text-slate-600"
            >
              {state.message}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      id="units-page"
      dir="rtl"
      className="min-h-screen bg-slate-50 px-6 py-10"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sky-600">
                TheTutor
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                الوحدات الدراسية
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {subjectTitle}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                اختر الوحدة للانتقال إلى الدروس والمحتوى التعليمي المرتبط بها.
              </p>
            </div>

            <Link
              to={`${subjectsPath}?tenantId=${encodeURIComponent(
                context.tenantId,
              )}&studentProfileId=${encodeURIComponent(
                context.studentProfileId,
              )}`}
              state={{
                tenantId:
                  context.tenantId,
                studentProfileId:
                  context.studentProfileId,
                gradeId:
                  parsedGradeId,
                termId:
                  parsedTermId,
              }}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              العودة إلى المواد
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="units-heading"
          className="space-y-5"
        >
          <h2
            id="units-heading"
            className="sr-only"
          >
            الوحدات الدراسية المتاحة
          </h2>

          {units.map(
            (unit) => {
              const game =
                unitGames[unit.id];

              const lessonsPath =
                `/grades/${parsedGradeId}` +
                `/terms/${parsedTermId}` +
                `/subjects/${parsedSubjectId}` +
                `/units/${unit.id}/lessons`;

              return (
                <article
                  key={`${context.tenantId}:${unit.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                          {unit.unit_number}
                        </span>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            الوحدة
                          </p>

                          <h2 className="mt-1 text-xl font-bold text-slate-900">
                            {unit.title}
                          </h2>
                        </div>
                      </div>

                      {unit.description && (
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    <nav
                      aria-label={`${unit.title} actions`}
                      className="flex shrink-0 flex-col gap-3 sm:flex-row"
                    >
                      <Link
                        to={`${lessonsPath}?tenantId=${encodeURIComponent(
                          context.tenantId,
                        )}&studentProfileId=${encodeURIComponent(
                          context.studentProfileId,
                        )}`}
                        state={{
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
                            unit.id,
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                      >
                        عرض الدروس
                      </Link>

                      {game?.is_active && (
                        <span
                          title="سيتم تفعيل تشغيل اللعبة عند إضافة Game Runtime إلى التطبيق."
                          className="inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
                        >
                          لعبة الوحدة قريبًا
                        </span>
                      )}
                    </nav>
                  </div>
                </article>
              );
            },
          )}
        </section>
      </div>
    </main>
  );
}

export default UnitsPage;