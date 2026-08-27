import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import { apiClient } from "../api/apiClient";


interface Unit {
  id: number;
  title: string;
  unit_number?: number;
  description?: string | null;
}


const SubjectPage: React.FC = () => {
  const { subjectId } =
    useParams<{ subjectId: string }>();

  const [units, setUnits] =
    useState<Unit[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    if (!subjectId) return;

    const id = Number(subjectId);

    if (!Number.isInteger(id)) {
      setError("معرف المادة غير صالح.");
      setLoading(false);
      return;
    }

    let active = true;

    const loadUnits = async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await apiClient.getUnits(id);

        if (!active) return;

        setUnits(
          Array.isArray(data)
            ? (data as Unit[])
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load subject units:",
          err,
        );

        if (active) {
          setUnits([]);
          setError(
            "تعذر تحميل وحدات المادة.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUnits();

    return () => {
      active = false;
    };
  }, [subjectId]);


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
            📚 وحدات المادة
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            اختر الوحدة لعرض الدروس الموجودة بها.
          </p>
        </div>


        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-sm text-amber-400 animate-pulse font-bold">
              جاري تحميل الوحدات...
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
          units.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-400">
                لا توجد وحدات مسجلة لهذه المادة حاليًا.
              </p>
            </div>
          )}


        {!loading &&
          !error &&
          units.length > 0 && (
            <div className="space-y-4">

              {units.map((unit, index) => (
                <Link
                  key={unit.id}
                  to={`/unit/${unit.id}`}
                  className="block bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-black">
                      {unit.unit_number ??
                        index + 1}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-black text-slate-100">
                        {unit.title}
                      </h2>

                      {unit.description && (
                        <p className="text-sm text-slate-400 mt-1">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    <span className="mr-auto text-amber-400">
                      ◀
                    </span>

                  </div>
                </Link>
              ))}

            </div>
          )}

      </main>
    </div>
  );
};


export default SubjectPage;