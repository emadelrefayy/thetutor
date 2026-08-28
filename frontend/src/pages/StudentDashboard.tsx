import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
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
  type StudentSubjectMetric,
  type StudentXp,
  type Subject,
  type Term,
} from "../api/apiClient";

interface SubjectWithMetric extends Subject {
  metric?: StudentSubjectMetric;
}

interface DashboardState {
  profile: StudentProfile | null;
  dashboard: StudentDashboardData | null;
  analytics: StudentAnalytics | null;
  streak: StudentStreak | null;
  xp: StudentXp | null;
  achievements: Achievement[];
  progressCount: number;
  grade: Grade | null;
  subjects: SubjectWithMetric[];
}

const EMPTY_STATE: DashboardState = {
  profile: null,
  dashboard: null,
  analytics: null,
  streak: null,
  xp: null,
  achievements: [],
  progressCount: 0,
  grade: null,
  subjects: [],
};

function getStudentProfileId(): string | null {
  const keys = [
    "student_profile_id",
    "studentProfileId",
    "profile_id",
    "student_id",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value?.trim()) {
      return value.trim();
    }
  }

  return null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-EG").format(
    Math.max(0, Number(value) || 0),
  );
}

function formatPercent(value: number): string {
  const safeValue = Math.min(
    100,
    Math.max(0, Number(value) || 0),
  );

  return `${Math.round(safeValue)}%`;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getRecommendationIcon(
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

function getMetricLabel(
  metric?: StudentSubjectMetric,
): string {
  if (!metric) {
    return "لم يبدأ بعد";
  }

  if (metric.lessons_completed > 0) {
    return `${formatNumber(
      metric.lessons_completed,
    )} درس مكتمل`;
  }

  return "لم يبدأ بعد";
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [studentProfileId, setStudentProfileId] =
    useState<string | null>(null);

  const [state, setState] =
    useState<DashboardState>(EMPTY_STATE);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [selectedTermId, setSelectedTermId] =
    useState<number | null>(null);

  const [terms, setTerms] = useState<Term[]>([]);

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  const [subjectsError, setSubjectsError] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------
   * Resolve the current student profile
   * ------------------------------------------------------------
   *
   * The backend validates the authenticated user against
   * student_profile_id.
   *
   * The dashboard therefore never trusts the ID for authorization.
   * The API performs the actual authorization check.
   */

  useEffect(() => {
    setStudentProfileId(
      getStudentProfileId(),
    );
  }, []);

  /*
   * ------------------------------------------------------------
   * Load student dashboard data
   * ------------------------------------------------------------
   *
   * Backend endpoints:
   *
   * GET /students/{id}
   * GET /students/{id}/dashboard
   * GET /students/{id}/progress
   * GET /students/{id}/analytics
   * GET /students/{id}/streak
   * GET /students/{id}/xp
   * GET /students/{id}/achievements
   *
   * Database source:
   *
   * student_profiles
   * student_dashboard_summary
   * lesson_progress
   * student_subject_metrics
   * concept_mastery
   * learning_recommendations
   * student_streaks
   * xp_transactions
   * student_achievements
   * achievements
   */

  useEffect(() => {
    if (!studentProfileId) {
      setLoading(false);
      setError(
        "لم يتم العثور على ملف الطالب الحالي. تأكد من تسجيل الدخول وإعداد student_profile_id.",
      );
      return;
    }

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          profile,
          dashboard,
          progress,
          analytics,
          streak,
          xp,
          achievements,
        ] = await Promise.all([
          apiClient.getStudent(
            studentProfileId,
          ),
          apiClient.getStudentDashboard(
            studentProfileId,
          ),
          apiClient.getStudentProgress(
            studentProfileId,
          ),
          apiClient.getStudentAnalytics(
            studentProfileId,
          ),
          apiClient.getStudentStreak(
            studentProfileId,
          ),
          apiClient.getStudentXp(
            studentProfileId,
          ),
          apiClient.getStudentAchievements(
            studentProfileId,
          ),
        ]);

        if (!active) {
          return;
        }

        let grade: Grade | null = null;

        if (profile.grade_id !== null &&
            profile.grade_id !== undefined) {
          try {
            grade = await apiClient.getGrade(
              profile.grade_id,
            );
          } catch (gradeError) {
            console.warn(
              "Failed to load student grade:",
              gradeError,
            );
          }
        }

        const metrics =
          analytics?.subject_metrics ?? [];

        const subjectResults =
          await Promise.all(
            metrics.map(async (metric) => {
              try {
                const subject =
                  await apiClient.getSubject(
                    metric.subject_id,
                  );

                return {
                  ...subject,
                  metric,
                } satisfies SubjectWithMetric;
              } catch (subjectError) {
                console.warn(
                  `Failed to load subject ${metric.subject_id}:`,
                  subjectError,
                );

                return null;
              }
            }),
          );

        if (!active) {
          return;
        }

        setState({
          profile,
          dashboard,
          analytics,
          streak,
          xp,
          achievements:
            Array.isArray(achievements)
              ? achievements
              : [],
          progressCount: Array.isArray(progress)
            ? progress.length
            : 0,
          grade,
          subjects: subjectResults.filter(
            (
              subject,
            ): subject is SubjectWithMetric =>
              subject !== null,
          ),
        });
      } catch (loadError) {
        console.error(
          "Failed to load student dashboard:",
          loadError,
        );

        if (!active) {
          return;
        }

        setState(EMPTY_STATE);

        setError(
          "تعذر تحميل لوحة الطالب. تأكد من تسجيل الدخول واتصال الخادم بقاعدة البيانات.",
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
  }, [studentProfileId]);

  /*
   * ------------------------------------------------------------
   * Load curriculum terms for the student's grade
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const gradeId = state.profile?.grade_id;

    if (
      gradeId === null ||
      gradeId === undefined
    ) {
      setTerms([]);
      setSelectedTermId(null);
      return;
    }

    let active = true;

    const loadTerms = async () => {
      try {
        const loadedTerms =
          await apiClient.getGradeTerms(
            gradeId,
          );

        if (!active) {
          return;
        }

        setTerms(
          Array.isArray(loadedTerms)
            ? loadedTerms
            : [],
        );

        setSelectedTermId((current) => {
          if (
            current !== null &&
            loadedTerms.some(
              (term) =>
                term.id === current,
            )
          ) {
            return current;
          }

          return loadedTerms.length > 0
            ? loadedTerms[0].id
            : null;
        });
      } catch (loadError) {
        console.warn(
          "Failed to load student terms:",
          loadError,
        );

        if (!active) {
          return;
        }

        setTerms([]);
        setSelectedTermId(null);
      }
    };

    loadTerms();

    return () => {
      active = false;
    };
  }, [state.profile?.grade_id]);

  /*
   * ------------------------------------------------------------
   * Load subjects for selected term
   * ------------------------------------------------------------
   *
   * The main dashboard already has subject metrics.
   * This section loads the curriculum subjects so that the
   * student can always enter the curriculum directly.
   */

  useEffect(() => {
    if (selectedTermId === null) {
      return;
    }

    let active = true;

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setSubjectsError(null);

      try {
        const loadedSubjects =
          await apiClient.getTermSubjects(
            selectedTermId,
          );

        if (!active) {
          return;
        }

        const existingMetrics =
          state.analytics?.subject_metrics ??
          [];

        const merged =
          loadedSubjects.map((subject) => {
            const metric =
              existingMetrics.find(
                (item) =>
                  item.subject_id ===
                  subject.id,
              );

            return {
              ...subject,
              metric,
            };
          });

        setState((current) => ({
          ...current,
          subjects: merged,
        }));
      } catch (loadError) {
        console.warn(
          "Failed to load curriculum subjects:",
          loadError,
        );

        if (!active) {
          return;
        }

        setSubjectsError(
          "تعذر تحميل المواد الدراسية لهذا الترم.",
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
    state.analytics?.subject_metrics,
  ]);

  /*
   * ------------------------------------------------------------
   * Derived dashboard values
   * ------------------------------------------------------------
   */

  const summary =
    state.dashboard?.summary ?? null;

  const profile =
    state.profile;

  const streak =
    state.streak ??
    state.dashboard?.streak ??
    null;

  const recommendations =
    useMemo<LearningRecommendation[]>(
      () =>
        Array.isArray(
          state.dashboard?.recommendations,
        )
          ? state.dashboard!
              .recommendations
          : Array.isArray(
                state.analytics
                  ?.recommendations,
              )
            ? state.analytics!
                .recommendations
            : [],
      [
        state.dashboard?.recommendations,
        state.analytics?.recommendations,
      ],
    );

  const xpValue =
    Number(
      state.xp?.profile?.xp ??
        profile?.xp ??
        summary?.xp ??
        0,
    ) || 0;

  const levelValue =
    Number(
      state.xp?.profile?.level ??
        profile?.level ??
        summary?.level ??
        1,
    ) || 1;

  const completedLessons =
    Number(
      summary?.completed_lessons ?? 0,
    ) || 0;

  const gamesPlayed =
    Number(
      summary?.games_played ?? 0,
    ) || 0;

  const questionsAnswered =
    Number(
      summary?.questions_answered ?? 0,
    ) || 0;

  const correctAnswers =
    Number(
      summary?.correct_answers ?? 0,
    ) || 0;

  const accuracy =
    Number(
      summary?.accuracy_percent ??
        (questionsAnswered > 0
          ? (correctAnswers /
              questionsAnswered) *
            100
          : 0),
    ) || 0;

  const currentStreak =
    Number(
      streak?.current_streak ?? 0,
    ) || 0;

  const longestStreak =
    Number(
      streak?.longest_streak ?? 0,
    ) || 0;

  const selectedTermTitle =
    terms.find(
      (term) =>
        term.id === selectedTermId,
    )?.title ?? "";

  const gradeTitle =
    state.grade?.title ??
    (profile?.grade_id
      ? `الصف ${profile.grade_id}`
      : "غير محدد");

  const studentName =
    profile?.display_name?.trim() ||
    "الطالب";

  const topRecommendations =
    recommendations.slice(0, 4);

  const visibleSubjects =
    state.subjects.slice(0, 8);

  /*
   * ------------------------------------------------------------
   * Navigation
   * ------------------------------------------------------------
   */

  const openRecommendation = (
    recommendation: LearningRecommendation,
  ) => {
    if (
      recommendation.lesson_id !== null &&
      recommendation.lesson_id !== undefined
    ) {
      navigate(
        `/lesson/${recommendation.lesson_id}`,
      );
      return;
    }

    if (
      recommendation.concept_id !== null &&
      recommendation.concept_id !== undefined
    ) {
      return;
    }

    if (
      recommendation.game_definition_id
    ) {
      return;
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  /*
   * ------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-8"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
            <div className="text-5xl mb-4">
              🎓
            </div>

            <h1 className="text-xl font-black text-amber-400">
              جاري تجهيز لوحة الطالب
            </h1>

            <p className="text-sm text-slate-400 mt-2">
              جاري تحميل بيانات التعلم والتقدم.
            </p>

            <div className="mt-5 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full w-1/2 bg-amber-500 rounded-full animate-pulse" />
            </div>
          </section>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------------------------
   * Error / missing profile
   * ------------------------------------------------------------
   */

  if (error || !profile) {
    return (
      <main
        dir="rtl"
        className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-8"
      >
        <div className="max-w-xl mx-auto">
          <section className="bg-slate-900 border border-red-900/50 rounded-3xl p-8 text-center shadow-xl">
            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <h1 className="text-xl font-black text-red-400">
              تعذر فتح لوحة الطالب
            </h1>

            <p className="text-sm text-slate-400 leading-7 mt-3">
              {error ??
                "بيانات الطالب غير متاحة حاليًا."}
            </p>

            <button
              type="button"
              onClick={refreshPage}
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
   * ------------------------------------------------------------
   * Main dashboard
   * ------------------------------------------------------------
   */

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 px-4 py-6 sm:py-8"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">

        {/* ====================================================== */}
        {/* Student header */}
        {/* ====================================================== */}

        <section className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />

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
                <p className="text-xs font-bold text-slate-500">
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
                    المستوى {formatNumber(levelValue)}
                  </span>

                </div>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">

              <div className="min-w-[120px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-xl">
                  ⚡
                </div>

                <div className="text-lg font-black text-amber-400 mt-1">
                  {formatNumber(xpValue)}
                </div>

                <div className="text-[10px] text-slate-500 font-bold">
                  XP
                </div>
              </div>

              <div className="min-w-[120px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-xl">
                  🔥
                </div>

                <div className="text-lg font-black text-amber-400 mt-1">
                  {formatNumber(currentStreak)}
                </div>

                <div className="text-[10px] text-slate-500 font-bold">
                  يوم متتالي
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ====================================================== */}
        {/* Main statistics */}
        {/* ====================================================== */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl">
                📘
              </span>

              <span className="text-[10px] text-slate-500 font-bold">
                الدروس
              </span>
            </div>

            <div className="mt-3 text-2xl font-black text-slate-100">
              {formatNumber(completedLessons)}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              دروس مكتملة
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl">
                🎮
              </span>

              <span className="text-[10px] text-slate-500 font-bold">
                الألعاب
              </span>
            </div>

            <div className="mt-3 text-2xl font-black text-slate-100">
              {formatNumber(gamesPlayed)}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              ألعاب مكتملة
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl">
                📝
              </span>

              <span className="text-[10px] text-slate-500 font-bold">
                الأسئلة
              </span>
            </div>

            <div className="mt-3 text-2xl font-black text-slate-100">
              {formatNumber(questionsAnswered)}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              سؤال تمت إجابته
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl">
                🎯
              </span>

              <span className="text-[10px] text-slate-500 font-bold">
                الدقة
              </span>
            </div>

            <div className="mt-3 text-2xl font-black text-amber-400">
              {formatPercent(accuracy)}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              نسبة الإجابات الصحيحة
            </p>
          </div>

        </section>

        {/* ====================================================== */}
        {/* Learning streak */}
        {/* ====================================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  🔥
                </span>

                <h2 className="text-lg font-black text-slate-100">
                  سلسلة التعلم
                </h2>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                استمر في التعلم يوميًا وحافظ على تقدمك.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-center">
                <div className="text-xl font-black text-amber-400">
                  {formatNumber(currentStreak)}
                </div>

                <div className="text-[10px] text-slate-500 font-bold mt-1">
                  السلسلة الحالية
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-center">
                <div className="text-xl font-black text-slate-200">
                  {formatNumber(longestStreak)}
                </div>

                <div className="text-[10px] text-slate-500 font-bold mt-1">
                  أطول سلسلة
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ====================================================== */}
        {/* Subjects */}
        {/* ====================================================== */}

        <section className="space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

            <div>
              <h2 className="text-xl font-black text-slate-100">
                📚 موادك الدراسية
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {selectedTermTitle
                  ? `مواد ${selectedTermTitle}`
                  : "اختر الترم للوصول إلى المواد."}
              </p>
            </div>

            {terms.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {terms.map((term) => {
                  const selected =
                    selectedTermId ===
                    term.id;

                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() =>
                        setSelectedTermId(
                          term.id,
                        )
                      }
                      className={`shrink-0 px-4 py-2 rounded-xl border text-xs font-black transition ${
                        selected
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-amber-500/40 hover:text-amber-400"
                      }`}
                    >
                      {term.title}
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {subjectsError ? (
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-5">
              <p className="text-sm text-red-400 font-bold">
                {subjectsError}
              </p>
            </div>
          ) : loadingSubjects ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-xs text-amber-400 animate-pulse font-bold">
                جاري تحميل المواد...
              </p>
            </div>
          ) : visibleSubjects.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-400">
                لا توجد مواد متاحة لهذا الترم حاليًا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {visibleSubjects.map(
                (subject) => {
                  const metric =
                    subject.metric;

                  const mastery =
                    Number(
                      metric?.mastery_score ??
                        0,
                    ) || 0;

                  const subjectAccuracy =
                    Number(
                      metric?.accuracy ?? 0,
                    ) || 0;

                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() =>
                        navigate(
                          `/subject/${subject.id}`,
                        )
                      }
                      className="text-right bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 hover:bg-slate-900/80 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                            {subject.icon_name ||
                              "📚"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-black text-sm text-slate-100 group-hover:text-amber-400 transition">
                              {subject.title}
                            </h3>

                            <p className="text-[10px] text-slate-500 mt-1">
                              {subject.code}
                            </p>
                          </div>

                        </div>

                        <span className="text-slate-600 group-hover:text-amber-400 transition">
                          ←
                        </span>

                      </div>

                      <div className="mt-5 space-y-3">

                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1.5">
                            <span className="text-slate-500">
                              الإتقان
                            </span>

                            <span className="font-black text-amber-400">
                              {formatPercent(
                                mastery,
                              )}
                            </span>
                          </div>

                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    mastery,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">
                            {getMetricLabel(
                              metric,
                            )}
                          </span>

                          <span className="text-slate-500">
                            دقة{" "}
                            {formatPercent(
                              subjectAccuracy,
                            )}
                          </span>
                        </div>

                      </div>
                    </button>
                  );
                },
              )}

            </div>
          )}

        </section>

        {/* ====================================================== */}
        {/* Recommendations */}
        {/* ====================================================== */}

        <section className="space-y-4">

          <div>
            <h2 className="text-xl font-black text-slate-100">
              ⭐ مقترح لك
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              توصيات مبنية على بيانات التعلم والتقدم.
            </p>
          </div>

          {topRecommendations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  💡
                </span>

                <div>
                  <p className="text-sm font-black text-slate-200">
                    لا توجد توصيات جديدة حاليًا.
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    استمر في التعلم وستظهر التوصيات مع
                    توفر بيانات أكثر عن تقدمك.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {topRecommendations.map(
                (recommendation) => {
                  const actionable =
                    recommendation.lesson_id !==
                      null &&
                    recommendation.lesson_id !==
                      undefined;

                  return (
                    <button
                      key={recommendation.id}
                      type="button"
                      onClick={() =>
                        openRecommendation(
                          recommendation,
                        )
                      }
                      disabled={!actionable}
                      className={`text-right bg-slate-900 border border-slate-800 rounded-2xl p-5 transition ${
                        actionable
                          ? "hover:border-amber-500/40 hover:bg-slate-900/80"
                          : "cursor-default"
                      }`}
                    >
                      <div className="flex gap-4">

                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
                          {getRecommendationIcon(
                            recommendation.recommendation_type,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <h3 className="font-black text-sm text-slate-100">
                              {recommendation.title}
                            </h3>

                            <span className="text-[10px] font-black text-amber-400 shrink-0">
                              {formatNumber(
                                Number(
                                  recommendation.priority ??
                                    0,
                                ),
                              )}
                            </span>

                          </div>

                          {recommendation.reason && (
                            <p className="text-xs text-slate-500 leading-6 mt-2">
                              {recommendation.reason}
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-3 mt-3">

                            <span className="text-[10px] text-slate-600">
                              {recommendation.generated_by ||
                                "analytics"}
                            </span>

                            {actionable && (
                              <span className="text-[10px] font-black text-amber-400">
                                فتح الدرس ←
                              </span>
                            )}

                          </div>

                        </div>

                      </div>
                    </button>
                  );
                },
              )}

            </div>
          )}

        </section>

        {/* ====================================================== */}
        {/* Achievements */}
        {/* ====================================================== */}

        <section className="space-y-4">

          <div>
            <h2 className="text-xl font-black text-slate-100">
              🏆 إنجازاتك
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              الإنجازات التي حصلت عليها حتى الآن.
            </p>
          </div>

          {state.achievements.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  🏅
                </span>

                <div>
                  <p className="text-sm font-black text-slate-200">
                    لم تحصل على إنجازات بعد.
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    أكمل الدروس والألعاب والأنشطة لتحصل على
                    إنجازات جديدة.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

              {state.achievements
                .slice(0, 8)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center"
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden">

                      {achievement.icon_url ? (
                        <img
                          src={achievement.icon_url}
                          alt={achievement.name}
                          className="w-9 h-9 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">
                          🏆
                        </span>
                      )}

                    </div>

                    <h3 className="text-xs font-black text-slate-200 mt-3">
                      {achievement.name}
                    </h3>

                    {achievement.description && (
                      <p className="text-[10px] text-slate-500 leading-5 mt-1">
                        {achievement.description}
                      </p>
                    )}

                    <div className="text-[10px] text-amber-400 font-black mt-2">
                      +{formatNumber(
                        achievement.xp_reward,
                      )} XP
                    </div>

                    <div className="text-[9px] text-slate-600 mt-1">
                      {formatDate(
                        achievement.earned_at,
                      )}
                    </div>
                  </div>
                ))}

            </div>
          )}

        </section>

        {/* ====================================================== */}
        {/* Quick learning actions */}
        {/* ====================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <button
            type="button"
            onClick={() =>
              navigate("/student")
            }
            className="bg-amber-500 text-slate-950 rounded-2xl p-5 text-right hover:bg-amber-400 transition"
          >
            <div className="text-2xl">
              📚
            </div>

            <h3 className="font-black text-sm mt-3">
              استكشف المنهج
            </h3>

            <p className="text-[10px] text-slate-800 mt-1">
              تصفح الصفوف والفصول والمواد.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-right hover:border-amber-500/40 transition"
          >
            <div className="text-2xl">
              📊
            </div>

            <h3 className="font-black text-sm mt-3">
              راجع تقدمك
            </h3>

            <p className="text-[10px] text-slate-500 mt-1">
              شاهد الإحصائيات والإتقان والإنجازات.
            </p>
          </button>

          <button
            type="button"
            onClick={refreshPage}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-right hover:border-amber-500/40 transition"
          >
            <div className="text-2xl">
              🔄
            </div>

            <h3 className="font-black text-sm mt-3">
              تحديث البيانات
            </h3>

            <p className="text-[10px] text-slate-500 mt-1">
              إعادة تحميل آخر بيانات من الخادم.
            </p>
          </button>

        </section>

        {/* ====================================================== */}
        {/* Technical data footer */}
        {/* ====================================================== */}

        <section className="text-center pt-2">

          <p className="text-[10px] text-slate-700">
            آخر نشاط مسجل:{" "}
            {formatDate(
              streak?.last_activity_date,
            )}
          </p>

          <p className="text-[9px] text-slate-800 mt-1">
            تم تحميل {formatNumber(
              state.progressCount,
            )} سجل تقدم للطالب.
          </p>

        </section>

      </div>
    </main>
  );
};

export { StudentDashboard };

export default StudentDashboard;