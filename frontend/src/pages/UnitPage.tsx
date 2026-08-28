import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../api/apiClient";

interface Lesson {
  id: number;
  title: string;
  description?: string | null;
  lesson_number?: number | null;
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

        if (!active) return;

        setLessons(
          Array.isArray(data)
            ? (data as Lesson[])
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load unit lessons:",
          err,
        );

        if (!active) return;

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
      {/* Header */}

      <div className="mb-8">
        <Link
          to="/student"
          className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold"
        >
          → العودة للمناهج
        </Link>

        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold mt-5">
          📖 الوحدة الدراسية
        </div>

        <h1 className="text-3xl font-black text-amber-400 mt-3">
          دروس الوحدة
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          اختر الدرس لبدء التعلم.
        </p>
      </div>

      {/* Loading */}

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-amber-400 animate-pulse font-bold">
            جاري تحميل الدروس...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center">
          <p className="text-sm text-red-400 font-bold">
            {error}
          </p>

          <Link
            to="/student"
            className="inline-block mt-5 text-sm text-amber-400 hover:text-amber-300 font-bold"
          >
            العودة للمناهج
          </Link>
        </div>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        lessons.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-400">
              لا توجد دروس مسجلة لهذه الوحدة حاليًا.
            </p>
          </div>
        )}

      {/* Lessons */}

      {!loading &&
        !error &&
        lessons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black">
                دروس الوحدة
              </h2>

              <span className="text-xs text-slate-500">
                {lessons.length} درس
              </span>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  to={`/lesson/${lesson.id}`}
                  className="block bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition-all shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-black">
                      {lesson.lesson_number ?? index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-black text-slate-100">
                        {lesson.title}
                      </h2>

                      {lesson.description && (
                        <p className="text-sm text-slate-400 mt-1 leading-6">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    <span className="text-amber-400 shrink-0">
                      ◀
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
    </main>
  );
};

export default UnitPage;