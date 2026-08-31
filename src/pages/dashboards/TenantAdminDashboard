import { Link } from 'react-router-dom';

const stats = [
  {
    label: 'الطلاب',
    value: '—',
    description: 'الطلاب النشطون داخل المستأجر',
  },
  {
    label: 'أولياء الأمور',
    value: '—',
    description: 'الحسابات المرتبطة بالطلاب',
  },
  {
    label: 'الدروس',
    value: '—',
    description: 'الدروس المتاحة داخل المنهج',
  },
  {
    label: 'الأنشطة والألعاب',
    value: '—',
    description: 'المحتوى التفاعلي المتاح',
  },
];

const sections = [
  {
    title: 'الطلاب',
    description:
      'إدارة الطلاب ومتابعة حالتهم التعليمية داخل المستأجر.',
  },
  {
    title: 'أولياء الأمور',
    description:
      'إدارة حسابات أولياء الأمور وعلاقاتهم بالطلاب.',
  },
  {
    title: 'المنهج',
    description:
      'الوصول إلى الصفوف والفصول والمواد والوحدات والدروس الخاصة بالمستأجر.',
  },
  {
    title: 'الألعاب',
    description:
      'متابعة الألعاب التعليمية وإعداداتها ومحتواها.',
  },
  {
    title: 'المحتوى',
    description:
      'إدارة المحتوى التعليمي والأصول المرتبطة بالدروس.',
  },
  {
    title: 'التقارير',
    description:
      'متابعة تقدم الطلاب وأداء التعلم داخل المستأجر.',
  },
];

function TenantAdminDashboard() {
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
              Tenant Administration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 sm:inline-flex">
              Tenant Admin
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
                Tenant Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                لوحة تحكم المستأجر
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                إدارة الطلاب وأولياء الأمور والمحتوى والعملية التعليمية
                داخل المستأجر الحالي.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              حالة الحساب
              <span className="mr-2 font-semibold text-slate-900">
                نشط
              </span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
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
              إدارة المستأجر
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              الأقسام الأساسية للعملية التعليمية والإدارية.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  →
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {section.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {section.description}
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500"
                >
                  قريبًا
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                نطاق الإدارة
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                جميع العمليات الإدارية في هذه المساحة يجب أن تظل ضمن
                المستأجر المرتبط بالحساب الحالي. العزل الحقيقي يتم بواسطة
                RLS وعلاقات tenant membership في قاعدة البيانات.
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-600">
              Tenant Scoped
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TenantAdminDashboard;