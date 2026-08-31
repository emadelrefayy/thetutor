import { Link } from 'react-router-dom';

type Child = {
  id: string;
  name: string;
  grade: string;
  progress: number;
  xp: number;
  level: number;
};

const children: Child[] = [];

const summaryCards = [
  {
    title: 'الأبناء',
    value: '—',
    description: 'الأبناء المرتبطون بحسابك',
  },
  {
    title: 'الدروس المكتملة',
    value: '—',
    description: 'إجمالي الدروس المكتملة',
  },
  {
    title: 'متوسط الأداء',
    value: '—',
    description: 'متوسط أداء الأبناء',
  },
  {
    title: 'النقاط',
    value: '—',
    description: 'إجمالي النقاط المكتسبة',
  },
];

function ParentDashboard() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-slate-950"
            >
              TheTutor
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              Parent Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 sm:inline-flex">
              ولي الأمر
            </span>

            <button
              type="button"
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
            Parent Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            لوحة متابعة الأبناء
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            تابع تقدم أبنائك وأداءهم التعليمي والألعاب والإنجازات من
            مكان واحد.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {card.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              أبنائي
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              يمكن أن يرتبط حساب ولي الأمر بأكثر من طالب، بما في ذلك طلاب
              في مراحل أو صفوف مختلفة.
            </p>
          </div>

          {children.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                +
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                لا توجد بيانات أبناء حاليًا
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                عند ربط الطلاب بحساب ولي الأمر ستظهر بياناتهم التعليمية
                هنا تلقائيًا.
              </p>

              <button
                type="button"
                disabled
                className="mt-5 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500"
              >
                ربط طالب قريبًا
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <article
                  key={child.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        {child.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {child.grade}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                      المستوى {child.level}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        التقدم
                      </span>

                      <span className="font-bold text-slate-900">
                        {child.progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{
                          width: `${Math.min(
                            Math.max(child.progress, 0),
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      XP
                    </span>

                    <span className="font-bold text-slate-900">
                      {child.xp}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    عرض التفاصيل
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              التقدم الدراسي
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              ستظهر هنا حالة إكمال الدروس والتقدم في المواد لكل طالب
              مرتبط بالحساب.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              أداء الألعاب
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              ستظهر نتائج ألعاب الدروس والوحدات والمواد ومستوى الأداء
              لكل طالب.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              التوصيات
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              ستظهر التوصيات التعليمية المبنية على بيانات التعلم والأداء
              الفعلية.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                الخصوصية والصلاحيات
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                ولي الأمر يرى فقط الطلاب المرتبطين بحسابه من خلال علاقة
                parent-student المصرح بها في قاعدة البيانات. الواجهة لا
                تمنح صلاحية إضافية تتجاوز RLS.
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-600">
              Authorized Children
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ParentDashboard;