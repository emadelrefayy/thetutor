import { Link } from 'react-router-dom';

const learningStats = [
  {
    label: 'الدروس المكتملة',
    value: '—',
    description: 'إجمالي الدروس التي أكملتها',
  },
  {
    label: 'التقدم',
    value: '—',
    description: 'نسبة التقدم في المنهج',
  },
  {
    label: 'النقاط',
    value: '—',
    description: 'النقاط التعليمية المكتسبة',
  },
  {
    label: 'الألعاب',
    value: '—',
    description: 'الأنشطة والألعاب التي أكملتها',
  },
];

const terms = [
  {
    id: 'term-1',
    title: 'الترم الأول',
    description: 'ابدأ دراسة مواد الفصل الدراسي الأول.',
  },
  {
    id: 'term-2',
    title: 'الترم الثاني',
    description: 'ابدأ دراسة مواد الفصل الدراسي الثاني.',
  },
];

function StudentDashboard() {
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
              Student Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 sm:inline-flex">
              طالب
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
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Student Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                رحلتك التعليمية
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                اختر الفصل الدراسي الخاص بسنتك الدراسية، ثم انتقل إلى
                المواد والوحدات والدروس بالترتيب.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              السنة الدراسية
              <span className="mr-2 font-semibold text-slate-900">
                —
              </span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {learningStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {stat.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {stat.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              اختر الفصل الدراسي
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              بعد تحديد الفصل الدراسي ستظهر المواد التابعة للصف والسنة
              الدراسية الخاصة بحساب الطالب.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {terms.map((term) => (
              <article
                key={term.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      فصل دراسي
                    </span>

                    <h3 className="mt-2 text-2xl font-bold text-slate-950">
                      {term.title}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                    {term.id === 'term-1' ? '1' : '2'}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {term.description}
                </p>

                <Link
                  to={`/terms/${term.id}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  دخول {term.title}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  آخر نشاط
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  آخر ما أنجزته في رحلتك التعليمية.
                </p>
              </div>

              <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                قريبًا
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm text-slate-500">
                ستظهر هنا آخر الدروس والأنشطة التي تفاعلت معها.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  إنجازاتي
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  ملخص التقدم والنقاط والألعاب التعليمية.
                </p>
              </div>

              <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                قريبًا
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm text-slate-500">
                ستظهر هنا الإنجازات والنتائج الفعلية للطالب.
              </p>
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                className="relative rounded-xl bg-slate-50 p-4 text-center"
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
            هذا هو المسار التعليمي الأساسي للطالب: يختار الترم، ثم المادة،
            ثم الوحدة، ثم الدرس، ومن داخل الدرس يصل إلى المحتوى والفيديو
            والإنفوجراف واللعبة والتقدم المرتبط بالدرس.
          </p>
        </section>
      </div>
    </main>
  );
}

export default StudentDashboard;