import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  getCurrentParentStudents,
  type ParentStudent,
  type Profile,
} from '../../lib/database';
import { getCurrentProfile } from '../../lib/database';

function ParentDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [children, setChildren] =
    useState<ParentStudent[]>([]);

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
          parentStudents,
        ] = await Promise.all([
          getCurrentProfile(),
          getCurrentParentStudents(),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(currentProfile);
        setChildren(parentStudents);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load parent dashboard.',
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

  const validChildren = useMemo(
    () =>
      children.filter(
        (child) => child.student !== null,
      ),
    [children],
  );

  const totalXp = useMemo(
    () =>
      validChildren.reduce(
        (total, child) =>
          total + (child.student?.xp ?? 0),
        0,
      ),
    [validChildren],
  );

  const averageLevel = useMemo(() => {
    if (validChildren.length === 0) {
      return 0;
    }

    const totalLevel =
      validChildren.reduce(
        (total, child) =>
          total + (child.student?.level ?? 0),
        0,
      );

    return Math.round(
      (totalLevel / validChildren.length) *
        10,
    ) / 10;
  }, [validChildren]);

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
            جاري تحميل لوحة ولي الأمر...
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
              تعذر تحميل لوحة ولي الأمر
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
              لوحة ولي الأمر
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 sm:inline-flex">
              ولي الأمر
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
            {profile?.name ??
              'لوحة متابعة الأبناء'}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            تابع الطلاب المرتبطين بحسابك، بغض النظر عن الصف أو المرحلة
            الدراسية التي ينتمي إليها كل طالب.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              الأبناء
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {validChildren.length}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              الطلاب المرتبطون بحسابك
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              إجمالي XP
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {totalXp}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              مجموع النقاط الحالية للأبناء
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              متوسط المستوى
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {averageLevel || '—'}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              متوسط المستوى الحالي للطلاب المرتبطين
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              الحالة
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {validChildren.length > 0
                ? 'نشط'
                : '—'}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              حالة ارتباط الطلاب بحساب ولي الأمر
            </p>
          </article>
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              أبنائي
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              البيانات التالية تأتي من علاقة ولي الأمر بالطلاب المصرح
              بها في قاعدة البيانات، وليست قائمة ثابتة داخل الواجهة.
            </p>
          </div>

          {validChildren.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                —
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                لا يوجد طلاب مرتبطون بالحساب
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                عند إنشاء علاقة صحيحة بين حساب ولي الأمر والطالب في
                قاعدة البيانات سيظهر الطالب هنا تلقائيًا.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {validChildren.map(
                (parentStudent) => {
                  const student =
                    parentStudent.student;

                  if (!student) {
                    return null;
                  }

                  return (
                    <article
                      key={`${parentStudent.tenant_id}-${parentStudent.student_profile_id}`}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-950">
                            {student.display_name ??
                              student.student_code}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {student.student_code}
                          </p>
                        </div>

                        {parentStudent.is_primary && (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            أساسي
                          </span>
                        )}
                      </div>

                      <dl className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <dt className="text-xs text-slate-500">
                            الصف
                          </dt>

                          <dd className="mt-1 text-lg font-bold text-slate-900">
                            {student.grade_id ??
                              '—'}
                          </dd>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <dt className="text-xs text-slate-500">
                            المستوى
                          </dt>

                          <dd className="mt-1 text-lg font-bold text-slate-900">
                            {student.level}
                          </dd>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <dt className="text-xs text-slate-500">
                            XP
                          </dt>

                          <dd className="mt-1 text-lg font-bold text-slate-900">
                            {student.xp}
                          </dd>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <dt className="text-xs text-slate-500">
                            العلاقة
                          </dt>

                          <dd className="mt-1 text-sm font-bold text-slate-900">
                            {parentStudent.relationship ||
                              '—'}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-5 rounded-xl border border-slate-200 p-4">
                        <p className="text-xs leading-6 text-slate-500">
                          يمكن لولي الأمر متابعة هذا الطالب من خلال
                          حسابه. صلاحية الوصول للبيانات الفعلية يحكمها
                          نظام المصادقة وRLS في قاعدة البيانات.
                        </p>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              التقدم الدراسي
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              سيتم عرض تقدم كل طالب في الدروس والمواد اعتمادًا على
              سجلات التقدم الفعلية المرتبطة بملفه الدراسي.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              الأنشطة والألعاب
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              سيتم ربط نتائج الألعاب بمستوى الدرس والوحدة والمادة، مع
              عرضها لولي الأمر وفق صلاحياته.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              التوصيات
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              ستعتمد التوصيات المستقبلية على بيانات التعلم الفعلية،
              وليس على بيانات تجريبية أو قيم ثابتة داخل الصفحة.
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                نطاق الوصول
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                لوحة ولي الأمر لا تبحث عن الطلاب بشكل عام، وإنما تبدأ من
                علاقات الطلاب المرتبطة بحساب ولي الأمر في
                <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                  tenant_parent_students
                </code>
                ثم تجلب ملفاتهم الدراسية المرتبطة.
              </p>
            </div>

            <span className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-600">
              Parent → Students
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ParentDashboard;