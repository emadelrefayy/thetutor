import { Link } from 'react-router-dom';

const stats = [
  {
    label: 'المستأجرون',
    value: '—',
    description: 'إجمالي المستأجرين في المنصة',
  },
  {
    label: 'الطلاب',
    value: '—',
    description: 'إجمالي الطلاب المسجلين',
  },
  {
    label: 'أولياء الأمور',
    value: '—',
    description: 'الحسابات المرتبطة بالطلاب',
  },
  {
    label: 'الاشتراكات',
    value: '—',
    description: 'حالة اشتراكات المنصة',
  },
];

const sections = [
  {
    title: 'إدارة المستأجرين',
    description:
      'إنشاء ومتابعة وإدارة المستأجرين وحالة حساباتهم.',
    href: '#',
  },
  {
    title: 'الخطط والاشتراكات',
    description:
      'إدارة خطط المنصة ومتابعة الاشتراكات والاستخدام.',
    href: '#',
  },
  {
    title: 'المستخدمون',
    description:
      'متابعة المستخدمين وإدارة صلاحيات المنصة على المستوى العام.',
    href: '#',
  },
  {
    title: 'المحتوى',
    description:
      'متابعة دورة المحتوى التعليمي وحالات الاستيراد والمراجعة والنشر.',
    href: '#',
  },
  {
    title: 'التقارير والتحليلات',
    description:
      'عرض مؤشرات الاستخدام والأداء على مستوى المنصة.',
    href: '#',
  },
  {
    title: 'سجل العمليات',
    description:
      'متابعة العمليات الإدارية والأحداث المهمة على مستوى المنصة.',
    href: '#',
  },
];

function SuperAdminDashboard() {
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
              Platform Administration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 sm:inline-flex">
              Super Admin
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
                Platform Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                لوحة تحكم المنصة
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                إدارة ومتابعة المنصة والمستأجرين والاشتراكات والمستخدمين
                من مستوى الإدارة المركزية.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              حالة المنصة
              <span className="mr-2 font-semibold text-slate-900">
                متصلة
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
              إدارة المنصة
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              الأقسام الرئيسية التي ستتصل لاحقًا ببيانات Supabase الفعلية.
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

                <a
                  href={section.href}
                  onClick={(event) => event.preventDefault()}
                  className="mt-5 inline-flex text-sm font-semibold text-slate-500"
                >
                  قريبًا
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                طبقة الأمان
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                هذه الصفحة تمثل واجهة الإدارة المركزية فقط. الصلاحيات
                الفعلية ستُحسم من بيانات الحساب الموثوقة وRLS في Supabase،
                وليس من عناصر الواجهة.
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-600">
              RLS + Auth
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SuperAdminDashboard;