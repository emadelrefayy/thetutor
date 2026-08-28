import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { apiClient } from '../api/apiClient';

import type {
  Grade,
  Lesson,
  Subject,
  Term,
  Unit,
} from '../api/apiClient';

type Section =
  | 'overview'
  | 'content'
  | 'subscribers'
  | 'server';

interface HealthResponse {
  service?: string;
  status?: string;
  version?: string;
}

interface ConnectionState {
  status: 'checking' | 'connected' | 'error';
  message: string;
}

const AdminDashboard: React.FC = () => {
  const [section, setSection] =
    useState<Section>('overview');

  const [connection, setConnection] =
    useState<ConnectionState>({
      status: 'checking',
      message: 'جاري اختبار اتصال الـBackend...',
    });

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [terms, setTerms] =
    useState<Term[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [units, setUnits] =
    useState<Unit[]>([]);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [selectedGradeId, setSelectedGradeId] =
    useState<number | null>(null);

  const [selectedTermId, setSelectedTermId] =
    useState<number | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] =
    useState<number | null>(null);

  const [selectedUnitId, setSelectedUnitId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [lastCheckedAt, setLastCheckedAt] =
    useState<string | null>(null);

  const selectedGrade = useMemo(
    () =>
      grades.find(
        (grade) =>
          grade.id === selectedGradeId,
      ) ?? null,
    [grades, selectedGradeId],
  );

  const selectedTerm = useMemo(
    () =>
      terms.find(
        (term) =>
          term.id === selectedTermId,
      ) ?? null,
    [terms, selectedTermId],
  );

  const selectedSubject = useMemo(
    () =>
      subjects.find(
        (subject) =>
          subject.id === selectedSubjectId,
      ) ?? null,
    [subjects, selectedSubjectId],
  );

  const selectedUnit = useMemo(
    () =>
      units.find(
        (unit) =>
          unit.id === selectedUnitId,
      ) ?? null,
    [units, selectedUnitId],
  );

  const testServerConnection =
    useCallback(async () => {
      setConnection({
        status: 'checking',
        message:
          'جاري اختبار الاتصال بالـBackend...',
      });

      try {
        const response =
          await apiClient.get<HealthResponse>(
            '/health',
          );

        if (
          !response ||
          response.status !== 'healthy'
        ) {
          throw new Error(
            'الـBackend استجاب ولكن حالة الخدمة غير سليمة.',
          );
        }

        setConnection({
          status: 'connected',
          message:
            'الاتصال بالـBackend يعمل بصورة صحيحة.',
        });

        setLastCheckedAt(
          new Date().toLocaleString('ar-EG'),
        );
      } catch (err) {
        console.error(
          'Server health check failed:',
          err,
        );

        setConnection({
          status: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'تعذر الاتصال بالـBackend.',
        });

        setLastCheckedAt(
          new Date().toLocaleString('ar-EG'),
        );
      }
    }, []);

  const loadCurriculum =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const loadedGrades =
          await apiClient.getGrades();

        if (!Array.isArray(loadedGrades)) {
          throw new Error(
            'استجابة الصفوف الدراسية غير صالحة.',
          );
        }

        setGrades(loadedGrades);

        if (loadedGrades.length === 0) {
          setTerms([]);
          setSubjects([]);
          setUnits([]);
          setLessons([]);

          setSelectedGradeId(null);
          setSelectedTermId(null);
          setSelectedSubjectId(null);
          setSelectedUnitId(null);

          return;
        }

        const gradeId =
          selectedGradeId &&
          loadedGrades.some(
            (grade) =>
              grade.id === selectedGradeId,
          )
            ? selectedGradeId
            : loadedGrades[0].id;

        setSelectedGradeId(gradeId);

        const loadedTerms =
          await apiClient.getGradeTerms(
            gradeId,
          );

        if (!Array.isArray(loadedTerms)) {
          throw new Error(
            'استجابة الفصول الدراسية غير صالحة.',
          );
        }

        setTerms(loadedTerms);

        if (loadedTerms.length === 0) {
          setSubjects([]);
          setUnits([]);
          setLessons([]);

          setSelectedTermId(null);
          setSelectedSubjectId(null);
          setSelectedUnitId(null);

          return;
        }

        const termId =
          selectedTermId &&
          loadedTerms.some(
            (term) =>
              term.id === selectedTermId,
          )
            ? selectedTermId
            : loadedTerms[0].id;

        setSelectedTermId(termId);

        const loadedSubjects =
          await apiClient.getTermSubjects(
            termId,
          );

        if (!Array.isArray(loadedSubjects)) {
          throw new Error(
            'استجابة المواد الدراسية غير صالحة.',
          );
        }

        setSubjects(loadedSubjects);

        if (loadedSubjects.length === 0) {
          setUnits([]);
          setLessons([]);

          setSelectedSubjectId(null);
          setSelectedUnitId(null);

          return;
        }

        const subjectId =
          selectedSubjectId &&
          loadedSubjects.some(
            (subject) =>
              subject.id ===
              selectedSubjectId,
          )
            ? selectedSubjectId
            : loadedSubjects[0].id;

        setSelectedSubjectId(subjectId);

        const loadedUnits =
          await apiClient.getUnits(
            subjectId,
          );

        if (!Array.isArray(loadedUnits)) {
          throw new Error(
            'استجابة الوحدات غير صالحة.',
          );
        }

        setUnits(loadedUnits);

        if (loadedUnits.length === 0) {
          setLessons([]);
          setSelectedUnitId(null);

          return;
        }

        const unitId =
          selectedUnitId &&
          loadedUnits.some(
            (unit) =>
              unit.id === selectedUnitId,
          )
            ? selectedUnitId
            : loadedUnits[0].id;

        setSelectedUnitId(unitId);

        const loadedLessons =
          await apiClient.getUnitLessons(
            unitId,
          );

        if (!Array.isArray(loadedLessons)) {
          throw new Error(
            'استجابة الدروس غير صالحة.',
          );
        }

        setLessons(loadedLessons);
      } catch (err) {
        console.error(
          'Curriculum loading failed:',
          err,
        );

        setGrades([]);
        setTerms([]);
        setSubjects([]);
        setUnits([]);
        setLessons([]);

        setSelectedGradeId(null);
        setSelectedTermId(null);
        setSelectedSubjectId(null);
        setSelectedUnitId(null);

        setError(
          err instanceof Error
            ? err.message
            : 'تعذر تحميل هيكل المنهج.',
        );
      } finally {
        setLoading(false);
      }
    }, [
      selectedGradeId,
      selectedTermId,
      selectedSubjectId,
      selectedUnitId,
    ]);

  useEffect(() => {
    testServerConnection();
  }, [testServerConnection]);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  const handleGradeChange = async (
    gradeId: number,
  ) => {
    setSelectedGradeId(gradeId);
    setSelectedTermId(null);
    setSelectedSubjectId(null);
    setSelectedUnitId(null);

    setTerms([]);
    setSubjects([]);
    setUnits([]);
    setLessons([]);

    setLoading(true);
    setError(null);

    try {
      const loadedTerms =
        await apiClient.getGradeTerms(
          gradeId,
        );

      setTerms(
        Array.isArray(loadedTerms)
          ? loadedTerms
          : [],
      );

      if (
        !Array.isArray(loadedTerms) ||
        loadedTerms.length === 0
      ) {
        return;
      }

      const termId =
        loadedTerms[0].id;

      setSelectedTermId(termId);

      const loadedSubjects =
        await apiClient.getTermSubjects(
          termId,
        );

      setSubjects(
        Array.isArray(loadedSubjects)
          ? loadedSubjects
          : [],
      );

      if (
        !Array.isArray(loadedSubjects) ||
        loadedSubjects.length === 0
      ) {
        return;
      }

      const subjectId =
        loadedSubjects[0].id;

      setSelectedSubjectId(
        subjectId,
      );

      const loadedUnits =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(loadedUnits)
          ? loadedUnits
          : [],
      );

      if (
        !Array.isArray(loadedUnits) ||
        loadedUnits.length === 0
      ) {
        return;
      }

      const unitId =
        loadedUnits[0].id;

      setSelectedUnitId(unitId);

      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(loadedLessons)
          ? loadedLessons
          : [],
      );
    } catch (err) {
      console.error(
        'Grade change failed:',
        err,
      );

      setError(
        'تعذر تحميل بيانات الصف المحدد.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = async (
    termId: number,
  ) => {
    setSelectedTermId(termId);
    setSelectedSubjectId(null);
    setSelectedUnitId(null);

    setSubjects([]);
    setUnits([]);
    setLessons([]);

    setLoading(true);
    setError(null);

    try {
      const loadedSubjects =
        await apiClient.getTermSubjects(
          termId,
        );

      setSubjects(
        Array.isArray(loadedSubjects)
          ? loadedSubjects
          : [],
      );

      if (
        !Array.isArray(loadedSubjects) ||
        loadedSubjects.length === 0
      ) {
        return;
      }

      const subjectId =
        loadedSubjects[0].id;

      setSelectedSubjectId(
        subjectId,
      );

      const loadedUnits =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(loadedUnits)
          ? loadedUnits
          : [],
      );

      if (
        !Array.isArray(loadedUnits) ||
        loadedUnits.length === 0
      ) {
        return;
      }

      const unitId =
        loadedUnits[0].id;

      setSelectedUnitId(unitId);

      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(loadedLessons)
          ? loadedLessons
          : [],
      );
    } catch (err) {
      console.error(
        'Term change failed:',
        err,
      );

      setError(
        'تعذر تحميل مواد الفصل المحدد.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = async (
    subjectId: number,
  ) => {
    setSelectedSubjectId(
      subjectId,
    );

    setSelectedUnitId(null);
    setUnits([]);
    setLessons([]);

    setLoading(true);
    setError(null);

    try {
      const loadedUnits =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(loadedUnits)
          ? loadedUnits
          : [],
      );

      if (
        !Array.isArray(loadedUnits) ||
        loadedUnits.length === 0
      ) {
        return;
      }

      const unitId =
        loadedUnits[0].id;

      setSelectedUnitId(unitId);

      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(loadedLessons)
          ? loadedLessons
          : [],
      );
    } catch (err) {
      console.error(
        'Subject change failed:',
        err,
      );

      setError(
        'تعذر تحميل وحدات المادة.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = async (
    unitId: number,
  ) => {
    setSelectedUnitId(unitId);
    setLessons([]);

    setLoading(true);
    setError(null);

    try {
      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(loadedLessons)
          ? loadedLessons
          : [],
      );
    } catch (err) {
      console.error(
        'Unit change failed:',
        err,
      );

      setError(
        'تعذر تحميل دروس الوحدة.',
      );
    } finally {
      setLoading(false);
    }
  };

  const connectionClass =
    connection.status === 'connected'
      ? 'border-emerald-500/30 bg-emerald-500/10'
      : connection.status === 'error'
        ? 'border-red-500/30 bg-red-500/10'
        : 'border-amber-500/30 bg-amber-500/10';

  const connectionIcon =
    connection.status === 'connected'
      ? '✓'
      : connection.status === 'error'
        ? '!'
        : '…';

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-400">
                🛡️ Super Admin
              </div>

              <h1 className="mt-3 text-3xl md:text-4xl font-black text-white">
                لوحة إدارة The Tutor
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                مركز التحكم الرئيسي لإدارة المحتوى
                والمشتركين ومتابعة حالة المنصة.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-amber-500/50 hover:text-amber-400"
            >
              العودة للرئيسية
            </Link>
          </div>
        </header>

        <nav className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <button
            type="button"
            onClick={() =>
              setSection('overview')
            }
            className={`rounded-2xl border p-4 text-right transition ${
              section === 'overview'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-xl">
              📊
            </div>

            <div className="mt-2 font-black">
              نظرة عامة
            </div>

            <div className="mt-1 text-xs text-slate-500">
              حالة المنصة
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setSection('content')
            }
            className={`rounded-2xl border p-4 text-right transition ${
              section === 'content'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-xl">
              📚
            </div>

            <div className="mt-2 font-black">
              إدارة المحتوى
            </div>

            <div className="mt-1 text-xs text-slate-500">
              المناهج والدروس
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setSection('subscribers')
            }
            className={`rounded-2xl border p-4 text-right transition ${
              section === 'subscribers'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-xl">
              👥
            </div>

            <div className="mt-2 font-black">
              إدارة المشتركين
            </div>

            <div className="mt-1 text-xs text-slate-500">
              الطلاب وأولياء الأمور
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setSection('server')
            }
            className={`rounded-2xl border p-4 text-right transition ${
              section === 'server'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-xl">
              🖥️
            </div>

            <div className="mt-2 font-black">
              إدارة المنصة
            </div>

            <div className="mt-1 text-xs text-slate-500">
              الاتصال وحالة السيرفر
            </div>
          </button>
        </nav>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {section === 'overview' && (
          <section className="space-y-6">
            <div
              className={`rounded-2xl border p-5 ${connectionClass}`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950/50 text-xl font-black">
                    {connectionIcon}
                  </div>

                  <div>
                    <h2 className="font-black">
                      اتصال الـBackend
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {connection.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={testServerConnection}
                  disabled={
                    connection.status ===
                    'checking'
                  }
                  className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {connection.status ===
                  'checking'
                    ? 'جاري الاختبار...'
                    : 'اختبار الاتصال'}
                </button>
              </div>

              {lastCheckedAt && (
                <p className="mt-4 text-xs text-slate-500">
                  آخر اختبار: {lastCheckedAt}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  🎓
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  الصفوف الدراسية
                </p>

                <p className="mt-1 text-3xl font-black text-amber-400">
                  {grades.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  📖
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  الفصول
                </p>

                <p className="mt-1 text-3xl font-black text-amber-400">
                  {terms.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  📚
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  المواد الحالية
                </p>

                <p className="mt-1 text-3xl font-black text-amber-400">
                  {subjects.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  📝
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  دروس الوحدة الحالية
                </p>

                <p className="mt-1 text-3xl font-black text-amber-400">
                  {lessons.length}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-black">
                حالة المنصة
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    قاعدة البيانات
                  </p>

                  <p className="mt-2 font-black text-emerald-400">
                    متصلة عبر الـBackend
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    طبقة الـAPI
                  </p>

                  <p
                    className={`mt-2 font-black ${
                      connection.status ===
                      'connected'
                        ? 'text-emerald-400'
                        : connection.status ===
                            'error'
                          ? 'text-red-400'
                          : 'text-amber-400'
                    }`}
                  >
                    {connection.status ===
                    'connected'
                      ? 'تعمل'
                      : connection.status ===
                          'error'
                        ? 'خطأ'
                        : 'جاري الفحص'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">
                    إدارة المحتوى
                  </p>

                  <p className="mt-2 font-black text-amber-400">
                    جاهزة للتطوير
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {section === 'content' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    إدارة المحتوى
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    اختر مستوى المنهج للوصول إلى
                    المواد والوحدات والدروس.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadCurriculum}
                  disabled={loading}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold hover:border-amber-500/50 disabled:opacity-50"
                >
                  {loading
                    ? 'جاري التحديث...'
                    : 'تحديث المنهج'}
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-500">
                    الصف الدراسي
                  </span>

                  <select
                    value={
                      selectedGradeId ?? ''
                    }
                    onChange={(event) =>
                      handleGradeChange(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-amber-500"
                  >
                    {grades.map((grade) => (
                      <option
                        key={grade.id}
                        value={grade.id}
                      >
                        {grade.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-500">
                    الفصل الدراسي
                  </span>

                  <select
                    value={
                      selectedTermId ?? ''
                    }
                    onChange={(event) =>
                      handleTermChange(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    disabled={
                      terms.length === 0
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-amber-500 disabled:opacity-50"
                  >
                    {terms.map((term) => (
                      <option
                        key={term.id}
                        value={term.id}
                      >
                        {term.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-500">
                    المادة
                  </span>

                  <select
                    value={
                      selectedSubjectId ??
                      ''
                    }
                    onChange={(event) =>
                      handleSubjectChange(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    disabled={
                      subjects.length === 0
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-amber-500 disabled:opacity-50"
                  >
                    {subjects.map(
                      (subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                        >
                          {subject.title}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-500">
                    الوحدة
                  </span>

                  <select
                    value={
                      selectedUnitId ?? ''
                    }
                    onChange={(event) =>
                      handleUnitChange(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    disabled={
                      units.length === 0
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-amber-500 disabled:opacity-50"
                  >
                    {units.map((unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        {unit.unit_number}.{' '}
                        {unit.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5">
                <h3 className="text-xl font-black">
                  المسار الحالي
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {selectedGrade?.title ??
                    '—'}
                  {' / '}
                  {selectedTerm?.title ??
                    '—'}
                  {' / '}
                  {selectedSubject?.title ??
                    '—'}
                  {' / '}
                  {selectedUnit?.title ??
                    '—'}
                </p>
              </div>

              {lessons.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
                  <p className="text-slate-400">
                    لا توجد دروس متاحة في
                    الوحدة الحالية.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {lessons.map(
                    (lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/lesson/${lesson.id}`}
                        className="group rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-amber-500/50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-black text-slate-950">
                            {
                              lesson.lesson_number
                            }
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-slate-100 group-hover:text-amber-400">
                              {lesson.title}
                            </h4>

                            {lesson.content_summary && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                {
                                  lesson.content_summary
                                }
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                              {lesson.video_url && (
                                <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[11px] font-bold text-sky-400">
                                  🎥 فيديو
                                </span>
                              )}

                              {lesson.infographic_url && (
                                <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-bold text-violet-400">
                                  🖼️ إنفوجرافيك
                                </span>
                              )}

                              {lesson.game_url && (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-400">
                                  🎮 لعبة
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-amber-400">
                            ◀
                          </span>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  📝
                </div>

                <h3 className="mt-3 font-black">
                  إدارة الدروس
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  افتح الدرس لمراجعة محتواه
                  وموارده من خلال صفحات الدرس
                  الحالية.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  🖼️
                </div>

                <h3 className="mt-3 font-black">
                  الإنفوجرافيك والـAssets
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  الـDatabase تدعم
                  lesson_assets وcontent blocks.
                  واجهة الإدارة التفصيلية ستُربط
                  بها في مرحلة إدارة المحتوى.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  🎮
                </div>

                <h3 className="mt-3 font-black">
                  الألعاب
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  نظام الألعاب يعتمد على
                  game_templates و
                  game_definitions والأسئلة
                  المرتبطة بها.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-2xl">
                  ❓
                </div>

                <h3 className="mt-3 font-black">
                  الأسئلة
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  بنك الأسئلة مستقل ويرتبط
                  بالدروس والألعاب والتحديات.
                </p>
              </div>
            </div>
          </section>
        )}

        {section === 'subscribers' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-2xl">
                  👥
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    إدارة المشتركين
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                    هذا القسم مخصص لإدارة الطلاب
                    وأولياء الأمور والاشتراكات
                    والعلاقات بينهم.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-2xl">
                  🎓
                </div>

                <h3 className="mt-4 font-black">
                  الطلاب
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  إضافة وإدارة حسابات الطلاب
                  وإيقاف أو إعادة تفعيل الحسابات.
                </p>

                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-300">
                  واجهة الإدارة جاهزة معماريًا،
                  لكن Endpoint الإدارة الإدارية
                  للطلاب غير موجود في الـAPI الحالي
                  بعد.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-2xl">
                  👨‍👩‍👧
                </div>

                <h3 className="mt-4 font-black">
                  أولياء الأمور
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  إنشاء وإدارة أولياء الأمور
                  وربطهم بالطلاب.
                </p>

                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-300">
                  نظام parent invitations و
                  parent_students موجود في
                  الـBackend والـDatabase.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-2xl">
                  💳
                </div>

                <h3 className="mt-4 font-black">
                  الاشتراكات
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  متابعة الخطط وحالة الاشتراكات
                  والتواريخ ومزود الدفع.
                </p>

                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-300">
                  جداول plans وsubscriptions
                  موجودة في قاعدة البيانات، لكن
                  Admin API الخاص بها يحتاج
                  Endpoint مخصص.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6">
              <h3 className="font-black">
                ملاحظة تنفيذية
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                لن تقوم هذه الصفحة باستدعاء جداول
                profiles أو subscriptions مباشرة من
                المتصفح، ولن نضع service-role key
                في الـFrontend. إدارة هذه البيانات
                يجب أن تمر عبر Admin API محمي في
                الـBackend.
              </p>
            </div>
          </section>
        )}

        {section === 'server' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
                    🖥️ Platform Health
                  </div>

                  <h2 className="mt-3 text-2xl font-black">
                    إدارة المنصة والسيرفر
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    اختبارات الاتصال الأساسية التي
                    يمكن تنفيذها الآن من خلال الـAPI.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={testServerConnection}
                  disabled={
                    connection.status ===
                    'checking'
                  }
                  className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {connection.status ===
                  'checking'
                    ? 'جاري الاختبار...'
                    : 'تشغيل اختبار الاتصال'}
                </button>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 ${connectionClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/50 text-2xl font-black">
                  {connectionIcon}
                </div>

                <div>
                  <h3 className="font-black">
                    Backend Health Check
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {connection.message}
                  </p>

                  {lastCheckedAt && (
                    <p className="mt-2 text-xs text-slate-500">
                      آخر فحص: {lastCheckedAt}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-2xl">
                  🔌
                </div>

                <h3 className="mt-4 font-black">
                  Backend
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  FastAPI
                </p>

                <p
                  className={`mt-3 font-black ${
                    connection.status ===
                    'connected'
                      ? 'text-emerald-400'
                      : connection.status ===
                          'error'
                        ? 'text-red-400'
                        : 'text-amber-400'
                  }`}
                >
                  {connection.status ===
                  'connected'
                    ? 'Online'
                    : connection.status ===
                        'error'
                      ? 'Error'
                      : 'Checking'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-2xl">
                  🗄️
                </div>

                <h3 className="mt-4 font-black">
                  Supabase
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  يتم التحقق منه حاليًا عبر
                  Backend health/API connection.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-2xl">
                  📈
                </div>

                <h3 className="mt-4 font-black">
                  Performance Monitoring
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  CPU وRAM وLatency وError Rate
                  وغيرها تُفعّل في مرحلة
                  deployment على VPS/Cloud.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-black">
                حدود المرحلة الحالية
              </h3>

              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
                <li>
                  ✓ اختبار Backend Health متاح.
                </li>

                <li>
                  ✓ اتصال الـBackend بقاعدة البيانات
                  يتم من خلال FastAPI.
                </li>

                <li>
                  ✓ لا يتم كشف service-role key
                  للـFrontend.
                </li>

                <li>
                  ⏳ مؤشرات أداء السيرفر التفصيلية
                  تُضاف مع بيئة الـdeployment.
                </li>
              </ul>
            </div>
          </section>
        )}

        <footer className="mt-10 border-t border-slate-800 pt-5 text-center text-xs text-slate-600">
          The Tutor — Super Admin Control Center
        </footer>
      </div>
    </main>
  );
};

export default AdminDashboard;