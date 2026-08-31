import {
  useEffect,
  useState,
} from 'react';
import {
  Link,
  Navigate,
} from 'react-router-dom';

import {
  getCurrentStudentProfiles,
  type Grade,
  type TenantStudentProfile,
} from '../lib/database';

import {
  loadGrade,
} from '../lib/curriculum';

type StudentGrade = {
  grade: Grade;
  tenantId: string;
  studentProfileId: string;
  student: TenantStudentProfile;
};

type PageState =
  | {
      status: 'loading';
    }
  | {
      status: 'ready';
      grades: StudentGrade[];
    }
  | {
      status: 'empty';
      message: string;
    }
  | {
      status: 'error';
      message: string;
    };

function GradesPage() {
  const [
    state,
    setState,
  ] = useState<PageState>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadStudentGrades() {
      try {
        setState({
          status: 'loading',
        });

        const studentProfiles =
          await getCurrentStudentProfiles();

        if (cancelled) {
          return;
        }

        if (studentProfiles.length === 0) {
          setState({
            status: 'empty',
            message:
              'No active student profile is available for this account.',
          });

          return;
        }

        const grades = await Promise.all(
          studentProfiles
            .filter(
              (
                student,
              ): student is TenantStudentProfile & {
                grade_id: number;
              } =>
                student.grade_id !== null &&
                student.grade_id !== undefined,
            )
            .map(async (student) => {
              const grade =
                await loadGrade(
                  student.grade_id,
                  student.tenant_id,
                );

              if (!grade) {
                return null;
              }

              return {
                grade,
                tenantId:
                  student.tenant_id,
                studentProfileId:
                  student.id,
                student,
              };
            }),
        );

        if (cancelled) {
          return;
        }

        const uniqueGrades = new Map<
          string,
          StudentGrade
        >();

        for (const item of grades) {
          if (!item) {
            continue;
          }

          /*
           * Grade identity is tenant-scoped.
           *
           * Never deduplicate by grade.id alone.
           */
          const key =
            `${item.tenantId}:${item.grade.id}`;

          if (!uniqueGrades.has(key)) {
            uniqueGrades.set(
              key,
              item,
            );
          }
        }

        const availableGrades =
          Array.from(
            uniqueGrades.values(),
          ).sort(
            (a, b) => {
              const aLevel =
                a.grade.level_code ?? Number.MAX_SAFE_INTEGER;

              const bLevel =
                b.grade.level_code ?? Number.MAX_SAFE_INTEGER;

              if (aLevel !== bLevel) {
                return aLevel - bLevel;
              }

              return (
                a.grade.id -
                b.grade.id
              );
            },
          );

        if (availableGrades.length === 0) {
          setState({
            status: 'empty',
            message:
              'No grade is currently assigned to your active student profile.',
          });

          return;
        }

        setState({
          status: 'ready',
          grades: availableGrades,
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
              : 'Failed to load your grades.',
        });
      }
    }

    void loadStudentGrades();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <main
        id="grades-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              جاري تحميل الصفوف الدراسية...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main
        id="grades-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
          <section className="w-full rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              تعذر تحميل الصف الدراسي
            </h1>

            <p
              role="alert"
              className="mt-3 text-sm leading-7 text-slate-600"
            >
              {state.message}
            </p>

            <Link
              to="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              العودة إلى لوحة التحكم
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (state.status === 'empty') {
    return (
      <main
        id="grades-page"
        dir="rtl"
        className="min-h-screen bg-slate-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center">
          <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              لا يوجد صف دراسي متاح
            </h1>

            <p
              role="status"
              className="mt-3 text-sm leading-7 text-slate-600"
            >
              {state.message}
            </p>

            <Link
              to="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              العودة إلى لوحة التحكم
            </Link>
          </section>
        </div>
      </main>
    );
  }

  /*
   * The page is a student curriculum entry point.
   *
   * If the authenticated account has no student profiles,
   * it must not be allowed to browse the student curriculum.
   */
  if (state.grades.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main
      id="grades-page"
      dir="rtl"
      className="min-h-screen bg-slate-50 px-6 py-10"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-sky-600">
            TheTutor
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            الصف الدراسي
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            اختر الصف الدراسي المرتبط بحسابك للانتقال إلى الفصول والمواد والوحدات والدروس.
          </p>
        </header>

        <section
          aria-labelledby="grades-heading"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <h2
            id="grades-heading"
            className="sr-only"
          >
            الصفوف الدراسية المتاحة
          </h2>

          {state.grades.map(
            ({
              grade,
              tenantId,
              studentProfileId,
              student,
            }) => (
              <Link
                key={`${tenantId}:${grade.id}`}
                to={`/grades/${grade.id}/terms?tenantId=${encodeURIComponent(
                  tenantId,
                )}&studentProfileId=${encodeURIComponent(
                  studentProfileId,
                )}`}
                state={{
                  tenantId,
                  studentProfileId,
                  gradeId: grade.id,
                }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      الصف الدراسي
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900 group-hover:text-sky-700">
                      {grade.title}
                    </h3>

                    {grade.code && (
                      <p className="mt-2 text-xs text-slate-500">
                        {grade.code}
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

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    الطالب
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {student.display_name ??
                      'الطالب'}
                  </p>
                </div>
              </Link>
            ),
          )}
        </section>
      </div>
    </main>
  );
}

export default GradesPage;