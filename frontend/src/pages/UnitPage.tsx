import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  apiClient,
  type Lesson,
  type Unit,
} from '../api/apiClient';

const UnitPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unitId) {
      setUnit(null);
      setLessons([]);
      setError('معرف الوحدة غير صالح.');
      setLoading(false);
      return;
    }

    const id = Number(unitId);

    if (!Number.isInteger(id) || id <= 0) {
      setUnit(null);
      setLessons([]);
      setError('معرف الوحدة غير صالح.');
      setLoading(false);
      return;
    }

    let active = true;

    const loadUnit = async () => {
      setLoading(true);
      setError(null);

      try {
        const [unitData, lessonsData] = await Promise.all([
          apiClient.getUnit(id),
          apiClient.getUnitLessons(id),
        ]);

        if (!active) {
          return;
        }

        if (
          !unitData ||
          typeof unitData !== 'object'
        ) {
          throw new Error('Invalid unit response.');
        }

        if (!Array.isArray(lessonsData)) {
          throw new Error('Invalid lessons response.');
        }

        setUnit(unitData);
        setLessons(lessonsData);
      } catch (err) {
        console.error(
          'Failed to load unit:',
          err,
        );

        if (!active) {
          return;
        }

        setUnit(null);
        setLessons([]);
        setError('تعذر تحميل بيانات الوحدة.');
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

  if (loading) {
    return (
      <main
        className="max-w-4xl mx-auto px-4 py-10 text-slate-100"
        dir="rtl"
      >
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-amber-400 font-bold animate-pulse">
            جاري تحميل الوحدة...
          </p>
        </div>
      </main>
    );
  }

  if (error || !unit) {
    return (
      <main
        className="max-w-4xl mx-auto px-4 py-10 text-slate-100"
        dir="rtl"
      >
        <div
          className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center"
          role="alert"
        >
          <div className="text-4xl mb-4">
            ⚠️
          </div>

          <h1 className="text-xl font-black text-red-400">
            الوحدة غير متاحة
          </h1>

          <p className="text-sm text-slate-400 mt-3 leading-6">
            {error ?? 'لم يتم العثور على الوحدة.'}
          </p>

          <Link
            to="/student"
            className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400 transition-colors"
          >
            العودة للمناهج
          </Link>
        </div>
      </main>
    );
  }

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

      {/* Unit Header */}

      <header className="mt-6 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
          📖 الوحدة الدراسية
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black">
            {unit.unit_number ?? '—'}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-amber-400">
              {unit.title}
            </h1>

            {unit.description && (
              <p className="text-slate-300 mt-3 leading-7">
                {unit.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Lessons */}

      <section aria-labelledby="unit-lessons-title">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              id="unit-lessons-title"
              className="text-xl md:text-2xl font-black"
            >
              دروس الوحدة
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              اختر الدرس لبدء التعلم.
            </p>
          </div>

          <span className="text-xs text-slate-500">
            {lessons.length}{' '}
            {lessons.length === 1
              ? 'درس'
              : 'دروس'}
          </span>
        </div>

        {lessons.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">
              📚
            </div>

            <h3 className="text-lg font-black text-slate-200">
              لا توجد دروس متاحة
            </h3>

            <p className="text-sm text-slate-400 mt-2 leading-6">
              لا توجد دروس مسجلة لهذه الوحدة حاليًا.
            </p>

            <Link
              to="/student"
              className="inline-flex items-center justify-center mt-5 text-sm text-amber-400 hover:text-amber-300 font-bold"
            >
              العودة للمناهج
            </Link>
          </div>
        ) : (
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
                    {/* Lesson Number */}

                    <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-black">
                      {lessonNumber}
                    </div>

                    {/* Lesson Information */}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-xl font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                        {lesson.title}
                      </h3>

                      {lesson.content_summary && (
                        <p className="text-sm text-slate-400 mt-2 leading-6">
                          {lesson.content_summary}
                        </p>
                      )}

                      {/* Lesson Resources */}

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
        )}
      </section>
    </main>
  );
};

export default UnitPage;