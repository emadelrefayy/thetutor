import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  apiClient,
  type Subject,
  type Unit,
} from "../api/apiClient";

const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{
    subjectId: string;
  }>();

  const [subject, setSubject] =
    useState<Subject | null>(null);

  const [units, setUnits] =
    useState<Unit[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) {
      setSubject(null);
      setUnits([]);
      setError("معرف المادة غير موجود.");
      setLoading(false);
      return;
    }

    const id = Number(subjectId);

    if (!Number.isInteger(id) || id <= 0) {
      setSubject(null);
      setUnits([]);
      setError("معرف المادة غير صالح.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadSubject = async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * Curriculum flow:
         *
         * Subject
         *    ↓
         * Units
         *    ↓
         * UnitPage
         *
         * The backend is the application API.
         * Supabase remains the database source of truth.
         */

        const [subjectData, unitsData] =
          await Promise.all([
            apiClient.getSubject(id),
            apiClient.getUnits(id),
          ]);

        if (cancelled) {
          return;
        }

        if (!subjectData) {
          throw new Error(
            "Subject was not found.",
          );
        }

        setSubject(subjectData);

        setUnits(
          Array.isArray(unitsData)
            ? unitsData
            : [],
        );
      } catch (loadError) {
        console.error(
          "Failed to load subject:",
          loadError,
        );

        if (cancelled) {
          return;
        }

        setSubject(null);
        setUnits([]);

        setError(
          "تعذر تحميل بيانات المادة.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSubject();

    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  /*
   * ============================================================
   * Loading
   * ============================================================
   */

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-8"
      >
        <div className="max-w-5xl mx-auto">
          <section
            className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="text-4xl mb-4">
              📚
            </div>

            <p className="text-sm font-bold text-amber-400 animate-pulse">
              جاري تحميل المادة...
            </p>
          </section>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * Error / Not Found
   * ============================================================
   */

  if (error || !subject) {
    return (
      <main
        dir="rtl"
        className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-8"
      >
        <div className="max-w-xl mx-auto">
          <section
            className="bg-slate-900 border border-red-900/50 rounded-3xl p-8 text-center"
            role="alert"
          >
            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <h1 className="text-xl font-black text-red-400">
              المادة غير متاحة
            </h1>

            <p className="text-sm text-slate-400 leading-7 mt-3">
              {error ??
                "لم يتم العثور على المادة المطلوبة."}
            </p>

            <Link
              to="/student"
              className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400 transition"
            >
              العودة للوحة الطالب
            </Link>
          </section>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * Subject
   * ============================================================
   */

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-6 sm:py-8"
    >
      <div className="max-w-5xl mx-auto pb-12">

        {/* Back navigation */}

        <Link
          to="/student"
          className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold transition"
        >
          → العودة للوحة الطالب
        </Link>

        {/* Subject header */}

        <header className="mt-6 mb-8">
          <div className="flex items-start gap-4">

            <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
              {subject.icon_name ||
                "📚"}
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black">
                المادة الدراسية
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-amber-400 mt-3">
                {subject.title}
              </h1>

              {subject.code && (
                <p className="text-xs text-slate-500 mt-2">
                  كود المادة:{" "}
                  {subject.code}
                </p>
              )}
            </div>

          </div>
        </header>

        {/* Units */}

        <section
          aria-labelledby="subject-units-title"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

            <div>
              <h2
                id="subject-units-title"
                className="text-xl sm:text-2xl font-black"
              >
                وحدات المادة
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                اختر الوحدة لعرض الدروس الخاصة بها.
              </p>
            </div>

            <span className="text-xs text-slate-500">
              {units.length}{" "}
              {units.length === 1
                ? "وحدة"
                : "وحدات"}
            </span>

          </div>

          {units.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

              <div className="text-5xl">
                📚
              </div>

              <h3 className="text-lg font-black text-slate-200 mt-4">
                لا توجد وحدات متاحة
              </h3>

              <p className="text-sm text-slate-500 leading-7 mt-2">
                لا توجد وحدات مسجلة لهذه المادة حاليًا.
              </p>

              <Link
                to="/student"
                className="inline-flex mt-5 text-sm text-amber-400 hover:text-amber-300 font-bold"
              >
                العودة للوحة الطالب
              </Link>

            </div>
          ) : (
            <div className="space-y-3">

              {units.map(
                (unit, index) => {
                  const unitNumber =
                    Number.isInteger(
                      unit.unit_number,
                    ) &&
                    unit.unit_number > 0
                      ? unit.unit_number
                      : index + 1;

                  return (
                    <Link
                      key={unit.id}
                      to={`/unit/${unit.id}`}
                      className="group block bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all"
                    >
                      <div className="flex items-start gap-4">

                        {/* Unit number */}

                        <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                          {unitNumber}
                        </div>

                        {/* Unit content */}

                        <div className="flex-1 min-w-0">

                          <div className="flex items-start justify-between gap-3">

                            <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-amber-400 transition">
                              {unit.title}
                            </h3>

                            <span
                              aria-hidden="true"
                              className="shrink-0 text-amber-400 transition-transform group-hover:-translate-x-1"
                            >
                              ◀
                            </span>

                          </div>

                          {unit.description && (
                            <p className="text-xs sm:text-sm text-slate-400 leading-6 mt-2">
                              {unit.description}
                            </p>
                          )}

                          <div className="mt-4 text-[10px] text-slate-600 font-bold">
                            فتح الوحدة ←
                          </div>

                        </div>

                      </div>
                    </Link>
                  );
                },
              )}

            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default SubjectPage;