import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  getCurrentProfile,
  getCurrentStudentProfiles,
  getTermsByGrade,
  type Profile,
  type TenantStudentProfile,
  type Term,
} from '../../lib/database';

type TermCard = {
  term: Term;
  student: TenantStudentProfile;
};

function StudentDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [students, setStudents] =
    useState<TenantStudentProfile[]>([]);

  const [terms, setTerms] =
    useState<Term[]>([]);

  const [selectedStudentId, setSelectedStudentId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [
          currentProfile,
          currentStudents,
        ] = await Promise.all([
          getCurrentProfile(),
          getCurrentStudentProfiles(),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(currentProfile);
        setStudents(currentStudents);

        const firstStudent =
          currentStudents.at(0) ?? null;

        setSelectedStudentId(
          firstStudent?.id ?? null,
        );

        if (
          !firstStudent ||
          firstStudent.grade_id === null
        ) {
          setTerms([]);
          return;
        }

        const studentTerms =
          await getTermsByGrade(
            firstStudent.grade_id,
          );

        if (cancelled) {
          return;
        }

        setTerms(studentTerms);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load student dashboard.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedStudent = useMemo(
    () =>
      students.find(
        (student) =>
          student.id === selectedStudentId,
      ) ??
      students.at(0) ??
      null,
    [students, selectedStudentId],
  );

  const termCards: TermCard[] =
    selectedStudent
      ? terms.map((term) => ({
          term,
          student: selectedStudent,
        }))
      : [];

  useEffect(() => {
    const student = selectedStudent;

    if (
      !student ||
      student.grade_id === null
    ) {
      return;
    }

    const gradeId = student.grade_id;

    let cancelled = false;

    async function loadStudentTerms() {
      try {
        setError(null);

        const studentTerms =
          await getTermsByGrade(gradeId);

        if (!cancelled) {
          setTerms(studentTerms);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load terms.',
          );
        }
      }
    }

    void loadStudentTerms();

    return () => {
      cancelled = true;
    };
  }, [selectedStudent]);

  async function handleLogout() {
    const { supabase } =
      await import('../../lib/supabase');

    await supabase.auth.signOut();

    navigate('/login', {
      replace: true,
    });
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50 text-slate-900"
      >
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm text-slate-500">
            جاري تحميل لوحة الطالب...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50 text-slate-900"
      >
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              تعذر تحميل لوحة الطالب
            </h1>

            <p
              role="alert"
              className="mt-3 text-sm leading-7 text-slate-600"
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-slate-950"
            >
              TheTutor
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              لوحة الطالب
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 sm:inline-flex">
              طالب
            </span>

            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold text-slate-300">
            مرحبًا {profile?.name ?? 'بالطالب'}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            ابدأ رحلتك التعليمية
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            اختر الفصل الدراسي للوصول إلى المواد والوحدات والدروس
            الخاصة بالصف المسجل لك.
          </p>
        </div>

        {students.length > 1 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="student-profile"
              className="block text-sm font-semibold text-slate-700"
            >
              اختر ملف الطالب
            </label>

            <select
              id="student-profile"
              value={selectedStudentId ?? ''}
              onChange={(event) =>
                setSelectedStudentId(
                  event.target.value || null,
                )
              }
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.display_name ??
                    student.student_code}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedStudent && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">
                الطالب
              </p>
              <p className="mt-2 font-bold text-slate-900">
                {selectedStudent.display_name ??
                  selectedStudent.student_code}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">
                المستوى
              </p>
              <p className="mt-2 font-bold text-slate-900">
                Level {selectedStudent.level}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">
                XP
              </p>
              <p className="mt-2 font-bold text-slate-900">
                {selectedStudent.xp}
              </p>
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                المنهج الدراسي
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                الفصول الدراسية
              </h2>
            </div>
          </div>

          {termCards.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm leading-7 text-slate-500">
                لا توجد فصول دراسية متاحة لهذا الطالب حاليًا.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {termCards.map(({ term, student }) => (
                <Link
                  key={term.id}
                  to={`/grades/${student.grade_id}/terms/${term.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {term.code}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-slate-950">
                        {term.title}
                      </h3>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
                      فتح
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-500">
                    افتح الفصل للوصول إلى المواد والوحدات والدروس.
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default StudentDashboard;