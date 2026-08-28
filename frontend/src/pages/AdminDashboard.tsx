import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Navbar from '../components/Navbar';
import CartoonBackground from '../components/CartoonBackground';
import { apiClient } from '../api/apiClient';

import type {
  Grade,
  Subject,
  Term,
} from '../api/apiClient';

interface ConnectionState {
  status:
    | 'checking'
    | 'connected'
    | 'error';
  message: string;
}

const AdminDashboard: React.FC = () => {
  const [connection, setConnection] =
    useState<ConnectionState>({
      status: 'checking',
      message: 'جاري اختبار الاتصال...',
    });

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [terms, setTerms] =
    useState<Term[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [selectedGradeId, setSelectedGradeId] =
    useState<number | null>(null);

  const [selectedTermId, setSelectedTermId] =
    useState<number | null>(null);

  const [loadingData, setLoadingData] =
    useState(false);

  const [dataError, setDataError] =
    useState<string | null>(null);

  const loadCurriculum = useCallback(
    async () => {
      setConnection({
        status: 'checking',
        message:
          'جاري اختبار الاتصال بالـBackend...',
      });

      setLoadingData(true);
      setDataError(null);

      try {
        await apiClient.health();

        setConnection({
          status: 'connected',
          message:
            'الاتصال بالـBackend يعمل بنجاح.',
        });

        const loadedGrades =
          await apiClient.getGrades();

        if (!Array.isArray(loadedGrades)) {
          throw new Error(
            'Invalid grades response.',
          );
        }

        setGrades(loadedGrades);

        if (loadedGrades.length === 0) {
          setSelectedGradeId(null);
          setSelectedTermId(null);
          setTerms([]);
          setSubjects([]);
          return;
        }

        const currentGradeId =
          selectedGradeId &&
          loadedGrades.some(
            (grade) =>
              grade.id === selectedGradeId,
          )
            ? selectedGradeId
            : loadedGrades[0].id;

        setSelectedGradeId(currentGradeId);

        const loadedTerms =
          await apiClient.getGradeTerms(
            currentGradeId,
          );

        if (!Array.isArray(loadedTerms)) {
          throw new Error(
            'Invalid terms response.',
          );
        }

        setTerms(loadedTerms);

        if (loadedTerms.length === 0) {
          setSelectedTermId(null);
          setSubjects([]);
          return;
        }

        const currentTermId =
          selectedTermId &&
          loadedTerms.some(
            (term) =>
              term.id === selectedTermId,
          )
            ? selectedTermId
            : loadedTerms[0].id;

        setSelectedTermId(currentTermId);

        const loadedSubjects =
          await apiClient.getTermSubjects(
            currentTermId,
          );

        if (!Array.isArray(loadedSubjects)) {
          throw new Error(
            'Invalid subjects response.',
          );
        }

        setSubjects(loadedSubjects);
      } catch (error) {
        console.error(
          'Admin curriculum loading failed:',
          error,
        );

        setConnection({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'فشل الاتصال بالـBackend.',
        });

        setDataError(
          'تعذر قراءة بيانات المنهج من قاعدة البيانات.',
        );

        setGrades([]);
        setTerms([]);
        setSubjects([]);
        setSelectedGradeId(null);
        setSelectedTermId(null);
      } finally {
        setLoadingData(false);
      }
    },
    [selectedGradeId, selectedTermId],
  );

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  const handleGradeChange = async (
    gradeId: number,
  ) => {
    setSelectedGradeId(gradeId);
    setSelectedTermId(null);
    setTerms([]);
    setSubjects([]);
    setDataError(null);
    setLoadingData(true);

    try {
      const loadedTerms =
        await apiClient.getGradeTerms(
          gradeId,
        );

      if (!Array.isArray(loadedTerms)) {
        throw new Error(
          'Invalid terms response.',
        );
      }

      setTerms(loadedTerms);

      if (loadedTerms.length === 0) {
        return;
      }

      const firstTermId =
        loadedTerms[0].id;

      setSelectedTermId(firstTermId);

      const loadedSubjects =
        await apiClient.getTermSubjects(
          firstTermId,
        );

      if (!Array.isArray(loadedSubjects)) {
        throw new Error(
          'Invalid subjects response.',
        );
      }

      setSubjects(loadedSubjects);
    } catch (error) {
      console.error(
        'Failed to load grade curriculum:',
        error,
      );

      setDataError(
        'تعذر تحميل الفصول والمواد لهذا الصف.',
      );

      setTerms([]);
      setSubjects([]);
      setSelectedTermId(null);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTermChange = async (
    termId: number,
  ) => {
    setSelectedTermId(termId);
    setSubjects([]);
    setDataError(null);
    setLoadingData(true);

    try {
      const loadedSubjects =
        await apiClient.getTermSubjects(
          termId,
        );

      if (!Array.isArray(loadedSubjects)) {
        throw new Error(
          'Invalid subjects response.',
        );
      }

      setSubjects(loadedSubjects);
    } catch (error) {
      console.error(
        'Failed to load term subjects:',
        error,
      );

      setDataError(
        'تعذر تحميل مواد هذا الفصل.',
      );

      setSubjects([]);
    } finally {
      setLoadingData(false);
    }
  };

  const statusClasses = {
    checking:
      'bg-amber-100 text-amber-800 border-amber-300',
    connected:
      'bg-emerald-100 text-emerald-800 border-emerald-300',
    error:
      'bg-red-100 text-red-800 border-red-300',
  };

  const statusIcon = {
    checking: '⏳',
    connected: '✅',
    error: '❌',
  };

  const selectedGrade =
    grades.find(
      (grade) =>
        grade.id === selectedGradeId,
    ) ?? null;

  const selectedTerm =
    terms.find(
      (term) =>
        term.id === selectedTermId,
    ) ?? null;

  return (
    <div
      className="min-h-screen bg-[#FFFDF5] relative overflow-hidden font-sans"
      dir="rtl"
    >
      <CartoonBackground />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}

        <header className="mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200">
            <div className="flex flex-col gap-5">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black">
                  ⚙️ الإدارة
                </span>

                <h1 className="text-3xl sm:text-4xl font-black text-amber-800 mt-3">
                  لوحة الإدارة
                </h1>

                <p className="text-sm font-bold text-slate-600 mt-2 leading-6">
                  مراقبة اتصال التطبيق وقراءة
                  التسلسل الحقيقي للمنهج من
                  قاعدة البيانات.
                </p>
              </div>

              <div
                className={`rounded-2xl border-2 p-4 ${statusClasses[connection.status]}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black">
                      حالة الاتصال
                    </p>

                    <p className="text-sm font-bold mt-1">
                      {connection.message}
                    </p>
                  </div>

                  <span className="text-2xl">
                    {statusIcon[
                      connection.status
                    ]}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={loadCurriculum}
                disabled={loadingData}
                className="w-full sm:w-auto self-start bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black px-6 py-3 rounded-xl shadow-md transition"
              >
                {loadingData
                  ? 'جاري التحميل...'
                  : '🔄 تحديث بيانات المنهج'}
              </button>
            </div>
          </div>
        </header>

        {/* Error */}

        {dataError && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-red-700">
              {dataError}
            </p>
          </div>
        )}

        {/* Counters */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border-2 border-amber-200 text-center">
            <span className="text-3xl font-black text-amber-600 block">
              {grades.length}
            </span>

            <span className="text-sm font-bold text-slate-600">
              الصفوف
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border-2 border-indigo-200 text-center">
            <span className="text-3xl font-black text-indigo-600 block">
              {terms.length}
            </span>

            <span className="text-sm font-bold text-slate-600">
              الفصول في الصف المحدد
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border-2 border-emerald-200 text-center">
            <span className="text-3xl font-black text-emerald-600 block">
              {subjects.length}
            </span>

            <span className="text-sm font-bold text-slate-600">
              المواد في الفصل المحدد
            </span>
          </div>
        </section>

        {/* Curriculum Explorer */}

        <section className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-amber-800">
              📚 مستكشف المنهج
            </h2>

            <p className="text-sm text-slate-500 mt-1 leading-6">
              Grade → Term → Subject
              <br />
              جميع البيانات التالية تأتي من
              الـBackend المتصل بـSupabase.
            </p>
          </div>

          {/* Grade */}

          <div className="mb-7">
            <label
              htmlFor="grade-select"
              className="block text-sm font-black text-slate-700 mb-2"
            >
              الصف الدراسي
            </label>

            <select
              id="grade-select"
              value={
                selectedGradeId ?? ''
              }
              onChange={(event) => {
                const value =
                  Number(
                    event.target.value,
                  );

                if (
                  Number.isInteger(value) &&
                  value > 0
                ) {
                  handleGradeChange(value);
                }
              }}
              disabled={
                loadingData ||
                grades.length === 0
              }
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-amber-400"
            >
              <option value="">
                اختر الصف
              </option>

              {grades.map((grade) => (
                <option
                  key={grade.id}
                  value={grade.id}
                >
                  {grade.title}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Grade */}

          {selectedGrade && (
            <div className="mb-7 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs font-black text-amber-700">
                الصف المحدد
              </p>

              <p className="text-lg font-black text-amber-900 mt-1">
                {selectedGrade.title}
              </p>

              {selectedGrade.code && (
                <p className="text-xs text-amber-700 mt-1">
                  الكود: {selectedGrade.code}
                </p>
              )}
            </div>
          )}

          {/* Terms */}

          <div className="mb-7">
            <label
              htmlFor="term-select"
              className="block text-sm font-black text-slate-700 mb-2"
            >
              الفصل الدراسي
            </label>

            <select
              id="term-select"
              value={
                selectedTermId ?? ''
              }
              onChange={(event) => {
                const value =
                  Number(
                    event.target.value,
                  );

                if (
                  Number.isInteger(value) &&
                  value > 0
                ) {
                  handleTermChange(value);
                }
              }}
              disabled={
                loadingData ||
                terms.length === 0
              }
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400"
            >
              <option value="">
                اختر الفصل الدراسي
              </option>

              {terms.map((term) => (
                <option
                  key={term.id}
                  value={term.id}
                >
                  {term.title}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Term */}

          {selectedTerm && (
            <div className="mb-7 rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
              <p className="text-xs font-black text-indigo-700">
                الفصل المحدد
              </p>

              <p className="text-lg font-black text-indigo-900 mt-1">
                {selectedTerm.title}
              </p>

              {selectedTerm.code && (
                <p className="text-xs text-indigo-700 mt-1">
                  الكود: {selectedTerm.code}
                </p>
              )}
            </div>
          )}

          {/* Subjects */}

          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  المواد
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  المواد المرتبطة بالفصل
                  الدراسي المحدد.
                </p>
              </div>

              <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                {subjects.length} مادة
              </span>
            </div>

            {loadingData ? (
              <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-amber-600 animate-pulse">
                  جاري قراءة بيانات قاعدة
                  البيانات...
                </p>
              </div>
            ) : terms.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-500">
                  لا توجد فصول متاحة لهذا
                  الصف.
                </p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-500">
                  لا توجد مواد متاحة لهذا
                  الفصل.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(
                  (subject) => (
                    <article
                      key={subject.id}
                      className="rounded-2xl bg-slate-50 border border-slate-200 p-5 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl">
                          {subject.icon_name ??
                            '📚'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-slate-800">
                            {subject.title}
                          </h4>

                          {subject.code && (
                            <p className="text-xs text-slate-500 mt-1">
                              {subject.code}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Subject ID
                        </span>

                        <span className="font-black text-slate-700">
                          {subject.id}
                        </span>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;