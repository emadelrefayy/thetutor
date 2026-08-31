import { Link } from 'react-router-dom';

const features = [
  {
    title: 'منهج منظم',
    description:
      'الوصول إلى الصفوف والفصول والمواد والوحدات والدروس في مسار تعليمي واضح.',
  },
  {
    title: 'تعلم تفاعلي',
    description:
      'فيديوهات تعليمية ومحتوى بصري وأنشطة وألعاب مرتبطة بالدروس.',
  },
  {
    title: 'متابعة التقدم',
    description:
      'متابعة إنجاز الدروس والأداء والنتائج والتقدم التعليمي بشكل مستمر.',
  },
  {
    title: 'تجربة لكل دور',
    description:
      'مساحة مخصصة لإدارة المنصة وإدارة المستأجرين وأولياء الأمور والطلاب.',
  },
];

const roles = [
  {
    title: 'الطالب',
    description: 'تعلم، تابع تقدمك، وخض الألعاب التعليمية.',
  },
  {
    title: 'ولي الأمر',
    description: 'تابع أبناءك وأداءهم وتقدمهم التعليمي.',
  },
  {
    title: 'إدارة المستأجر',
    description: 'إدارة الطلاب والمحتوى والعملية التعليمية داخل المستأجر.',
  },
  {
    title: 'إدارة المنصة',
    description: 'إدارة المستأجرين والخدمات والمنصة بالكامل.',
  },
];

function LandingPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            TheTutor
          </Link>

          <nav className="flex items-center gap-3">
            <a
              href="#features"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:inline-flex"
            >
              المميزات
            </a>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              تسجيل الدخول
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              منصة تعليمية تفاعلية
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              تعلم أفضل.
              <br />
              تفاعل أكثر.
              <br />
              تقدم مستمر.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              TheTutor منصة تعليمية متكاملة تساعد الطلاب على التعلم من خلال
              محتوى منظم وتجارب تفاعلية وألعاب تعليمية، مع أدوات لمتابعة
              التقدم للطالب وولي الأمر وإدارة العملية التعليمية.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-700"
              >
                ابدأ الآن
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                اكتشف المنصة
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      رحلة التعلم
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      من المنهج إلى الإنجاز
                    </h2>
                  </div>

                  <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white">
                    Learn
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    'الصف الدراسي',
                    'الفصل الدراسي',
                    'المادة',
                    'الوحدة',
                    'الدرس',
                    'اللعبة التعليمية',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                        {index + 1}
                      </span>

                      <span className="font-medium text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="bg-slate-50 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-slate-500">
              لماذا TheTutor؟
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              منظومة تعليمية واحدة لكل رحلة التعلم
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              المنصة تجمع المحتوى التعليمي والتفاعل والألعاب ومتابعة الأداء
              داخل تجربة واحدة.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                  ✓
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-500">
              تجربة مصممة حسب الدور
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              كل مستخدم له مساحة تناسب مهمته
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
              <article
                key={role.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {role.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {role.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            جاهز لبدء رحلة التعلم؟
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
            سجّل الدخول للوصول إلى المساحة المناسبة لك حسب دورك في المنصة.
          </p>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            تسجيل الدخول
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} TheTutor</span>
          <span>منصة تعليمية تفاعلية</span>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;