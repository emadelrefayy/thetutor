import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import { apiClient } from "../api/apiClient";


interface Lesson {
  id: number;
  title: string;
  description?: string | null;
  lesson_number?: number;
}


const UnitPage: React.FC = () => {
  const { unitId } =
    useParams<{ unitId: string }>();

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    if (!unitId) return;

    const id = Number(unitId);

    if (!Number.isInteger(id)) {
      setError("معرف الوحدة غير صالح.");
      setLoading(false);
      return;
    }

    let active = true;

    const loadLessons = async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await apiClient.getLessons(id);

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

        if (active) {
          setLessons([]);
          setError(
            "تعذر تحميل دروس الوحدة.",
          );
        }
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
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      dir="rtl"
    >
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">

        <div className="mb-8">

          <Link
            to="/student"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            ← العودة للمناهج
          </Link>

          <h1 className="text-3xl font-black text-amber-400 mt-4">
            📖 دروس الوحدة
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            اختر الدرس لبدء التعلم.
          </p>

        </div>


        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-sm text-amber-400 animate-pulse font-bold">
              جاري تحميل الدروس...
            </p>
          </div>
        )}


        {!loading && error && (
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center">
            <p className="text-sm text-red-400 font-bold">
              {error}
            </p>
          </div>
        )}


        {!loading &&
          !error &&
          lessons.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-400">
                لا توجد دروس مسجلة لهذه الوحدة حاليًا.
              </p>
            </div>
          )}


        {!loading &&
          !error &&
          lessons.length > 0 && (
            <div className="space-y-3">

              {lessons.map(
                (lesson, index) => (
                  <Link
                    key={lesson.id}
                    to={`/lesson/${lesson.id}`}
                    className="block bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition-all"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-black">
                        {lesson.lesson_number ??
                          index + 1}
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-lg font-black text-slate-100">
                          {lesson.title}
                        </h2>

                        {lesson.description && (
                          <p className="text-sm text-slate-400 mt-1">
                            {lesson.description}
                          </p>
                        )}

                      </div>

                      <span className="mr-auto text-amber-400">
                        ◀
                      </span>

                    </div>

                  </Link>
                ),
              )}

            </div>
          )}

      </main>
    </div>
  );
};


export default UnitPage;