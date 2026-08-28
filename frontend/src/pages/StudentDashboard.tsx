import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../api/apiClient";

interface Grade {
  id: number;
  name: string;
}

interface Term {
  id: number;
  name?: string;
  title?: string;
  term_number?: number;
}

interface Subject {
  id: number;
  title: string;
  code?: string | null;
  term_id: number;
}

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedGrade, setSelectedGrade] =
    useState<number | null>(null);

  const [selectedTerm, setSelectedTerm] =
    useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [gradesError, setGradesError] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [subjectsError, setSubjectsError] = useState(false);

  // ------------------------------------------------------------
  // Load grades
  // ------------------------------------------------------------

  useEffect(() => {
    let active = true;

    const loadGrades = async () => {
      setLoadingGrades(true);
      setGradesError(false);

      try {
        const data = await apiClient.getGrades();

        if (!active) return;

        const loadedGrades = Array.isArray(data)
          ? (data as Grade[])
          : [];

        setGrades(loadedGrades);

        if (loadedGrades.length > 0) {
          setSelectedGrade((current) =>
            current !== null ? current : loadedGrades[0].id,
          );
        } else {
          setSelectedGrade(null);
        }
      } catch (error) {
        console.error("Failed to load grades:", error);

        if (active) {
          setGrades([]);
          setSelectedGrade(null);
          setGradesError(true);
        }
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

  // ------------------------------------------------------------
  // Load terms for selected grade
  // ------------------------------------------------------------

  useEffect(() => {
    if (selectedGrade === null) {
      setTerms([]);
      setSelectedTerm(null);
      setSubjects([]);
      return;
    }

    let active = true;

    const loadTerms = async () => {
      setLoadingTerms(true);
      setTermsError(false);
      setTerms([]);
      setSelectedTerm(null);
      setSubjects([]);

      try {
        const data = await apiClient.getTerms(selectedGrade);

        if (!active) return;

        const loadedTerms = Array.isArray(data)
          ? (data as Term[])
          : [];

        setTerms(loadedTerms);

        if (loadedTerms.length > 0) {
          setSelectedTerm(loadedTerms[0].id);
        }
      } catch (error) {
        console.error("Failed to load terms:", error);

        if (active) {
          setTerms([]);
          setSelectedTerm(null);
          setTermsError(true);
        }
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

  // ------------------------------------------------------------
  // Load subjects for selected term
  // ------------------------------------------------------------

  useEffect(() => {
    if (selectedTerm === null) {
      setSubjects([]);
      return;
    }

    let active = true;

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setSubjectsError(false);
      setSubjects([]);

      try {
        const data = await apiClient.getSubjects(selectedTerm);

        if (!active) return;

        const loadedSubjects = Array.isArray(data)
          ? (data as Subject[])
          : [];

        setSubjects(loadedSubjects);
      } catch (error) {
        console.error("Failed to load subjects:", error);

        if (active) {
          setSubjects([]);
          setSubjectsError(true);
        }
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

  // ------------------------------------------------------------
  // Search
  // ------------------------------------------------------------

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return subjects;
    }

    return subjects.filter((subject) =>
      subject.title.toLowerCase().includes(query),
    );
  }, [subjects, searchQuery]);

  const selectedGradeName =
    grades.find((grade) => grade.id === selectedGrade)?.name ?? "";

  const getTermName = (term: Term, index: number) => {
    if (typeof term.name === "string" && term.name.trim()) {
      return term.name;
    }

    if (typeof term.title === "string" && term.title.trim()) {
      return term.title;
    }

    if (typeof term.term_number === "number") {
      return `الترم ${term.term_number}`;
    }

    return `الترم ${index + 1}`;
  };

  return (
    <div
      className="space-y-6 dir-rtl text-slate-100 pb-12"
      dir="rtl"
    >
      {/* Header */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
            🏫 المدرسة - لوحة المناهج
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-amber-400">
            لوحة المناهج والدروس
          </h1>

          {selectedGradeName && (
            <p className="text-xs text-slate-400">
              {selectedGradeName}
            </p>
          )}
        </div>
      </div>

      {/* Grades */}

      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-400">
          🔢 اختر الصف:
        </label>

        {loadingGrades ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-amber-400 animate-pulse font-bold">
              جاري تحميل الصفوف...
            </p>
          </div>
        ) : gradesError ? (
          <div className="p-6 bg-slate-900 border border-red-900/50 rounded-2xl">
            <p className="text-xs text-red-400 font-bold">
              تعذر تحميل الصفوف. تحقق من اتصال المنصة بالخادم.
            </p>
          </div>
        ) : grades.length === 0 ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">
              لا توجد صفوف دراسية متاحة حاليًا.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
            {grades.map((grade) => (
              <button
                key={grade.id}
                type="button"
                onClick={() => setSelectedGrade(grade.id)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedGrade === grade.id
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                {grade.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Terms */}

      <div className="space-y-2">
        <label className="text-xs font-bold text-amber-400">
          📚 اختر الترم:
        </label>

        {loadingTerms ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-amber-400 animate-pulse font-bold">
              جاري تحميل الترم...
            </p>
          </div>
        ) : termsError ? (
          <div className="p-6 bg-slate-900 border border-red-900/50 rounded-2xl">
            <p className="text-xs text-red-400 font-bold">
              تعذر تحميل الفصول الدراسية.
            </p>
          </div>
        ) : terms.length === 0 ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">
              لا توجد فصول دراسية متاحة لهذا الصف.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {terms.map((term, index) => (
              <button
                key={term.id}
                type="button"
                onClick={() => setSelectedTerm(term.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTerm === term.id
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {getTermName(term, index)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search */}

      <input
        type="search"
        placeholder="🔍 ابحث عن مادة..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        disabled={subjects.length === 0}
        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
        aria-label="البحث عن مادة"
      />

      {/* Subjects */}

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300">
          {selectedGradeName
            ? `مواد ${selectedGradeName}`
            : "المواد الدراسية"}
        </h2>

        {loadingSubjects ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-amber-400 animate-pulse font-bold">
              جاري تحميل المواد...
            </p>
          </div>
        ) : subjectsError ? (
          <div className="p-8 text-center bg-slate-900 border border-red-900/50 rounded-2xl">
            <p className="text-sm font-bold text-red-400">
              تعذر تحميل المواد الدراسية.
            </p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-sm font-bold text-slate-400">
              {subjects.length === 0
                ? "لا توجد مواد مسجلة لهذا الترم حاليًا."
                : "لا توجد مادة تطابق البحث الحالي."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSubjects.map((subject, index) => (
              <button
                key={subject.id}
                type="button"
                onClick={() =>
                  navigate(`/subject/${subject.id}`)
                }
                className="text-right bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl cursor-pointer transition-all shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-100 group-hover:text-amber-400 transition-all">
                      {subject.title}
                    </h3>

                    {subject.code && (
                      <p className="text-[10px] text-slate-400">
                        كود المادة: {subject.code}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs text-amber-400">
                  ◀
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;