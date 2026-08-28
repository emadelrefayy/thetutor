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


interface ConnectionState {
  status: 'checking' | 'connected' | 'error';
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


  const loadInitialCurriculum =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      setConnection({
        status: 'checking',
        message:
          'جاري الاتصال بالـBackend وقراءة المنهج...',
      });

      try {
        await apiClient.health();

        const loadedGrades =
          await apiClient.getGrades();

        if (!Array.isArray(loadedGrades)) {
          throw new Error(
            'Invalid grades response.',
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

          setConnection({
            status: 'connected',
            message:
              'تم الاتصال بنجاح، ولكن لا توجد صفوف دراسية.',
          });

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
            'Invalid terms response.',
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

          setConnection({
            status: 'connected',
            message:
              'تم الاتصال، ولكن لا توجد فصول لهذا الصف.',
          });

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
            'Invalid subjects response.',
          );
        }

        setSubjects(loadedSubjects);

        if (loadedSubjects.length === 0) {
          setUnits([]);
          setLessons([]);

          setSelectedSubjectId(null);
          setSelectedUnitId(null);

          setConnection({
            status: 'connected',
            message:
              'تم الاتصال، ولكن لا توجد مواد لهذا الفصل.',
          });

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
            'Invalid units response.',
          );
        }

        setUnits(loadedUnits);

        if (loadedUnits.length === 0) {
          setLessons([]);
          setSelectedUnitId(null);

          setConnection({
            status: 'connected',
            message:
              'تم الاتصال، ولكن لا توجد وحدات لهذه المادة.',
          });

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
            'Invalid lessons response.',
          );
        }

        setLessons(loadedLessons);

        setConnection({
          status: 'connected',
          message:
            'الاتصال بالـBackend يعمل، وتم تحميل المنهج بنجاح.',
        });
      } catch (err) {
        console.error(
          'Studio curriculum loading failed:',
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

        setConnection({
          status: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'فشل الاتصال بالـBackend.',
        });

        setError(
          'تعذر تحميل هيكل المنهج من قاعدة البيانات.',
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
    loadInitialCurriculum();
  }, [loadInitialCurriculum]);


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

    setError(null);
    setLoading(true);

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

      const termId =
        loadedTerms[0].id;

      setSelectedTermId(termId);

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

      if (loadedSubjects.length === 0) {
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

      if (!Array.isArray(loadedUnits)) {
        throw new Error(
          'Invalid units response.',
        );
      }

      setUnits(loadedUnits);

      if (loadedUnits.length === 0) {
        return;
      }

      const unitId =
        loadedUnits[0].id;

      setSelectedUnitId(unitId);

      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      if (!Array.isArray(loadedLessons)) {
        throw new Error(
          'Invalid lessons response.',
        );
      }

      setLessons(loadedLessons);

      setConnection({
        status: 'connected',
        message:
          'تم تحميل المنهج بنجاح.',
      });
    } catch (err) {
      console.error(
        'Failed to change grade:',
        err,
      );

      setError(
        'تعذر تحميل بيانات الصف المحدد.',
      );

      setTerms([]);
      setSubjects([]);
      setUnits([]);
      setLessons([]);

      setSelectedTermId(null);
      setSelectedSubjectId(null);
      setSelectedUnitId(null);
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

    setError(null);
    setLoading(true);

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

      if (loadedSubjects.length === 0) {
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

      if (!Array.isArray(loadedUnits)) {
        throw new Error(
          'Invalid units response.',
        );
      }

      setUnits(loadedUnits);

      if (loadedUnits.length === 0) {
        return;
      }

      const unitId =
        loadedUnits[0].id;

      setSelectedUnitId(unitId);

      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      if (!Array.isArray(loadedLessons)) {
        throw new Error(
          'Invalid lessons response.',
        );
      }

      setLessons(loadedLessons);
    } catch (err) {
      console.error(
        'Failed to change term:',
        err,
      );

      setError(
        'تعذر تحميل مواد الفصل المحدد.',
      );

      setSubjects([]);
      setUnits([]);
      setLessons([]);

      setSelectedSubjectId(null);
      setSelectedUnitId(null);
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

    setError(null);
    setLoading(true);

    try {
      const loadedUnits =
        await apiClient.getUnits(
          subjectId,
        );

      if (!Array.isArray(loadedUnits)) {
        throw new Error(
          'Invalid units response.',
        );
      }

      setUnits(loadedUnits);

      if (loadedUnits.length === 0) {
        return;
      }

      const unitId =
        loadedUnits[0].id;

      setSelectedUnitId(unitId);

      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      if (!Array.isArray(loadedLessons)) {
        throw new Error(
          'Invalid lessons response.',
        );
      }

      setLessons(loadedLessons);
    } catch (err) {
      console.error(
        'Failed to change subject:',
        err,
      );

      setError(
        'تعذر تحميل وحدات المادة.',
      );

      setUnits([]);
      setLessons([]);
      setSelectedUnitId(null);
    } finally {
      setLoading(false);
    }
  };


  const handleUnitChange = async (
    unitId: number,
  ) => {
    setSelectedUnitId(unitId);

    setLessons([]);
    setError(null);
    setLoading(true);

    try {
      const loadedLessons =
        await apiClient.getUnitLessons(
          unitId,
        );

      if (!Array.isArray(loadedLessons)) {
        throw new Error(
          'Invalid lessons response.',
        );
      }

      setLessons(loadedLessons);
    } catch (err) {
      console.error(
        'Failed to change unit:',
        err,
      );

      setError(
        'تعذر تحميل دروس الوحدة.',
      );

      setLessons([]);
    } finally {
      setLoading(false);
    }
  };


  const statusClasses = {
    checking:
      'border-amber-300 bg-amber-50 text-amber-800',
    connected:
      'border-emerald-300 bg-emerald-50 text-emerald-800',
    error:
      'border-red-300 bg-red-50 text-red-800',
  };


  const statusIcons = {
    checking: '⏳',
    connected: '✅',
    error: '❌',
  };


  return (
    <main
      className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <header className="mb-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-400">
                  🎓 The Tutor Studio
                </span>

                <h1 className="mt-3 text-3xl font-black text-amber-400 sm:text-4xl">
                  استوديو المنهج
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                  استعراض هيكل المنهج الحقيقي من قاعدة البيانات:
                  الصف ← الفصل الدراسي ← المادة ← الوحدة ← الدرس.
                </p>
              </div>

              <button
                type="button"
                onClick={loadInitialCurriculum}
                disabled={loading}
                className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'جاري التحميل...'
                  : '🔄 تحديث المنهج'}
              </button>

            </div>


            <div
              className={`mt-5 rounded-2xl border p-4 ${statusClasses[connection.status]}`}
            >
              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-black">
                    حالة النظام
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {connection.message}
                  </p>
                </div>

                <span className="text-2xl">
                  {statusIcons[connection.status]}
                </span>

              </div>
            </div>

          </div>
        </header>


        {/* Error */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-5">
            <p className="text-sm font-bold text-red-300">
              {error}
            </p>
          </div>
        )}


        {/* Statistics */}

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center shadow-lg">
            <p className="text-3xl font-black text-amber-400">
              {grades.length}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              الصفوف
            </p>
          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center shadow-lg">
            <p className="text-3xl font-black text-indigo-400">
              {terms.length}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              الفصول
            </p>
          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center shadow-lg">
            <p className="text-3xl font-black text-emerald-400">
              {subjects.length}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              المواد
            </p>
          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center shadow-lg">
            <p className="text-3xl font-black text-cyan-400">
              {units.length}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              الوحدات
            </p>
          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center shadow-lg">
            <p className="text-3xl font-black text-violet-400">
              {lessons.length}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              الدروس
            </p>
          </div>

        </section>


        {/* Curriculum Selection */}

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-100">
              📚 بنية المنهج
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              الاختيارات التالية مرتبطة مباشرة بالـAPI الحالي
              وبالعلاقات الموجودة في قاعدة البيانات.
            </p>
          </div>


          <div className="grid gap-5 lg:grid-cols-2">

            {/* Grade */}

            <div>
              <label
                htmlFor="studio-grade"
                className="mb-2 block text-sm font-black text-slate-300"
              >
                الصف الدراسي
              </label>

              <select
                id="studio-grade"
                value={selectedGradeId ?? ''}
                disabled={
                  loading ||
                  grades.length === 0
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-100 outline-none transition focus:border-amber-500"
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


            {/* Term */}

            <div>
              <label
                htmlFor="studio-term"
                className="mb-2 block text-sm font-black text-slate-300"
              >
                الفصل الدراسي
              </label>

              <select
                id="studio-term"
                value={selectedTermId ?? ''}
                disabled={
                  loading ||
                  terms.length === 0
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-100 outline-none transition focus:border-indigo-500"
              >
                <option value="">
                  اختر الفصل
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


            {/* Subject */}

            <div>
              <label
                htmlFor="studio-subject"
                className="mb-2 block text-sm font-black text-slate-300"
              >
                المادة
              </label>

              <select
                id="studio-subject"
                value={selectedSubjectId ?? ''}
                disabled={
                  loading ||
                  subjects.length === 0
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
                    handleSubjectChange(value);
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-100 outline-none transition focus:border-emerald-500"
              >
                <option value="">
                  اختر المادة
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.title}
                  </option>
                ))}
              </select>
            </div>


            {/* Unit */}

            <div>
              <label
                htmlFor="studio-unit"
                className="mb-2 block text-sm font-black text-slate-300"
              >
                الوحدة
              </label>

              <select
                id="studio-unit"
                value={selectedUnitId ?? ''}
                disabled={
                  loading ||
                  units.length === 0
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
                    handleUnitChange(value);
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-100 outline-none transition focus:border-cyan-500"
              >
                <option value="">
                  اختر الوحدة
                </option>

                {units.map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                  >
                    {unit.unit_number}. {unit.title}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </section>


        {/* Current Selection */}

        <section className="mb-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">

          <h2 className="text-lg font-black text-amber-400">
            المسار الحالي
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold">

            <span className="rounded-lg bg-slate-900 px-3 py-2 text-slate-300">
              {selectedGrade?.title ?? '—'}
            </span>

            <span className="text-amber-500">
              ←
            </span>

            <span className="rounded-lg bg-slate-900 px-3 py-2 text-slate-300">
              {selectedTerm?.title ?? '—'}
            </span>

            <span className="text-amber-500">
              ←
            </span>

            <span className="rounded-lg bg-slate-900 px-3 py-2 text-slate-300">
              {selectedSubject?.title ?? '—'}
            </span>

            <span className="text-amber-500">
              ←
            </span>

            <span className="rounded-lg bg-slate-900 px-3 py-2 text-slate-300">
              {selectedUnit?.title ?? '—'}
            </span>

          </div>

        </section>


        {/* Units */}

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-black text-slate-100">
                📦 وحدات المادة
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                اختر وحدة لاستعراض الدروس التابعة لها.
              </p>
            </div>

            <span className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-black text-cyan-400">
              {units.length} وحدة
            </span>

          </div>


          {units.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center">
              <p className="text-sm font-bold text-slate-500">
                لا توجد وحدات متاحة لهذه المادة.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {units.map((unit) => {
                const active =
                  unit.id === selectedUnitId;

                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() =>
                      handleUnitChange(
                        unit.id,
                      )
                    }
                    className={`rounded-2xl border p-5 text-right transition ${
                      active
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-cyan-500/50'
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 font-black text-slate-950">
                        {unit.unit_number}
                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="font-black text-slate-100">
                          {unit.title}
                        </h3>

                        {unit.description && (
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                            {unit.description}
                          </p>
                        )}

                      </div>

                    </div>

                  </button>
                );
              })}

            </div>
          )}

        </section>


        {/* Lessons */}

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-black text-slate-100">
                📖 دروس الوحدة
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                الدروس المعروضة هنا هي البيانات الحقيقية
                المرتبطة بالوحدة المحددة في قاعدة البيانات.
              </p>
            </div>

            <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-400">
              {lessons.length} درس
            </span>

          </div>


          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
              <p className="animate-pulse text-sm font-bold text-amber-400">
                جاري تحميل الدروس...
              </p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
              <p className="text-sm font-bold text-slate-500">
                لا توجد دروس متاحة لهذه الوحدة.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">

              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  to={`/lesson/${lesson.id}`}
                  className="group block rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-violet-500/50 hover:bg-violet-500/5"
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500 font-black text-slate-950">
                      {lesson.lesson_number}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                        <h3 className="text-lg font-black text-slate-100 group-hover:text-violet-300">
                          {lesson.title}
                        </h3>

                        <span className="text-xs font-bold text-violet-400">
                          درس #{lesson.lesson_number}
                        </span>

                      </div>

                      {lesson.content_summary && (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {lesson.content_summary}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">

                        {lesson.video_url && (
                          <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                            🎬 فيديو
                          </span>
                        )}

                        {lesson.infographic_url && (
                          <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                            🖼️ إنفوجراف
                          </span>
                        )}

                        {lesson.game_url && (
                          <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                            🎮 لعبة
                          </span>
                        )}

                        <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-500">
                          ID: {lesson.id}
                        </span>

                      </div>

                    </div>

                    <span className="shrink-0 text-xl text-slate-600 transition group-hover:text-violet-400">
                      ←
                    </span>

                  </div>

                </Link>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
};


export default AdminDashboard;