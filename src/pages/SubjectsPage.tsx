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
  type Subject,
} from '../lib/database';

import {
  loadSubjectGame,
  loadSubjects,
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
      subjects: Subject[];
      context: NavigationContext;
      termTitle: string;
    }
  | {
      status: 'empty';
      message: string;
      context: NavigationContext;
      termTitle: string;
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

function SubjectsPage() {
  const {
    gradeId,
    termId,
  } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const parsedGradeId =
    Number(gradeId);

  const parsedTermId =
    Number(termId);

  const [
    state,
    setState,
  ] = useState<PageState>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchSubjects() {
      if (
        !Number.isInteger(
          parsedGradeId,
        ) ||
        parsedGradeId <= 0 ||
        !Number.isInteger(
          parsedTermId,
        ) ||
        parsedTermId <= 0
      ) {
        setState({
          status: 'error',
          message:
            'Invalid grade or term.',
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
         * Query parameters make the curriculum location
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
            'A tenant and student profile are required to open this term.',
          );
        }

        /*
         * Never trust tenantId/studentProfileId merely
         * because they came from navigation.
         *
         * Verify that this authenticated account actually
         * has the selected tenant-scoped student profile.
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
         * The student must actually belong to the selected
         * grade before accessing one of its terms.
         */
        if (
          selectedStudent.grade_id !==
          parsedGradeId
        ) {
          throw new Error(
            'The selected term does not belong to the selected student grade.',
          );
        }

        /*
         * Validate the term itself inside the same tenant.
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

        /*
         * Validate the parent relationship as well.
         * A numeric term ID alone is never enough.
         */
        if (
          term.grade_id !==
          parsedGradeId
        ) {
          throw new Error(
            'The selected term does not belong to the selected grade.',
          );
        }

        const subjects =
          await loadSubjects(
            parsedTermId,
            context.tenantId,
          );

        if (cancelled) {
          return;
        }

        /*
         * Normalize the URL so the selected curriculum
         * context survives a refresh.
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
              },
            },
          );

          return;
        }

        /*
         * Games are loaded in the same tenant context.
         *
         * The game runtime route is intentionally not exposed
         * here until its page exists in App.tsx.
         */
        await Promise.all(
          subjects.map(
            (subject) =>
              loadSubjectGame(
                subject.id,
                context.tenantId,
              ),
          ),
        );

        if (cancelled) {
          return;
        }

        if (subjects.length === 0) {
          setState({
            status: 'empty',
            message:
              'No subjects are currently available for this term.',
            context,
            termTitle:
              term.title,
          });

          return;
        }

        setState({
          status: 'ready',
          subjects,
          context,
          termTitle:
            term.title,
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
              : 'Failed to load subjects.',
        });
      }
    }

    void fetchSubjects();

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
  ]);

  const termsPath =
    `/grades/${parsedGradeId}/terms?${new URLSearchParams(
      {
        ...(state.status !== 'error'
          ? {
              tenantId:
                state.context
                  ?.tenantId ?? '',
              studentProfileId:
                state.context
                  ?.studentProfileId ?? '',
            }
          : {}),
      },
    ).toString()}`;

  if (state.status === 'loading') {
    return (
      <main
        id="subjects-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              جاري تحميل المواد الدراسية...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main
        id="subjects-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
          <section className="w-full rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              تعذر تحميل المواد الدراسية
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
    subjects,
    context,
    termTitle,
  } = state;

  const subjectsPath =
    `/grades/${parsedGradeId}/terms/${parsedTermId}/subjects`;

  if (state.status === 'empty') {
    return (
      <main
        id="subjects-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <Link
              to={termsPath}
              className="text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              ← العودة إلى الفصول
            </Link>

            <p className="mt-6 text-sm font-semibold text-sky-600">
              TheTutor
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              المواد الدراسية
            </h1>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {termTitle}
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
      id="subjects-page"
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
                المواد الدراسية
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {termTitle}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                اختر المادة للانتقال إلى وحداتها ودروسها والمحتوى التفاعلي المرتبط بها.
              </p>
            </div>

            <Link
              to={termsPath}
              state={{
                tenantId:
                  context.tenantId,
                studentProfileId:
                  context.studentProfileId,
                gradeId:
                  parsedGradeId,
              }}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              العودة إلى الفصول
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="subjects-heading"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <h2
            id="subjects-heading"
            className="sr-only"
          >
            المواد الدراسية المتاحة
          </h2>

          {subjects.map(
            (subject) => (
              <article
                key={`${context.tenantId}:${subject.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      مادة دراسية
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {subject.title}
                    </h3>

                    {subject.code && (
                      <p className="mt-2 text-xs text-slate-500">
                        {subject.code}
                      </p>
                    )}
                  </div>

                  {subject.icon_name && (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600"
                    >
                      {subject.icon_name}
                    </span>
                  )}
                </div>

                <nav
                  aria-label={`${subject.title} actions`}
                  className="mt-6"
                >
                  <Link
                    to={`${subjectsPath}/${subject.id}/units?tenantId=${encodeURIComponent(
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
                        subject.id,
                    }}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  >
                    عرض الوحدات
                  </Link>
                </nav>
              </article>
            ),
          )}
        </section>
      </div>
    </main>
  );
}

export default SubjectsPage;