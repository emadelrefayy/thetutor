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
    if (
      !selectedStudent ||
      selectedStudent.grade_id === null
    ) {
      return;
    }

    let cancelled = false;

    async function loadStudentTerms() {
      try {
        setError(null);

        const studentTerms =
          await getTermsByGrade(
            selectedStudent.grade_id!,
          );

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

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section>
          <p className="text-sm font-semibold text-slate-500">
            مرحبًا
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {selectedStudent?.display_name ??
              profile?.name ??
              'الطالب'}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            اختر الفصل الدراسي للانتقال إلى المواد ثم
            الوحدات والدروس والأنشطة التعليمية.
          </p>
        </section>

        {students.length > 1 && (
          <section className="mt-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label
                htmlFor="student-profile"
                className="block text-sm font-semibold text-slate-700"
              >
                الملف الدراسي
              </label>

              <select
                id="student-profile"
                value={
                  selectedStudentId ?? ''
                }
                onChange={(event) =>
                  setSelectedStudentId(
                    event.target.value,
                  )
                }
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-500 sm:max-w-md"
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
          </section>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              الصف الدراسي
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {selectedStudent?.grade_id ??
                '—'}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              الصف المرتبط بملفك الدراسي
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              الفصول الدراسية
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {terms.length}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              الفصول المتاحة لهذا الصف
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              نقاط XP
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {selectedStudent?.xp ?? 0}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              نقاطك التعليمية الحالية
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              المستوى
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {selectedStudent?.level ?? 1}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              مستواك الحالي في المنصة
            </p>
          </article>
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              اختر الفصل الدراسي
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              الفصول هنا يتم تحميلها من قاعدة البيانات
              وفقًا للصف الدراسي المرتبط بحساب الطالب.
            </p>
          </div>

          {selectedStudent?.grade_id === null ||
          !selectedStudent ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-bold text-amber-900">
                لا يوجد صف دراسي مرتبط
              </h3>

              <p className="mt-2 text-sm leading-7 text-amber-800">
                لا يمكن عرض المنهج قبل ربط ملف الطالب
                بصف دراسي.
              </p>
            </div>
          ) : terms.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="font-bold text-slate-900">
                لا توجد فصول دراسية متاحة
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                لم يتم العثور على فصول مرتبطة بهذا الصف
                حتى الآن.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {termCards.map(
                ({ term, student }) => (
                  <article
                    key={term.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-500">
                          {term.code}
                        </span>

                        <h3 className="mt-2 text-2xl font-bold text-slate-950">
                          {term.title}
                        </h3>
                      </div>

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                        {term.id}
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      افتح الفصل الدراسي لعرض المواد
                      والوحدات والدروس المتاحة.
                    </p>

                    <Link
                      to={`/grades/${student.grade_id}/terms/${term.id}`}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      دخول الفصل الدراسي
                    </Link>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            مسار التعلم
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {[
              'الفصل الدراسي',
              'المادة',
              'الوحدة',
              'الدرس',
              'اللعبة والتقدم',
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-xl bg-slate-50 p-4 text-center"
              >
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {index + 1}
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-500">
            يبدأ الطالب من الصف الدراسي، ثم يختار
            الفصل الدراسي، وبعده المادة والوحدة والدرس.
            داخل الدرس تظهر عناصر التعلم المرتبطة به،
            ومنها المحتوى والفيديو والإنفوجراف واللعبة
            والتقدم.
          </p>
        </section>
      </div>
    </main>
  );
}

export default StudentDashboard;