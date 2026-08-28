import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  apiClient,
  type Achievement,
  type Grade,
  type LearningRecommendation,
  type StudentAnalytics,
  type StudentDashboard as StudentDashboardData,
  type StudentProfile,
  type StudentStreak,
  type StudentXp,
  type Subject,
  type Term,
} from "../api/apiClient";

import { supabase } from "../lib/supabase";

interface SubjectCard extends Subject {
  lessons_total: number;
  lessons_completed: number;
  questions_answered: number;
  questions_correct: number;
  accuracy: number;
  mastery_score: number;
  xp_earned: number;
}

interface DashboardData {
  profile: StudentProfile | null;
  grade: Grade | null;
  dashboard: StudentDashboardData | null;
  analytics: StudentAnalytics | null;
  streak: StudentStreak | null;
  xp: StudentXp | null;
  achievements: Achievement[];
  subjects: SubjectCard[];
  terms: Term[];
}

const EMPTY_DATA: DashboardData = {
  profile: null,
  grade: null,
  dashboard: null,
  analytics: null,
  streak: null,
  xp: null,
  achievements: [],
  subjects: [],
  terms: [],
};

function numberValue(
  value: unknown,
  fallback = 0,
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function percentValue(
  value: unknown,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      numberValue(value),
    ),
  );
}

function formatNumber(
  value: unknown,
): string {
  return new Intl.NumberFormat("ar-EG").format(
    numberValue(value),
  );
}

function formatPercent(
  value: unknown,
): string {
  return `${Math.round(
    percentValue(value),
  )}%`;
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function recommendationIcon(
  type: string,
): string {
  switch (type) {
    case "lesson":
      return "📘";

    case "concept":
      return "🧠";

    case "practice":
      return "✏️";

    case "vocabulary":
      return "📚";

    case "game":
      return "🎮";

    case "course":
      return "🎓";

    default:
      return "⭐";
  }
}

function getSummaryNumber(
  summary: Record<string, unknown> | null | undefined,
  key: string,
): number {
  return numberValue(
    summary?.[key],
  );
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] =
    useState<DashboardData>(
      EMPTY_DATA,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedTermId, setSelectedTermId] =
    useState<number | null>(null);

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  /*
   * ============================================================
   * Load authenticated student
   * ============================================================
   *
   * The Supabase session is the source of identity.
   *
   * We do NOT read student_profile_id from localStorage.
   *
   * The backend still performs the final authorization check:
   * authenticated user id === student_profile_id.
   */

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const session =
          sessionData.session;

        if (!session?.user?.id) {
          throw new Error(
            "لم يتم العثور على جلسة تسجيل الدخول.",
          );
        }

        const studentProfileId =
          session.user.id;

        const token =
          session.access_token;

        const [
          profile,
          dashboard,
          analytics,
          streak,
          xp,
          achievements,
        ] = await Promise.all([
          apiClient.getStudent(
            studentProfileId,
            token,
          ),

          apiClient.getStudentDashboard(
            studentProfileId,
            token,
          ),

          apiClient.getStudentAnalytics(
            studentProfileId,
            token,
          ),

          apiClient.getStudentStreak(
            studentProfileId,
            token,
          ),

          apiClient.getStudentXp(
            studentProfileId,
            token,
          ),

          apiClient.getStudentAchievements(
            studentProfileId,
            token,
          ),
        ]);

        if (!active) {
          return;
        }

        let grade: Grade | null = null;

        if (
          profile.grade_id !== null &&
          profile.grade_id !== undefined
        ) {
          try {
            grade =
              await apiClient.getGrade(
                profile.grade_id,
                token,
              );
          } catch {
            grade = null;
          }
        }

        let terms: Term[] = [];

        if (
          profile.grade_id !== null &&
          profile.grade_id !== undefined
        ) {
          try {
            terms =
              await apiClient.getGradeTerms(
                profile.grade_id,
                token,
              );
          } catch {
            terms = [];
          }
        }

        const metrics =
          analytics.subject_metrics ?? [];

        const subjectCards =
          await Promise.all(
            metrics.map(
              async (metric) => {
                try {
                  const subject =
                    await apiClient.getSubject(
                      metric.subject_id,
                      token,
                    );

                  return {
                    ...subject,
                    lessons_total:
                      numberValue(
                        metric.lessons_total,
                      ),
                    lessons_completed:
                      numberValue(
                        metric.lessons_completed,
                      ),
                    questions_answered:
                      numberValue(
                        metric.questions_answered,
                      ),
                    questions_correct:
                      numberValue(
                        metric.questions_correct,
                      ),
                    accuracy:
                      percentValue(
                        metric.accuracy,
                      ),
                    mastery_score:
                      percentValue(
                        metric.mastery_score,
                      ),
                    xp_earned:
                      numberValue(
                        metric.xp_earned,
                      ),
                  };
                } catch {
                  return null;
                }
              },
            ),
          );

        if (!active) {
          return;
        }

        setData({
          profile,
          grade,
          dashboard,
          analytics,
          streak,
          xp,
          achievements:
            Array.isArray(
              achievements,
            )
              ? achievements
              : [],
          subjects:
            subjectCards.filter(
              (
                subject,
              ): subject is SubjectCard =>
                subject !== null,
            ),
          terms,
        });

        setSelectedTermId(
          terms.length > 0
            ? terms[0].id
            : null,
        );
      } catch (loadError) {
        console.error(
          "Student dashboard error:",
          loadError,
        );

        if (!active) {
          return;
        }

        setData(EMPTY_DATA);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "تعذر تحميل لوحة الطالب.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  /*
   * ============================================================
   * Load subjects for the selected term
   * ============================================================
   */

  useEffect(() => {
    if (
      selectedTermId === null
    ) {
      return;
    }

    const selectedTerm =
      data.terms.find(
        (term) =>
          term.id ===
          selectedTermId,
      );

    if (!selectedTerm) {
      return;
    }

    let active = true;

    const loadSubjects = async () => {
      setLoadingSubjects(true);

      try {
        const {
          data: sessionData,
        } =
          await supabase.auth.getSession();

        const token =
          sessionData.session
            ?.access_token;

        if (!token) {
          return;
        }

        const subjects =
          await apiClient.getTermSubjects(
            selectedTermId,
            token,
          );

        if (!active) {
          return;
        }

        const metrics =
          data.analytics
            ?.subject_metrics ?? [];

        const merged =
          subjects.map(
            (subject) => {
              const metric =
                metrics.find(
                  (item) =>
                    item.subject_id ===
                    subject.id,
                );

              return {
                ...subject,
                lessons_total:
                  numberValue(
                    metric?.lessons_total,
                  ),
                lessons_completed:
                  numberValue(
                    metric?.lessons_completed,
                  ),
                questions_answered:
                  numberValue(
                    metric?.questions_answered,
                  ),
                questions_correct:
                  numberValue(
                    metric?.questions_correct,
                  ),
                accuracy:
                  percentValue(
                    metric?.accuracy,
                  ),
                mastery_score:
                  percentValue(
                    metric?.mastery_score,
                  ),
                xp_earned:
                  numberValue(
                    metric?.xp_earned,
                  ),
              };
            },
          );

        setData((current) => ({
          ...current,
          subjects: merged,
        }));
      } catch (loadError) {
        console.warn(
          "Failed to load term subjects:",
          loadError,
        );
      } finally {
        if (active) {
          setLoadingSubjects(false);
        }
      }
    };

    loadSubjects();

    return () => {
      active = false;
    };
  }, [
    selectedTermId,
    data.analytics,
    data.terms,
  ]);

  /*
   * ============================================================
   * Derived values
   * ============================================================
   */

  const profile =
    data.profile;

  const summary =
    data.dashboard?.summary;

  const streak =
    data.streak ??
    data.dashboard?.streak ??
    null;

  const xp =
    data.xp?.profile ??
    null;

  const recommendations =
    useMemo(
      () =>
        data.dashboard
          ?.recommendations ??
        data.analytics
          ?.recommendations ??
        [],
      [
        data.dashboard,
        data.analytics,
      ],
    );

  const studentName =
    profile?.display_name?.trim() ||
    "الطالب";

  const gradeTitle =
    data.grade?.title ||
    "الصف الدراسي";

  const currentXp =
    numberValue(
      xp?.xp ??
        profile?.xp,
    );

  const currentLevel =
    numberValue(
      xp?.level ??
        profile?.level,
      1,
    );

  const completedLessons =
    getSummaryNumber(
      summary,
      "completed_lessons",
    );

  const gamesPlayed =
    getSummaryNumber(
      summary,
      "games_played",
    );

  const questionsAnswered =
    getSummaryNumber(
      summary,
      "questions_answered",
    );

  const correctAnswers =
    getSummaryNumber(
      summary,
      "correct_answers",
    );

  const accuracy =
    summary?.accuracy_percent !==
      undefined
      ? percentValue(
          summary.accuracy_percent,
        )
      : questionsAnswered > 0
        ? (correctAnswers /
            questionsAnswered) *
          100
        : 0;

  const currentStreak =
    numberValue(
      streak?.current_streak,
    );

  const longestStreak =
    numberValue(
      streak?.longest_streak,
    );

  const selectedTerm =
    data.terms.find(
      (term) =>
        term.id ===
        selectedTermId,
    );

  const selectedSubjects =
    data.subjects.filter(
      (subject) =>
        selectedTermId === null ||
        subject.term_id ===
          selectedTermId,
    );

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
        <div className="max-w-6xl mx-auto">
          <section
            className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="text-5xl mb-4">
              🎓
            </div>

            <h1 className="text-xl font-black text-amber-400">
              جاري تحميل لوحة الطالب
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              جاري الاتصال ببيانات التعلم الخاصة بك.
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

  if (error || !profile) {
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
              تعذر فتح لوحة الطالب
            </h1>

            <p className="text-sm text-slate-400 mt-3 leading-7">
              {error ??
                "بيانات الطالب غير متاحة حاليًا."}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition"
            >
              إعادة المحاولة
            </button>
          </section>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * Dashboard
   * ============================================================
   */

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-6 sm:py-8"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">

        {/* Student header */}

        <section className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={studentName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">
                    🎓
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-500 font-bold">
                  مرحبًا بك
                </p>

                <h1 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                  {studentName}
                </h1>

                <div className="flex flex-wrap gap-2 mt-2">

                  <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300">
                    {gradeTitle}
                  </span>

                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-black text-amber-400">
                    المستوى{" "}
                    {formatNumber(
                      currentLevel,
                    )}
                  </span>

                </div>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[110px]">
                <div className="text-2xl">
                  ⚡
                </div>

                <div className="text-lg font-black text-amber-400 mt-1">
                  {formatNumber(
                    currentXp,
                  )}
                </div>

                <div className="text-[10px] text-slate-500 font-bold">
                  XP
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[110px]">
                <div className="text-2xl">
                  🔥
                </div>

                <div className="text-lg font-black text-amber-400 mt-1">
                  {formatNumber(
                    currentStreak,
                  )}
                </div>

                <div className="text-[10px] text-slate-500 font-bold">
                  يوم متتالي
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Statistics */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-2xl">
              📘
            </div>

            <div className="text-2xl font-black mt-3">
              {formatNumber(
                completedLessons,
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              دروس مكتملة
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-2xl">
              🎮
            </div>

            <div className="text-2xl font-black mt-3">
              {formatNumber(
                gamesPlayed,
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              ألعاب مكتملة
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-2xl">
              📝
            </div>

            <div className="text-2xl font-black mt-3">
              {formatNumber(
                questionsAnswered,
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              سؤال تمت إجابته
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-2xl">
              🎯
            </div>

            <div className="text-2xl font-black text-amber-400 mt-3">
              {formatPercent(
                accuracy,
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              نسبة الإجابات الصحيحة
            </p>
          </div>

        </section>

        {/* Streak */}

        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  🔥
                </span>

                <h2 className="text-lg font-black">
                  سلسلة التعلم
                </h2>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                حافظ على الاستمرارية في التعلم كل يوم.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-center">
                <div className="text-xl font-black text-amber-400">
                  {formatNumber(
                    currentStreak,
                  )}
                </div>

                <div className="text-[10px] text-slate-500 mt-1">
                  السلسلة الحالية
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-center">
                <div className="text-xl font-black">
                  {formatNumber(
                    longestStreak,
                  )}
                </div>

                <div className="text-[10px] text-slate-500 mt-1">
                  أطول سلسلة
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* Terms */}

        {data.terms.length > 0 && (
          <section className="space-y-4">

            <div>
              <h2 className="text-xl font-black">
                📚 المنهج الدراسي
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                اختر الترم لعرض مواده.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.terms.map(
                (term) => (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() =>
                      setSelectedTermId(
                        term.id,
                      )
                    }
                    className={`shrink-0 px-5 py-2.5 rounded-xl border text-xs font-black transition ${
                      selectedTermId ===
                      term.id
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-amber-500/40"
                    }`}
                  >
                    {term.title}
                  </button>
                ),
              )}
            </div>

          </section>
        )}

        {/* Subjects */}

        <section className="space-y-4">

          <div>
            <h2 className="text-xl font-black">
              {selectedTerm
                ? `مواد ${selectedTerm.title}`
                : "المواد الدراسية"}
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              اختر المادة للانتقال إلى وحداتها.
            </p>
          </div>

          {loadingSubjects ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-amber-400 font-bold animate-pulse">
                جاري تحميل المواد...
              </p>
            </div>
          ) : selectedSubjects.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <div className="text-4xl">
                📚
              </div>

              <p className="text-sm text-slate-400 mt-3">
                لا توجد مواد متاحة حاليًا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {selectedSubjects.map(
                (subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/subject/${subject.id}`,
                      )
                    }
                    className="text-right bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                          {subject.icon_name ||
                            "📚"}
                        </div>

                        <div className="min-w-0">

                          <h3 className="font-black text-sm group-hover:text-amber-400 transition">
                            {subject.title}
                          </h3>

                          <p className="text-[10px] text-slate-500 mt-1">
                            {subject.code}
                          </p>

                        </div>

                      </div>

                      <span className="text-slate-600 group-hover:text-amber-400">
                        ←
                      </span>

                    </div>

                    <div className="mt-5">

                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="text-slate-500">
                          الإتقان
                        </span>

                        <span className="text-amber-400 font-black">
                          {formatPercent(
                            subject.mastery_score,
                          )}
                        </span>
                      </div>

                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${percentValue(
                              subject.mastery_score,
                            )}%`,
                          }}
                        />
                      </div>

                    </div>

                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                      <span>
                        {formatNumber(
                          subject.lessons_completed,
                        )}{" "}
                        /{" "}
                        {formatNumber(
                          subject.lessons_total,
                        )}{" "}
                        درس
                      </span>

                      <span>
                        دقة{" "}
                        {formatPercent(
                          subject.accuracy,
                        )}
                      </span>
                    </div>

                  </button>
                ),
              )}

            </div>
          )}

        </section>

        {/* Recommendations */}

        <section className="space-y-4">

          <div>
            <h2 className="text-xl font-black">
              ⭐ مقترح لك
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              توصيات مبنية على تقدمك الفعلي.
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm text-slate-400">
                لا توجد توصيات جديدة حاليًا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {recommendations
                .slice(0, 4)
                .map(
                  (recommendation) => {
                    const lessonId =
                      recommendation.lesson_id;

                    const canOpenLesson =
                      lessonId !==
                        null &&
                      lessonId !==
                        undefined;

                    return (
                      <button
                        key={
                          recommendation.id
                        }
                        type="button"
                        disabled={
                          !canOpenLesson
                        }
                        onClick={() => {
                          if (
                            canOpenLesson
                          ) {
                            navigate(
                              `/lesson/${lessonId}`,
                            );
                          }
                        }}
                        className={`text-right bg-slate-900 border border-slate-800 rounded-2xl p-5 transition ${
                          canOpenLesson
                            ? "hover:border-amber-500/40"
                            : "opacity-80 cursor-default"
                        }`}
                      >
                        <div className="flex gap-4">

                          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
                            {recommendationIcon(
                              recommendation.recommendation_type,
                            )}
                          </div>

                          <div className="flex-1 min-w-0">

                            <h3 className="font-black text-sm">
                              {
                                recommendation.title
                              }
                            </h3>

                            {recommendation.reason && (
                              <p className="text-xs text-slate-500 leading-6 mt-2">
                                {
                                  recommendation.reason
                                }
                              </p>
                            )}

                            {canOpenLesson && (
                              <p className="text-[10px] text-amber-400 font-black mt-3">
                                فتح الدرس ←
                              </p>
                            )}

                          </div>

                        </div>
                      </button>
                    );
                  },
                )}

            </div>
          )}

        </section>

        {/* Achievements */}

        <section className="space-y-4">

          <div>
            <h2 className="text-xl font-black">
              🏆 إنجازاتك
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              الإنجازات التي حصلت عليها.
            </p>
          </div>

          {data.achievements.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm text-slate-400">
                لم تحصل على إنجازات بعد.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

              {data.achievements
                .slice(0, 8)
                .map(
                  (achievement) => (
                    <div
                      key={
                        achievement.id
                      }
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center"
                    >
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden">
                        {achievement.icon_url ? (
                          <img
                            src={
                              achievement.icon_url
                            }
                            alt={
                              achievement.name
                            }
                            className="w-9 h-9 object-contain"
                          />
                        ) : (
                          <span className="text-2xl">
                            🏆
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-black mt-3">
                        {
                          achievement.name
                        }
                      </h3>

                      {achievement.description && (
                        <p className="text-[10px] text-slate-500 leading-5 mt-1">
                          {
                            achievement.description
                          }
                        </p>
                      )}

                      <div className="text-[10px] text-amber-400 font-black mt-2">
                        +
                        {formatNumber(
                          achievement.xp_reward,
                        )}{" "}
                        XP
                      </div>

                      <div className="text-[9px] text-slate-600 mt-1">
                        {formatDate(
                          achievement.earned_at,
                        )}
                      </div>
                    </div>
                  ),
                )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
};

export default StudentDashboard;