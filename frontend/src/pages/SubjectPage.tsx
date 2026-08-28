import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { apiClient } from '../api/apiClient';

interface Subject {
  id: number;
  title: string;
  description?: string | null;
}

interface Unit {
  id: number;
  subject_id: number;
  unit_number?: number | null;
  title: string;
  description?: string | null;
}

const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) {
      setError('معرف المادة غير صالح.');
      setLoading(false);
      return;
    }

    const id = Number(subjectId);

    if (!Number.isInteger(id) || id <= 0) {
      setError('معرف المادة غير صالح.');
      setLoading(false);
      return;
    }

    let active = true;

    const loadSubject = async () => {
      setLoading(true);
      setError(null);

      try {
        const [subjectData, unitsData] = await Promise.all([
          apiClient.getSubject(id),
          apiClient.getUnits(id),
        ]);

        if (!active) return;

        setSubject(
          subjectData && typeof subjectData === 'object'
            ? (subjectData as Subject)
            : null,
        );

        setUnits(
          Array.isArray(unitsData)
            ? (unitsData as Unit[])
            : [],
        );
      } catch (err) {
        console.error('Failed to load subject:', err);

        if (!active) return;

        setSubject(null);
        setUnits([]);
        setError('تعذر تحميل بيانات المادة.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSubject();

    return () => {
      active = false;
    };
  }, [subjectId]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-amber-400 font-bold animate-pulse">
            جاري تحميل المادة...
          </p>
        </div>
      </main>
    );
  }

  if (error || !subject) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10" dir="rtl">
        <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center">
          <h1 className="text-xl font-black text-red-400">
            المادة غير متاحة
          </h1>

          <p className="text-sm text-slate-400 mt-3">
            {error ?? 'لم يتم العثور على المادة.'}
          </p>

          <Link
            to="/student"
            className="inline-block mt-6 text-amber-400 hover:text-amber-300 font-bold"
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
      <Link
        to="/student"
        className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold"
      >
        → العودة للمناهج
      </Link>

      <header className="mt-5 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
          📚 المادة الدراسية
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-amber-400 mt-3">
          {subject.title}
        </h1>

        {subject.description && (
          <p className="text-slate-300 mt-3 leading-7">
            {subject.description}
          </p>
        )}
      </header>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black">
            وحدات المادة
          </h2>

          <span className="text-xs text-slate-500">
            {units.length} وحدة
          </span>
        </div>

        {units.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400">
              لا توجد وحدات متاحة لهذه المادة حاليًا.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {units.map((unit, index) => (
              <Link
                key={unit.id}
                to={`/unit/${unit.id}`}
                className="block bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    {unit.unit_number ?? index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-black text-slate-100">
                      {unit.title}
                    </h3>

                    {unit.description && (
                      <p className="text-sm text-slate-400 mt-2 leading-6">
                        {unit.description}
                      </p>
                    )}
                  </div>

                  <span className="text-amber-400 text-sm shrink-0">
                    ◀
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SubjectPage;