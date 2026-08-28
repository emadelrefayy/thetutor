import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  apiClient,
  type Subject,
  type Unit,
} from '../api/apiClient';


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
      setError('معرف المادة غير صالح.');
      setLoading(false);
      return;
    }


    const id = Number(subjectId);


    if (!Number.isInteger(id) || id <= 0) {
      setSubject(null);
      setUnits([]);
      setError('معرف المادة غير صالح.');
      setLoading(false);
      return;
    }


    let active = true;


    const loadSubject = async () => {
      setLoading(true);
      setError(null);


      try {
        const [subjectData, unitsData] =
          await Promise.all([
            apiClient.getSubject(id),
            apiClient.getUnits(id),
          ]);


        if (!active) {
          return;
        }


        if (
          !subjectData ||
          typeof subjectData !== 'object'
        ) {
          throw new Error(
            'Invalid subject response.',
          );
        }


        if (!Array.isArray(unitsData)) {
          throw new Error(
            'Invalid units response.',
          );
        }


        setSubject(subjectData);
        setUnits(unitsData);
      } catch (err) {
        console.error(
          'Failed to load subject:',
          err,
        );


        if (!active) {
          return;
        }


        setSubject(null);
        setUnits([]);
        setError(
          'تعذر تحميل بيانات المادة.',
        );
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
            جاري تحميل المادة...
          </p>
        </div>
      </main>
    );
  }


  if (error || !subject) {
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
            المادة غير متاحة
          </h1>

          <p className="text-sm text-slate-400 mt-3 leading-6">
            {error ??
              'لم يتم العثور على المادة.'}
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


      {/* Subject Header */}

      <header className="mt-6 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
          {subject.icon_name ||
            '📚'}{' '}
          المادة الدراسية
        </div>


        <h1 className="text-3xl md:text-4xl font-black text-amber-400 mt-3">
          {subject.title}
        </h1>


        {subject.code && (
          <p className="text-xs text-slate-500 mt-2">
            كود المادة: {subject.code}
          </p>
        )}
      </header>


      {/* Units */}

      <section aria-labelledby="subject-units-title">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              id="subject-units-title"
              className="text-xl md:text-2xl font-black"
            >
              وحدات المادة
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              اختر الوحدة لعرض الدروس.
            </p>
          </div>


          <span className="text-xs text-slate-500">
            {units.length}{' '}
            {units.length === 1
              ? 'وحدة'
              : 'وحدات'}
          </span>
        </div>


        {units.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">
              📚
            </div>

            <h3 className="text-lg font-black text-slate-200">
              لا توجد وحدات متاحة
            </h3>

            <p className="text-sm text-slate-400 mt-2 leading-6">
              لا توجد وحدات مسجلة لهذه المادة حاليًا.
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
            {units.map((unit, index) => {
              const unitNumber =
                unit.unit_number ??
                index + 1;


              return (
                <Link
                  key={unit.id}
                  to={`/unit/${unit.id}`}
                  className="group block bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    {/* Unit Number */}

                    <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                      {unitNumber}
                    </div>


                    {/* Unit Information */}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-xl font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                        {unit.title}
                      </h3>


                      {unit.description && (
                        <p className="text-sm text-slate-400 mt-2 leading-6">
                          {unit.description}
                        </p>
                      )}
                    </div>


                    {/* Arrow */}

                    <span
                      className="text-amber-400 shrink-0 mt-2 transition-transform group-hover:-translate-x-1"
                      aria-hidden="true"
                    >
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


export default SubjectPage;