import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import CartoonBackground from "../components/CartoonBackground";
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

interface ConnectionState {
  status: "checking" | "connected" | "error";
  message: string;
}

const AdminDashboard: React.FC = () => {
  const [connection, setConnection] =
    useState<ConnectionState>({
      status: "checking",
      message: "جاري اختبار الاتصال...",
    });

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [terms, setTerms] =
    useState<Term[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [loadingData, setLoadingData] =
    useState(false);

  const [dataError, setDataError] =
    useState<string | null>(null);

  const checkDatabaseConnection = async () => {
    setConnection({
      status: "checking",
      message: "جاري اختبار الاتصال بالـBackend...",
    });

    setLoadingData(true);
    setDataError(null);

    try {
      await apiClient.health();

      setConnection({
        status: "connected",
        message:
          "الاتصال بالـBackend يعمل بنجاح.",
      });

      const loadedGrades =
        await apiClient.getGrades();

      const safeGrades = Array.isArray(
        loadedGrades,
      )
        ? (loadedGrades as Grade[])
        : [];

      setGrades(safeGrades);

      if (safeGrades.length === 0) {
        setTerms([]);
        setSubjects([]);
        return;
      }

      const firstGrade = safeGrades[0];

      const loadedTerms =
        await apiClient.getTerms(
          firstGrade.id,
        );

      const safeTerms = Array.isArray(
        loadedTerms,
      )
        ? (loadedTerms as Term[])
        : [];

      setTerms(safeTerms);

      if (safeTerms.length === 0) {
        setSubjects([]);
        return;
      }

      const firstTerm = safeTerms[0];

      const loadedSubjects =
        await apiClient.getSubjects(
          firstTerm.id,
        );

      setSubjects(
        Array.isArray(loadedSubjects)
          ? (loadedSubjects as Subject[])
          : [],
      );
    } catch (error) {
      console.error(
        "Admin database connection test failed:",
        error,
      );

      setConnection({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "فشل الاتصال بالـBackend.",
      });

      setDataError(
        "تعذر قراءة بيانات المنهج من قاعدة البيانات.",
      );

      setGrades([]);
      setTerms([]);
      setSubjects([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const statusClasses = {
    checking:
      "bg-amber-100 text-amber-800 border-amber-300",
    connected:
      "bg-emerald-100 text-emerald-800 border-emerald-300",
    error:
      "bg-red-100 text-red-800 border-red-300",
  };

  const statusIcon = {
    checking: "⏳",
    connected: "✅",
    error: "❌",
  };

  return (
    <div
      className="min-h-screen bg-[#FFFDF5] relative overflow-hidden font-sans"
      dir="rtl"
    >
      <CartoonBackground />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <header className="mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200">
            <div className="flex flex-col gap-4">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black">
                  ⚙️ الإدارة
                </span>

                <h1 className="text-3xl sm:text-4xl font-black text-amber-800 mt-3">
                  لوحة الإدارة
                </h1>

                <p className="text-sm font-bold text-slate-600 mt-2">
                  اختبار اتصال التطبيق بالـBackend
                  وقراءة بيانات المنهج من قاعدة البيانات.
                </p>
              </div>

              <div
                className={`rounded-2xl border-2 p-4 ${statusClasses[connection.status]}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black">
                      حالة الاتصال
                    </p>

                    <p className="text-sm font-bold mt-1">
                      {connection.message}
                    </p>
                  </div>

                  <span className="text-2xl">
                    {statusIcon[connection.status]}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={checkDatabaseConnection}
                disabled={loadingData}
                className="w-full sm:w-auto self-start bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black px-6 py-3 rounded-xl shadow-md transition"
              >
                {loadingData
                  ? "جاري الاختبار..."
                  : "🔄 اختبار الاتصال مرة أخرى"}
              </button>
            </div>
          </div>
        </header>

        {dataError && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-red-700">
              {dataError}
            </p>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border-2 border-amber-200 text-center">
            <span className="text-3xl font-black text-amber-600 block">
              {grades.length}
            </span>

            <span className="text-sm font-bold text-slate-600">
              الصفوف المقروءة
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border-2 border-amber-200 text-center">
            <span className="text-3xl font-black text-indigo-600 block">
              {terms.length}
            </span>

            <span className="text-sm font-bold text-slate-600">
              الفصول المقروءة
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-lg border-2 border-amber-200 text-center">
            <span className="text-3xl font-black text-emerald-600 block">
              {subjects.length}
            </span>

            <span className="text-sm font-bold text-slate-600">
              المواد المقروءة
            </span>
          </div>
        </section>

        <section className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-amber-800">
              🔗 اختبار بيانات المنهج
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              البيانات التالية تم تحميلها من خلال
              الـAPI وليست بيانات ثابتة داخل الصفحة.
            </p>
          </div>

          {loadingData ? (
            <div className="py-10 text-center">
              <p className="text-sm font-bold text-amber-600 animate-pulse">
                جاري قراءة بيانات قاعدة البيانات...
              </p>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm font-bold text-slate-500">
                لم يتم العثور على صفوف دراسية.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-700 mb-3">
                  الصفوف
                </h3>

                <div className="flex flex-wrap gap-2">
                  {grades.map((grade) => (
                    <span
                      key={grade.id}
                      className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-black"
                    >
                      {grade.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-700 mb-3">
                  الفصول المتاحة للصف الأول
                </h3>

                {terms.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    لا توجد فصول لهذا الصف.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {terms.map((term, index) => (
                      <span
                        key={term.id}
                        className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-black"
                      >
                        {term.name ??
                          term.title ??
                          (term.term_number
                            ? `الترم ${term.term_number}`
                            : `الترم ${index + 1}`)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-700 mb-3">
                  المواد في أول ترم
                </h3>

                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    لا توجد مواد لهذا الترم.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="rounded-2xl bg-slate-50 border border-slate-200 p-4"
                      >
                        <p className="font-black text-slate-800">
                          {subject.title}
                        </p>

                        {subject.code && (
                          <p className="text-xs text-slate-500 mt-1">
                            {subject.code}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;