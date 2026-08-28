import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../api/apiClient";

interface Grade {
  id: number;
  title: string;
  level_code?: number | null;
  code?: string | null;
}

interface Term {
  id: number;
  grade_id: number;
  title: string;
  code?: string | null;
}

interface Subject {
  id: number;
  term_id: number;
  title: string;
  code: string;
  icon_name?: string | null;
  color_theme?: string | null;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedGrade, setSelectedGrade] =
    useState<number | null>(null);

  const [selectedTerm, setSelectedTerm] =
    useState<number | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loadingGrades, setLoadingGrades] =
    useState(true);

  const [loadingTerms, setLoadingTerms] =
    useState(false);

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  const [gradesError, setGradesError] =
    useState<string | null>(null);

  const [termsError, setTermsError] =
    useState<string | null>(null);

  const [subjectsError, setSubjectsError] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------
   * Load grades
   * ------------------------------------------------------------
   *
   * Database:
   * grades
   *
   * API:
   * GET /api/grades
   */

  useEffect(() => {
    let active = true;

    const loadGrades = async () => {
      setLoadingGrades(true);
      setGradesError(null);

      try {
        const data = await apiClient.getGrades();

        if (!active) {
          return;
        }

        const loadedGrades = Array.isArray(data)
          ? (data as Grade[])
          : [];

        setGrades(loadedGrades);

        if (loadedGrades.length === 0) {
          setSelectedGrade(null);
          return;
        }

        setSelectedGrade((current) => {
          if (
            current !== null &&
            loadedGrades.some(
              (grade) => grade.id === current,
            )
          ) {
            return current;
          }

          return loadedGrades[0].id;
        });
      } catch (error) {
        console.error(
          "Failed to load grades:",
          error,
        );

        if (!active) {
          return;
        }

        setGrades([]);
        setSelectedGrade(null);
        setGradesError(
          "تعذر تحميل الصفوف الدراسية.",
        );
      } finally {
        if (active) {
          setLoadingGrades(false);
        }
      }
    };

    loadGrades();

    return () => {
      active = false;
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * Load terms for selected grade
   * ------------------------------------------------------------
   *
   * Database:
   * terms.grade_id -> grades.id
   *
   * API:
   * GET /api/grades/{grade_id}/terms
   *
   * IMPORTANT:
   * Use getGradeTerms(), not the obsolete getTerms().
   */

  useEffect(() => {
    if (selectedGrade === null) {
      setTerms([]);
      setSelectedTerm(null);
      setSubjects([]);
      setTermsError(null);
      return;
    }

    let active = true;

    const loadTerms = async () => {
      setLoadingTerms(true);
      setTermsError(null);
      setTerms([]);
      setSelectedTerm(null);
      setSubjects([]);

      try {
        const data =
          await apiClient.getGradeTerms(
            selectedGrade,
          );

        if (!active) {
          return;
        }

        const loadedTerms = Array.isArray(data)
          ? (data as Term[])
          : [];

        setTerms(loadedTerms);

        if (loadedTerms.length > 0) {
          setSelectedTerm(
            loadedTerms[0].id,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load terms:",
          error,
        );

        if (!active) {
          return;
        }

        setTerms([]);
        setSelectedTerm(null);
        setSubjects([]);
        setTermsError(
          "تعذر تحميل الفصول الدراسية.",
        );
      } finally {
        if (active) {
          setLoadingTerms(false);
        }
      }
    };

    loadTerms();

    return () => {
      active = false;
    };
  }, [selectedGrade]);

  /*
   * ------------------------------------------------------------
   * Load subjects for selected term
   * ------------------------------------------------------------
   *
   * Database:
   * subjects.term_id -> terms.id
   *
   * API:
   * GET /api/terms/{term_id}/subjects
   *
   * IMPORTANT:
   * Use getTermSubjects(), not the obsolete getSubjects().
   */

  useEffect(() => {
    if (selectedTerm === null) {
      setSubjects([]);
      setSubjectsError(null);
      return;
    }

    let active = true;

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setSubjectsError(null);
      setSubjects([]);

      try {
        const data =
          await apiClient.getTermSubjects(
            selectedTerm,
          );

        if (!active) {
          return;
        }

        const loadedSubjects =
          Array.isArray(data)
            ? (data as Subject[])
            : [];

        setSubjects(loadedSubjects);
      } catch (error) {
        console.error(
          "Failed to load subjects:",
          error,
        );

        if (!active) {
          return;
        }

        setSubjects([]);
        setSubjectsError(
          "تعذر تحميل المواد الدراسية.",
        );
      } finally {
        if (active) {
          setLoadingSubjects(false);
        }
      }
    };

    loadSubjects();

    return () => {
      active = false;
    };
  }, [selectedTerm]);

  /*
   * ------------------------------------------------------------
   * Search subjects
   * ------------------------------------------------------------
   */

  const filteredSubjects = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return subjects;
    }

    return subjects.filter((subject) => {
      const title =
        subject.title?.toLowerCase() ?? "";

      const code =
        subject.code?.toLowerCase() ?? "";

      return (
        title.includes(query) ||
        code.includes(query)
      );
    });
  }, [subjects, searchQuery]);

  /*
   * ------------------------------------------------------------
   * Selected grade / term labels
   * ------------------------------------------------------------
   */

  const selectedGradeTitle =
    grades.find(
      (grade) =>
        grade.id === selectedGrade,
    )?.title ?? "";

  const selectedTermTitle =
    terms.find(
      (term) =>
        term.id === selectedTerm,
    )?.title ?? "";

  /*
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <main
      className="max-w-6xl mx-auto px-4 py-6 sm:py-8 text-slate-100"
      dir="rtl"
    >
      <div className="space-y-6 pb-12">

        {/* -------------------------------------------------- */}
        {/* Header */}
        {/* -------------------------------------------------- */}

        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-3">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
              🎓 الطالب
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-amber-400">
              لوحة الطالب
            </h1>

            <p className="text-sm text-slate-400 leading-6">
              اختر الصف ثم الترم للوصول إلى المواد
              الدراسية والوحدات والدروس.
            </p>

            {(selectedGradeTitle ||
              selectedTermTitle) && (
              <div className="flex flex-wrap gap-2 pt-1">

                {selectedGradeTitle && (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                    الصف:{" "}
                    <span className="text-amber-400">
                      {selectedGradeTitle}
                    </span>
                  </span>
                )}

                {selectedTermTitle && (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                    الترم:{" "}
                    <span className="text-amber-400">
                      {selectedTermTitle}
                    </span>
                  </span>
                )}

              </div>
            )}

          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* Grades */}
        {/* -------------------------------------------------- */}

        <section className="space-y-3">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-200">
              🔢 الصف الدراسي
            </h2>

            {grades.length > 0 && (
              <span className="text-[10px] text-slate-500">
                {grades.length} صفوف
              </span>
            )}
          </div>

          {loadingGrades ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-xs text-amber-400 animate-pulse font-bold">
                جاري تحميل الصفوف...
              </p>
            </div>
          ) : gradesError ? (
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 text-center">
              <p className="text-sm text-red-400 font-bold">
                {gradesError}
              </p>
            </div>
          ) : grades.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-400">
                لا توجد صفوف دراسية متاحة حاليًا.
              </p>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
              {grades.map((grade) => {
                const isSelected =
                  selectedGrade === grade.id;

                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() =>
                      setSelectedGrade(
                        grade.id,
                      )
                    }
                    aria-pressed={isSelected}
                    className={`shrink-0 px-5 py-3 rounded-xl border text-xs font-extrabold transition-all ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-amber-400"
                    }`}
                  >
                    {grade.title}
                  </button>
                );
              })}
            </div>
          )}

        </section>

        {/* -------------------------------------------------- */}
        {/* Terms */}
        {/* -------------------------------------------------- */}

        <section className="space-y-3">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-200">
              📚 الترم الدراسي
            </h2>

            {terms.length > 0 && (
              <span className="text-[10px] text-slate-500">
                {terms.length} فصول
              </span>
            )}
          </div>

          {loadingTerms ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-xs text-amber-400 animate-pulse font-bold">
                جاري تحميل الفصول...
              </p>
            </div>
          ) : termsError ? (
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 text-center">
              <p className="text-sm text-red-400 font-bold">
                {termsError}
              </p>
            </div>
          ) : terms.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-400">
                لا توجد فصول دراسية لهذا الصف.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {terms.map((term) => {
                const isSelected =
                  selectedTerm === term.id;

                return (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() =>
                      setSelectedTerm(
                        term.id,
                      )
                    }
                    aria-pressed={isSelected}
                    className={`text-right rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg"
                        : "bg-slate-900 text-slate-200 border-slate-800 hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">

                      <div className="min-w-0">
                        <h3 className="font-black text-sm">
                          {term.title}
                        </h3>

                        {term.code && (
                          <p
                            className={`text-[10px] mt-1 ${
                              isSelected
                                ? "text-slate-800"
                                : "text-slate-500"
                            }`}
                          >
                            {term.code}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-xs ${
                          isSelected
                            ? "text-slate-950"
                            : "text-amber-400"
                        }`}
                        aria-hidden="true"
                      >
                        ◀
                      </span>

                    </div>
                  </button>
                );
              })}

            </div>
          )}

        </section>

        {/* -------------------------------------------------- */}
        {/* Subject search */}
        {/* -------------------------------------------------- */}

        <section className="space-y-3">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-200">
              📖 المواد الدراسية
            </h2>

            {subjects.length > 0 && (
              <span className="text-[10px] text-slate-500">
                {filteredSubjects.length} مادة
              </span>
            )}
          </div>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            disabled={
              loadingSubjects ||
              subjects.length === 0
            }
            placeholder="🔍 ابحث عن مادة..."
            aria-label="البحث عن مادة"
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
          />

        </section>

        {/* -------------------------------------------------- */}
        {/* Subjects */}
        {/* -------------------------------------------------- */}

        <section>

          {loadingSubjects ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <p className="text-xs text-amber-400 animate-pulse font-bold">
                جاري تحميل المواد الدراسية...
              </p>
            </div>
          ) : subjectsError ? (
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-10 text-center">
              <p className="text-sm text-red-400 font-bold">
                {subjectsError}
              </p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <p className="text-sm text-slate-400 font-bold">
                {subjects.length === 0
                  ? "لا توجد مواد متاحة لهذا الترم حاليًا."
                  : "لا توجد مادة تطابق البحث الحالي."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {filteredSubjects.map(
                (subject, index) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/subject/${subject.id}`,
                      )
                    }
                    className="text-right bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-lg group"
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                          {subject.icon_name ||
                            "📚"}
                        </div>

                        <div className="min-w-0">

                          <h3 className="text-base font-black text-slate-100 group-hover:text-amber-400 transition-all">
                            {subject.title}
                          </h3>

                          {subject.code && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              {subject.code}
                            </p>
                          )}

                        </div>

                      </div>

                      <span
                        className="text-amber-400 text-sm shrink-0"
                        aria-hidden="true"
                      >
                        ◀
                      </span>

                    </div>

                    {subject.color_theme && (
                      <div className="mt-4 pt-3 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500">
                          المادة الدراسية
                        </span>
                      </div>
                    )}

                    {index >= 0 && (
                      <span className="sr-only">
                        مادة رقم {index + 1}
                      </span>
                    )}

                  </button>
                ),
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
};

export { StudentDashboard };

export default StudentDashboard;