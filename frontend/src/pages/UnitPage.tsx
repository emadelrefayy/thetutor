import React, { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  apiClient,
  type Lesson,
  type Unit,
} from "../api/apiClient";

const UnitPage: React.FC = () => {
  const { unitId } =
    useParams<{
      unitId: string;
    }>();

  const [unit, setUnit] =
    useState<Unit | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!unitId) {
      setError(
        "معرف الوحدة غير موجود.",
      );
      setLoading(false);
      return;
    }

    const parsedId =
      Number(unitId);

    if (
      !Number.isInteger(parsedId) ||
      parsedId <= 0
    ) {
      setError(
        "معرف الوحدة غير صالح.",
      );
      setLoading(false);
      return;
    }

    let active = true;

    const loadUnit = async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * Curriculum source of truth:
         *
         * units
         *   ↓
         * lessons.unit_id
         *
         * Backend:
         *
         * GET /api/units/{unit_id}
         * GET /api/units/{unit_id}/lessons
         */

        const [
          unitData,
          lessonData,
        ] = await Promise.all([
          apiClient.getUnit(
            parsedId,
          ),
          apiClient.getUnitLessons(
            parsedId,
          ),
        ]);

        if (!active) {
          return;
        }

        setUnit(unitData);

        setLessons(
          Array.isArray(
            lessonData,
          )
            ? lessonData
            : [],
        );
      } catch (loadError) {
        console.error(
          "Unit loading error:",
          loadError,
        );

        if (!active) {
          return;
        }

        setUnit(null);
        setLessons([]);

        setError(
          "تعذر تحميل الوحدة والدروس الخاصة بها.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUnit();

    return () => {
      active = false;
    };
  }, [unitId]);

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
              📖
            </div>

            <p className="text-sm text-amber-400 font-bold animate-pulse">
              جاري تحميل الوحدة...
            </p>
          </section>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * Error
   * ============================================================
   */

  if (error || !unit) {
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
              الوحدة غير متاحة
            </h1>

            <p className="text-sm text-slate-400 mt-3 leading-7">
              {error ??
                "لم يتم العثور على الوحدة."}
            </p>

            <Link
              to="/student"
              className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition"
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
   * Main Unit
   * ============================================================
   */

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-6 sm:py-8"
    >
      <div className="max-w-5xl mx-auto pb-12">

        {/* Back */}

        <Link
          to="/student"
          className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold transition"
        >
          → العودة للوحة الطالب
        </Link>

        {/* Unit header */}

        <header className="mt-6 mb-8">

          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
            📖 وحدة دراسية
          </div>

          <div className="mt-4 flex items-start gap-4">

            <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black">
              {unit.unit_number}
            </div>

            <div className="min-w-0">

              <h1 className="text-3xl sm:text-4xl font-black text-amber-400">
                {unit.title}
              </h1>

              {unit.description && (
                <p className="text-sm sm:text-base text-slate-400 leading-7 mt-3 max-w-3xl">
                  {unit.description}
                </p>
              )}

            </div>

          </div>

        </header>

        {/* Lessons */}

        <section
          aria-labelledby="unit-lessons-title"
        >

          <div className="flex items-end justify-between gap-4 mb-5">

            <div>

              <h2
                id="unit-lessons-title"
                className="text-xl sm:text-2xl font-black"
              >
                دروس الوحدة
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                اختر الدرس لبدء التعلم.
              </p>

            </div>

            <span className="shrink-0 text-xs text-slate-500">
              {lessons.length} درس
            </span>

          </div>

          {lessons.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

              <div className="text-5xl">
                📚
              </div>

              <h3 className="text-lg font-black text-slate-200 mt-4">
                لا توجد دروس متاحة
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                لا توجد دروس مرتبطة بهذه الوحدة حاليًا.
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

              {lessons.map(
                (
                  lesson,
                  index,
                ) => {
                  const lessonNumber =
                    Number.isInteger(
                      lesson.lesson_number,
                    ) &&
                    lesson.lesson_number >
                      0
                      ? lesson.lesson_number
                      : index + 1;

                  const hasVideo =
                    Boolean(
                      lesson.video_url,
                    );

                  const hasInfographic =
                    Boolean(
                      lesson.infographic_url,
                    );

                  const hasGame =
                    Boolean(
                      lesson.game_url,
                    );

                  return (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className="group block bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all"
                    >
                      <div className="flex items-start gap-4">

                        {/* Number */}

                        <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-black">
                          {lessonNumber}
                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1">

                          <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-amber-400 transition">
                            {lesson.title}
                          </h3>

                          {lesson.content_summary && (
                            <p className="text-xs sm:text-sm text-slate-400 leading-6 mt-2">
                              {
                                lesson.content_summary
                              }
                            </p>
                          )}

                          {/* Available resources */}

                          {(hasVideo ||
                            hasInfographic ||
                            hasGame) && (
                            <div className="flex flex-wrap gap-2 mt-3">

                              {hasVideo && (
                                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold">
                                  🎥 فيديو
                                </span>
                              )}

                              {hasInfographic && (
                                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold">
                                  🖼️ إنفوجراف
                                </span>
                              )}

                              {hasGame && (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                  🎮 لعبة
                                </span>
                              )}

                            </div>
                          )}

                        </div>

                        {/* Arrow */}

                        <span className="shrink-0 text-amber-400 mt-2 transition-transform group-hover:-translate-x-1">
                          ◀
                        </span>

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

export default UnitPage;