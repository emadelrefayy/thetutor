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
  type Term,
} from '../lib/database';

import {
  loadGrade,
  loadTerms,
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
      terms: Term[];
      context: NavigationContext;
      gradeTitle: string;
    }
  | {
      status: 'empty';
      message: string;
      context: NavigationContext;
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
  const params = new URLSearchParams(
    search,
  );

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

function TermsPage() {
  const {
    gradeId,
  } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const parsedGradeId =
    Number(gradeId);

  const [
    state,
    setState,
  ] = useState<PageState>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchTerms() {
      if (
        !Number.isInteger(
          parsedGradeId,
        ) ||
        parsedGradeId <= 0
      ) {
        setState({
          status: 'error',
          message:
            'Invalid grade.',
        });

        return;
      }

      try {
        setState({
          status: 'loading',
        });

        /*
         * GradesPage passes the selected tenant and
         * student profile through router state and
         * query parameters.
         *
         * Router state is convenient for navigation,
         * while the query parameters keep the selected
         * context addressable after a refresh.
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
            'A tenant and student profile are required to open this grade.',
          );
        }

        /*
         * Never trust tenantId/studentProfileId merely
         * because they came from the URL.
         *
         * Verify that the authenticated account owns
         * the selected student profile in that tenant.
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
         * The student may only enter the grade that is
         * actually assigned to this tenant-scoped
         * student profile.
         */
        if (
          selectedStudent.grade_id !==
          parsedGradeId
        ) {
          throw new Error(
            'The selected grade does not belong to the selected student profile.',
          );
        }

        const [
          grade,
          terms,
        ] = await Promise.all([
          loadGrade(
            parsedGradeId,
            context.tenantId,
          ),
          loadTerms(
            parsedGradeId,
            context.tenantId,
          ),
        ]);

        if (cancelled) {
          return;
        }

        if (!grade) {
          throw new Error(
            'The selected grade was not found in this tenant.',
          );
        }

        /*
         * Normalize the URL when the page was opened
         * through router state only.
         *
         * This makes refresh/deep-link behavior deterministic
         * without changing the existing route structure.
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
              },
            },
          );

          return;
        }

        if (terms.length === 0) {
          setState({
            status: 'empty',
            message:
              'No terms are currently available for this grade.',
            context,
          });

          return;
        }

        setState({
          status: 'ready',
          terms,
          context,
          gradeTitle:
            grade.title,
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
              : 'Failed to load terms.',
        });
      }
    }

    void fetchTerms();

    return () => {
      cancelled = true;
    };
  }, [
    location.pathname,
    location.search,
    location.state,
    navigate,
    parsedGradeId,
  ]);

  if (state.status === 'loading') {
    return (
      <main
        id="terms-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              جاري تحميل الفصول الدراسية...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main
        id="terms-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
          <section className="w-full rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              تعذر تحميل الفصول الدراسية
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

  if (state.status === 'empty') {
    return (
      <main
        id="terms-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
          <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              لا توجد فصول دراسية
            </h1>

            <p
              role="status"
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
    terms,
    context,
    gradeTitle,
  } = state;

  return (
    <main
      id="terms-page"
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
                الفصول الدراسية
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {gradeTitle}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                اختر الفصل الدراسي للانتقال إلى المواد والوحدات والدروس الخاصة بالصف المحدد.
              </p>
            </div>

            <Link
              to={`/grades?tenantId=${encodeURIComponent(
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
              }}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              تغيير الصف
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="terms-heading"
          className="grid gap-5 sm:grid-cols-2"
        >
          <h2
            id="terms-heading"
            className="sr-only"
          >
            الفصول الدراسية المتاحة
          </h2>

          {terms.map(
            (term) => (
              <Link
                key={`${context.tenantId}:${term.id}`}
                to={`/grades/${parsedGradeId}/terms/${term.id}/subjects?tenantId=${encodeURIComponent(
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
                    term.id,
                }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      الفصل الدراسي
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900 group-hover:text-sky-700">
                      {term.title}
                    </h3>

                    {term.code && (
                      <p className="mt-2 text-xs text-slate-500">
                        {term.code}
                      </p>
                    )}
                  </div>

                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-sky-50 group-hover:text-sky-700"
                  >
                    ←
                  </span>
                </div>
              </Link>
            ),
          )}
        </section>
      </div>
    </main>
  );
}

export default TermsPage;