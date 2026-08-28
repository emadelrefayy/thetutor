import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../api/apiClient";

interface Lesson {
  id: number;
  unit_id?: number | null;
  subject_id?: number | null;
  title: string;
  unit_number?: number | null;
  lesson_number?: number | null;
  content_summary?: string | null;
  video_url?: string | null;
  infographic_url?: string | null;
  game_url?: string | null;
  created_at?: string | null;
}

const UnitPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unitId) {
      setLessons([]);
      setError("معرف الوحدة غير صالح.");
      setLoading(false);
      return;
    }

    const id = Number(unitId);

    if (!Number.isInteger(id) || id <= 0) {
      setLessons([]);
      setError("معرف الوحدة غير صالح.");
      setLoading(false);
      return;
    }

    let active = true;

    const loadLessons = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.getLessons(id);

        if (!active) {
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid lessons response.");
        }

        setLessons(data as Lesson[]);
      } catch (err) {
        console.error(
          "Failed to load unit lessons:",
          err,
        );

        if (!active) {
          return;
        }

        setLessons([]);
        setError("تعذر تحميل دروس الوحدة.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLessons();

    return () => {
      active = false;
    };
  }, [unitId]);

  return (
    <main
      className="max-w-4xl mx-auto px-4 py-8 text-slate-100"
      dir="rtl"
    >
      {/* Navigation */}

      <Link
        to="/student"
        className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold"
      >
        ← العودة للمناهج
      </Link>

      {/* Header */}

      <header className="mt-6 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
          📖 الوحدة الدراسية
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-amber-400 mt-3">
          دروس الوحدة
        </h1>

        <p className="text-sm text-slate-400 mt-2 leading-6">
          اختر الدرس لبدء التعلم.
        </p>
      </header>

      {/* Loading */}

      {loading && (
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-amber-400 animate-pulse font-bold">
            جاري تحميل الدروس...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div
          className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center"
          role="alert"
        >
          <h2 className="text-lg font-black text-red-400">
            تعذر تحميل الوحدة
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        lessons.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">
              📚
            </div>

            <h2 className="text-lg font-black text-slate-200">
              لا توجد دروس متاحة
            </h2>

            <p className="text-sm text-slate-400 mt-2 leading-6">
              لا توجد دروس مسجلة لهذه الوحدة حاليًا.
            </p>

            <Link
              to="/student"
              className="inline-block mt-5 text-sm text-amber-400 hover:text-amber-300 font-bold"
            >
              العودة للمناهج
            </Link>
          </div>
        )}

      {/* Lessons */}

      {!loading &&
        !error &&
        lessons.length > 0 && (
          <section aria-labelledby="unit-lessons-title">
            <div className="flex items-center justify-between mb-5">
              <h2
                id="unit-lessons-title"
                className="text-xl md:text-2xl font-black"
              >
                دروس الوحدة
              </h2>

              <span className="text-xs text-slate-500">
                {lessons.length}{" "}
                {lessons.length === 1
                  ? "درس"
                  : "دروس"}
              </span>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const lessonNumber =
                  lesson.lesson_number ??
                  index + 1;

                const hasVideo =
                  Boolean(lesson.video_url);

                const hasInfographic =
                  Boolean(
                    lesson.infographic_url,
                  );

                const hasGame =
                  Boolean(lesson.game_url);

                return (
                  <Link
                    key={lesson.id}
                    to={`/lesson/${lesson.id}`}
                    className="group block bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition-all shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      {/* Lesson number */}

                      <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-black">
                        {lessonNumber}
                      </div>

                      {/* Lesson information */}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                          {lesson.title}
                        </h3>

                        {lesson.content_summary && (
                          <p className="text-sm text-slate-400 mt-2 leading-6">
                            {lesson.content_summary}
                          </p>
                        )}

                        {/* Available lesson resources */}

                        {(hasVideo ||
                          hasInfographic ||
                          hasGame) && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {hasVideo && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold">
                                🎥 فيديو
                              </span>
                            )}

                            {hasInfographic && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold">
                                🖼️ إنفوجراف
                              </span>
                            )}

                            {hasGame && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                                🎮 لعبة
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}

                      <span className="text-amber-400 shrink-0 mt-2 transition-transform group-hover:-translate-x-1">
                        ◀
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
    </main>
  );
};

export default UnitPage;