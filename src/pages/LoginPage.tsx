import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setLoading(true);

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (signInError) {
      setError(
        'بيانات تسجيل الدخول غير صحيحة أو تعذر تسجيل الدخول. حاول مرة أخرى.',
      );
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('تعذر إنشاء جلسة تسجيل الدخول.');
      setLoading(false);
      return;
    }

    /*
     * Role resolution is intentionally handled by the dashboard/auth
     * layer rather than trusting client-editable metadata.
     *
     * The next stage will introduce the protected route and role resolver.
     */
    navigate('/dashboard', { replace: true });
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
          <section className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link
                to="/"
                className="text-2xl font-bold tracking-tight"
              >
                TheTutor
              </Link>

              <div className="mt-16">
                <p className="text-sm font-semibold text-slate-300">
                  مرحبًا بك
                </p>

                <h1 className="mt-3 text-4xl font-bold leading-tight">
                  ادخل إلى مساحتك
                  <br />
                  التعليمية
                </h1>

                <p className="mt-6 max-w-md leading-8 text-slate-300">
                  بعد تسجيل الدخول ستنتقل إلى المساحة المناسبة لدورك في
                  المنصة، سواء كنت طالبًا أو ولي أمر أو مسؤول مستأجر أو
                  مسؤول المنصة.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                'Student',
                'Parent',
                'Tenant Admin',
                'Super Admin',
              ].map((role) => (
                <div
                  key={role}
                  className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300"
                >
                  {role}
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="text-xl font-bold tracking-tight text-slate-900 lg:hidden"
                >
                  TheTutor
                </Link>

                <Link
                  to="/"
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  العودة للرئيسية
                </Link>
              </div>

              <div className="mt-12">
                <p className="text-sm font-semibold text-slate-500">
                  تسجيل الدخول
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  أهلاً بك مرة أخرى
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  أدخل بيانات حسابك للوصول إلى لوحة التحكم الخاصة بك.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    البريد الإلكتروني
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-left outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      كلمة المرور
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setError(
                          'استعادة كلمة المرور سيتم تفعيلها مع إعداد Auth الكامل.',
                        );
                      }}
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-20 text-left outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      disabled={loading}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                      aria-label={
                        showPassword
                          ? 'إخفاء كلمة المرور'
                          : 'إظهار كلمة المرور'
                      }
                    >
                      {showPassword ? 'إخفاء' : 'إظهار'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
              </form>

              <div className="mt-8 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs leading-6 text-slate-500">
                  سيتم تحديد صلاحيات الحساب ولوحة التحكم من بيانات
                  الحساب الموثوقة في قاعدة البيانات، وليس من بيانات يرسلها
                  المستخدم من الواجهة.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;