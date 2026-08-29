import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  apiClient,
  type AdminDashboardResponse,
  type AdminDiagnosticsResponse,
  type Grade,
  type Term,
  type Subject,
  type Unit,
  type Lesson,
  type LessonContentBlock,
  type LessonAsset,
  type LearningObjective,
  type LessonVocabulary,
  type LessonConcept,
  type CurriculumSource,
  type Question,
} from "../api/apiClient";

type ContentTab =
  | "overview"
  | "lesson"
  | "blocks"
  | "assets"
  | "objectives"
  | "vocabulary"
  | "concepts"
  | "questions"
  | "sources";

type ConnectionState =
  | "checking"
  | "connected"
  | "error";

const EMPTY_DASHBOARD: AdminDashboardResponse = {
  content: {
    grades: 0,
    terms: 0,
    subjects: 0,
    units: 0,
    lessons: 0,
    lesson_content_blocks: 0,
    lesson_assets: 0,
    learning_objectives: 0,
    lesson_vocabulary: 0,
    concepts: 0,
    questions: 0,
    curriculum_sources: 0,
    game_templates: 0,
    game_definitions: 0,
  },
  users: {
    profiles: 0,
    students: 0,
  },
  subscriptions: {
    plans: 0,
    subscriptions: 0,
  },
};

const EMPTY_DIAGNOSTICS: AdminDiagnosticsResponse = {
  status: "degraded",
  checked_at: "",
  duration_ms: 0,
  checks: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<ContentTab>("overview");

  const [dashboard, setDashboard] =
    useState<AdminDashboardResponse>(
      EMPTY_DASHBOARD,
    );

  const [diagnostics, setDiagnostics] =
    useState<AdminDiagnosticsResponse>(
      EMPTY_DIAGNOSTICS,
    );

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  const [diagnosticsLoading, setDiagnosticsLoading] =
    useState(false);

  const [connection, setConnection] =
    useState<ConnectionState>("checking");

  const [lastChecked, setLastChecked] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [terms, setTerms] =
    useState<Term[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [units, setUnits] =
    useState<Unit[]>([]);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [selectedGradeId, setSelectedGradeId] =
    useState<number | null>(null);

  const [selectedTermId, setSelectedTermId] =
    useState<number | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] =
    useState<number | null>(null);

  const [selectedUnitId, setSelectedUnitId] =
    useState<number | null>(null);

  const [selectedLessonId, setSelectedLessonId] =
    useState<number | null>(null);

  const [selectedLesson, setSelectedLesson] =
    useState<Lesson | null>(null);

  const [contentBlocks, setContentBlocks] =
    useState<LessonContentBlock[]>([]);

  const [assets, setAssets] =
    useState<LessonAsset[]>([]);

  const [objectives, setObjectives] =
    useState<LearningObjective[]>([]);

  const [vocabulary, setVocabulary] =
    useState<LessonVocabulary[]>([]);

  const [concepts, setConcepts] =
    useState<LessonConcept[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [sources, setSources] =
    useState<CurriculumSource[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [lessonLoading, setLessonLoading] =
    useState(false);

  const selectedGrade = useMemo(
    () =>
      grades.find(
        (item) =>
          item.id === selectedGradeId,
      ) ?? null,
    [grades, selectedGradeId],
  );

  const selectedTerm = useMemo(
    () =>
      terms.find(
        (item) =>
          item.id === selectedTermId,
      ) ?? null,
    [terms, selectedTermId],
  );

  const selectedSubject = useMemo(
    () =>
      subjects.find(
        (item) =>
          item.id === selectedSubjectId,
      ) ?? null,
    [subjects, selectedSubjectId],
  );

  const selectedUnit = useMemo(
    () =>
      units.find(
        (item) =>
          item.id === selectedUnitId,
      ) ?? null,
    [units, selectedUnitId],
  );

  const resetLesson = useCallback(() => {
    setSelectedLesson(null);
    setSelectedLessonId(null);
    setContentBlocks([]);
    setAssets([]);
    setObjectives([]);
    setVocabulary([]);
    setConcepts([]);
    setQuestions([]);
    setSources([]);
  }, []);

  const resetFromGrade = useCallback(() => {
    setTerms([]);
    setSubjects([]);
    setUnits([]);
    setLessons([]);
    setSelectedTermId(null);
    setSelectedSubjectId(null);
    setSelectedUnitId(null);
    resetLesson();
  }, [resetLesson]);

  const resetFromTerm = useCallback(() => {
    setSubjects([]);
    setUnits([]);
    setLessons([]);
    setSelectedSubjectId(null);
    setSelectedUnitId(null);
    resetLesson();
  }, [resetLesson]);

  const resetFromSubject = useCallback(() => {
    setUnits([]);
    setLessons([]);
    setSelectedUnitId(null);
    resetLesson();
  }, [resetLesson]);

  const resetFromUnit = useCallback(() => {
    setLessons([]);
    resetLesson();
  }, [resetLesson]);

  const loadDashboard = useCallback(
    async () => {
      setDashboardLoading(true);
      setError(null);

      try {
        const data =
          await apiClient.getAdminDashboard();

        setDashboard(data);
      } catch (err) {
        console.error(
          "Admin dashboard loading failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "تعذر تحميل لوحة الإدارة.",
        );
      } finally {
        setDashboardLoading(false);
      }
    },
    [],
  );

  const runDiagnostics = useCallback(
    async () => {
      setDiagnosticsLoading(true);

      try {
        const data =
          await apiClient.getAdminDiagnostics();

        setDiagnostics(data);

        setConnection(
          data.status === "healthy"
            ? "connected"
            : "error",
        );

        setLastChecked(
          new Date().toLocaleString(
            "ar-EG",
          ),
        );
      } catch (err) {
        console.error(
          "Admin diagnostics failed:",
          err,
        );

        setConnection("error");

        setLastChecked(
          new Date().toLocaleString(
            "ar-EG",
          ),
        );

        setError(
          err instanceof Error
            ? err.message
            : "تعذر تنفيذ فحص النظام.",
        );
      } finally {
        setDiagnosticsLoading(false);
      }
    },
    [],
  );

  const refreshAdminData = useCallback(
    async () => {
      await Promise.all([
        loadDashboard(),
        runDiagnostics(),
      ]);
    },
    [
      loadDashboard,
      runDiagnostics,
    ],
  );

  useEffect(() => {
    void refreshAdminData();
  }, [refreshAdminData]);

  const loadGrades = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await apiClient.getGrades();

        setGrades(
          Array.isArray(data)
            ? data
            : [],
        );

        if (
          !Array.isArray(data) ||
          data.length === 0
        ) {
          resetFromGrade();
          return;
        }

        const gradeId =
          selectedGradeId &&
          data.some(
            (item) =>
              item.id ===
              selectedGradeId,
          )
            ? selectedGradeId
            : data[0].id;

        setSelectedGradeId(
          gradeId,
        );

        const termData =
          await apiClient.getGradeTerms(
            gradeId,
          );

        setTerms(
          Array.isArray(termData)
            ? termData
            : [],
        );

        if (
          !Array.isArray(termData) ||
          termData.length === 0
        ) {
          resetFromTerm();
          return;
        }

        const termId =
          selectedTermId &&
          termData.some(
            (item) =>
              item.id ===
              selectedTermId,
          )
            ? selectedTermId
            : termData[0].id;

        setSelectedTermId(
          termId,
        );

        const subjectData =
          await apiClient.getTermSubjects(
            termId,
          );

        setSubjects(
          Array.isArray(subjectData)
            ? subjectData
            : [],
        );

        if (
          !Array.isArray(subjectData) ||
          subjectData.length === 0
        ) {
          resetFromSubject();
          return;
        }

        const subjectId =
          selectedSubjectId &&
          subjectData.some(
            (item) =>
              item.id ===
              selectedSubjectId,
          )
            ? selectedSubjectId
            : subjectData[0].id;

        setSelectedSubjectId(
          subjectId,
        );

        const unitData =
          await apiClient.getUnits(
            subjectId,
          );

        setUnits(
          Array.isArray(unitData)
            ? unitData
            : [],
        );

        if (
          !Array.isArray(unitData) ||
          unitData.length === 0
        ) {
          resetFromUnit();
          return;
        }

        const unitId =
          selectedUnitId &&
          unitData.some(
            (item) =>
              item.id ===
              selectedUnitId,
          )
            ? selectedUnitId
            : unitData[0].id;

        setSelectedUnitId(
          unitId,
        );

        const lessonData =
          await apiClient.getUnitLessons(
            unitId,
          );

        setLessons(
          Array.isArray(lessonData)
            ? lessonData
            : [],
        );
      } catch (err) {
        console.error(
          "Curriculum loading failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "تعذر تحميل المنهج.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      selectedGradeId,
      selectedTermId,
      selectedSubjectId,
      selectedUnitId,
      resetFromGrade,
      resetFromTerm,
      resetFromSubject,
      resetFromUnit,
    ],
  );

  useEffect(() => {
    void loadGrades();
  }, [loadGrades]);

  const handleGradeChange = async (
    gradeId: number,
  ) => {
    setSelectedGradeId(
      gradeId,
    );

    resetFromGrade();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getGradeTerms(
          gradeId,
        );

      setTerms(
        Array.isArray(data)
          ? data
          : [],
      );

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return;
      }

      const termId =
        data[0].id;

      setSelectedTermId(
        termId,
      );

      const subjectData =
        await apiClient.getTermSubjects(
          termId,
        );

      setSubjects(
        Array.isArray(
          subjectData,
        )
          ? subjectData
          : [],
      );

      if (
        !Array.isArray(
          subjectData,
        ) ||
        subjectData.length === 0
      ) {
        return;
      }

      const subjectId =
        subjectData[0].id;

      setSelectedSubjectId(
        subjectId,
      );

      const unitData =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(unitData)
          ? unitData
          : [],
      );

      if (
        !Array.isArray(unitData) ||
        unitData.length === 0
      ) {
        return;
      }

      const unitId =
        unitData[0].id;

      setSelectedUnitId(
        unitId,
      );

      const lessonData =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(lessonData)
          ? lessonData
          : [],
      );
    } catch (err) {
      console.error(
        "Grade selection failed:",
        err,
      );

      setError(
        "تعذر تحميل محتوى الصف.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = async (
    termId: number,
  ) => {
    setSelectedTermId(
      termId,
    );

    resetFromTerm();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getTermSubjects(
          termId,
        );

      setSubjects(
        Array.isArray(data)
          ? data
          : [],
      );

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return;
      }

      const subjectId =
        data[0].id;

      setSelectedSubjectId(
        subjectId,
      );

      const unitData =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(unitData)
          ? unitData
          : [],
      );

      if (
        !Array.isArray(unitData) ||
        unitData.length === 0
      ) {
        return;
      }

      const unitId =
        unitData[0].id;

      setSelectedUnitId(
        unitId,
      );

      const lessonData =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(lessonData)
          ? lessonData
          : [],
      );
    } catch (err) {
      console.error(
        "Term selection failed:",
        err,
      );

      setError(
        "تعذر تحميل مواد الفصل.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = async (
    subjectId: number,
  ) => {
    setSelectedSubjectId(
      subjectId,
    );

    resetFromSubject();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(data)
          ? data
          : [],
      );

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return;
      }

      const unitId =
        data[0].id;

      setSelectedUnitId(
        unitId,
      );

      const lessonData =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(lessonData)
          ? lessonData
          : [],
      );
    } catch (err) {
      console.error(
        "Subject selection failed:",
        err,
      );

      setError(
        "تعذر تحميل وحدات المادة.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = async (
    unitId: number,
  ) => {
    setSelectedUnitId(
      unitId,
    );

    resetFromUnit();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (err) {
      console.error(
        "Unit selection failed:",
        err,
      );

      setError(
        "تعذر تحميل دروس الوحدة.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (
    lessonId: number,
  ) => {
    setSelectedLessonId(
      lessonId,
    );

    setLessonLoading(true);
    setError(null);

    try {
      const [
        lesson,
        blocks,
        lessonAssets,
        lessonObjectives,
        lessonVocabulary,
        lessonConcepts,
        lessonQuestions,
        lessonSources,
      ] = await Promise.all([
        apiClient.getLesson(
          lessonId,
        ),
        apiClient.getLessonContent(
          lessonId,
        ),
        apiClient.getLessonAssets(
          lessonId,
        ),
        apiClient.getLessonObjectives(
          lessonId,
        ),
        apiClient.getLessonVocabulary(
          lessonId,
        ),
        apiClient.getLessonConcepts(
          lessonId,
        ),
        apiClient.getLessonQuestions(
          lessonId,
        ),
        apiClient.getLessonSources(
          lessonId,
        ),
      ]);

      setSelectedLesson(
        lesson,
      );

      setContentBlocks(
        Array.isArray(blocks)
          ? blocks
          : [],
      );

      setAssets(
        Array.isArray(
          lessonAssets,
        )
          ? lessonAssets
          : [],
      );

      setObjectives(
        Array.isArray(
          lessonObjectives,
        )
          ? lessonObjectives
          : [],
      );

      setVocabulary(
        Array.isArray(
          lessonVocabulary,
        )
          ? lessonVocabulary
          : [],
      );

      setConcepts(
        Array.isArray(
          lessonConcepts,
        )
          ? lessonConcepts
          : [],
      );

      setQuestions(
        Array.isArray(
          lessonQuestions,
        )
          ? lessonQuestions
          : [],
      );

      setSources(
        Array.isArray(
          lessonSources,
        )
          ? lessonSources
          : [],
      );

      setActiveTab(
        "lesson",
      );
    } catch (err) {
      console.error(
        "Lesson loading failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحميل محتوى الدرس.",
      );
    } finally {
      setLessonLoading(false);
    }
  };

  const contentCards = [
    {
      label: "الصفوف",
      value: dashboard.content.grades,
      icon: "🎓",
    },
    {
      label: "الفصول",
      value: dashboard.content.terms,
      icon: "📅",
    },
    {
      label: "المواد",
      value: dashboard.content.subjects,
      icon: "📚",
    },
    {
      label: "الوحدات",
      value: dashboard.content.units,
      icon: "🗂️",
    },
    {
      label: "الدروس",
      value: dashboard.content.lessons,
      icon: "📖",
    },
    {
      label: "Content Blocks",
      value:
        dashboard.content
          .lesson_content_blocks,
      icon: "🧩",
    },
    {
      label: "Assets",
      value:
        dashboard.content.lesson_assets,
      icon: "🖼️",
    },
    {
      label: "الأهداف",
      value:
        dashboard.content
          .learning_objectives,
      icon: "🎯",
    },
    {
      label: "المفردات",
      value:
        dashboard.content
          .lesson_vocabulary,
      icon: "🔤",
    },
    {
      label: "المفاهيم",
      value:
        dashboard.content.concepts,
      icon: "🧠",
    },
    {
      label: "الأسئلة",
      value:
        dashboard.content.questions,
      icon: "❓",
    },
    {
      label: "المصادر",
      value:
        dashboard.content
          .curriculum_sources,
      icon: "📑",
    },
  ];

  const systemCards = [
    {
      label: "المستخدمون",
      value: dashboard.users.profiles,
      icon: "👥",
    },
    {
      label: "الطلاب",
      value: dashboard.users.students,
      icon: "🎒",
    },
    {
      label: "Plans",
      value:
        dashboard.subscriptions.plans,
      icon: "💳",
    },
    {
      label: "Subscriptions",
      value:
        dashboard.subscriptions
          .subscriptions,
      icon: "🔐",
    },
    {
      label: "Game Templates",
      value:
        dashboard.content
          .game_templates,
      icon: "🎮",
    },
    {
      label: "Game Definitions",
      value:
        dashboard.content
          .game_definitions,
      icon: "🕹️",
    },
  ];

  const tabs: Array<{
    id: ContentTab;
    label: string;
    count?: number;
  }> = [
    {
      id: "overview",
      label: "الرئيسية",
    },
    {
      id: "lesson",
      label: "الدرس",
    },
    {
      id: "blocks",
      label: "المحتوى",
      count: contentBlocks.length,
    },
    {
      id: "assets",
      label: "الوسائط",
      count: assets.length,
    },
    {
      id: "objectives",
      label: "الأهداف",
      count: objectives.length,
    },
    {
      id: "vocabulary",
      label: "المفردات",
      count: vocabulary.length,
    },
    {
      id: "concepts",
      label: "المفاهيم",
      count: concepts.length,
    },
    {
      id: "questions",
      label: "الأسئلة",
      count: questions.length,
    },
    {
      id: "sources",
      label: "المصادر",
      count: sources.length,
    },
  ];

  const renderEmpty = (
    message: string,
  ) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
      <div className="text-3xl mb-3">
        📭
      </div>
      <p className="text-sm text-slate-400">
        {message}
      </p>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-black">
              نظرة عامة على المحتوى
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              أرقام مباشرة من قاعدة البيانات عبر Admin API.
            </p>
          </div>

          {dashboardLoading && (
            <span className="text-xs text-amber-400">
              جاري التحديث...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {contentCards.map(
            (card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="text-2xl">
                  {card.icon}
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  {card.label}
                </p>

                <p className="text-2xl font-black text-slate-100 mt-1">
                  {card.value.toLocaleString(
                    "ar-EG",
                  )}
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-black">
              حالة المنصة
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              فحص مباشر للجداول الأساسية المطلوبة للإدارة.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void runDiagnostics()
            }
            disabled={
              diagnosticsLoading
            }
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-black text-amber-400 disabled:opacity-50"
          >
            {diagnosticsLoading
              ? "جاري الفحص..."
              : "إعادة الفحص"}
          </button>
        </div>

        <div
          className={`rounded-2xl border p-5 ${
            diagnostics.status ===
            "healthy"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-black">
                {diagnostics.status ===
                "healthy"
                  ? "قاعدة البيانات والخدمات الأساسية تعمل."
                  : "يوجد فشل في واحد أو أكثر من الاختبارات."}
              </p>

              <p className="text-xs opacity-70 mt-1">
                Passed:{" "}
                {
                  diagnostics.summary
                    .passed
                }{" "}
                /{" "}
                {
                  diagnostics.summary
                    .total
                }
              </p>
            </div>

            <span
              className={`text-xs font-black ${
                diagnostics.status ===
                "healthy"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {diagnostics.status}
            </span>
          </div>
        </div>

        {diagnostics.checks.length >
          0 && (
          <div className="grid gap-2 mt-3 md:grid-cols-2 xl:grid-cols-3">
            {diagnostics.checks.map(
              (check) => (
                <div
                  key={check.name}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      {check.name}
                    </span>

                    <span
                      className={`text-[10px] font-black ${
                        check.status ===
                        "pass"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-600 mt-1">
                    {check.duration_ms} ms
                  </p>

                  {check.error && (
                    <pre
                      dir="ltr"
                      className="text-[10px] text-red-400 mt-2 whitespace-pre-wrap break-all"
                    >
                      {JSON.stringify(
                        check.error,
                      )}
                    </pre>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">
          إدارة الحسابات والاشتراكات
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {systemCards.map(
            (card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="text-2xl">
                  {card.icon}
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  {card.label}
                </p>

                <p className="text-2xl font-black mt-1">
                  {card.value.toLocaleString(
                    "ar-EG",
                  )}
                </p>
              </article>
            ),
          )}
        </div>
      </section>
    </div>
  );

  const renderBlocks = () => {
    if (
      contentBlocks.length ===
      0
    ) {
      return renderEmpty(
        "لا توجد Content Blocks لهذا الدرس.",
      );
    }

    return (
      <div className="space-y-3">
        {contentBlocks.map(
          (block, index) => (
            <article
              key={block.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-black text-amber-400">
                  #{index + 1}{" "}
                  {block.block_type}
                </span>

                <span
                  className={
                    block.is_published
                      ? "text-xs text-emerald-400"
                      : "text-xs text-slate-500"
                  }
                >
                  {block.is_published
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              <pre
                dir="ltr"
                className="overflow-auto rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-300 leading-6 text-left"
              >
                {JSON.stringify(
                  block.content,
                  null,
                  2,
                )}
              </pre>
            </article>
          ),
        )}
      </div>
    );
  };

  const renderAssets = () => {
    if (
      assets.length === 0
    ) {
      return renderEmpty(
        "لا توجد وسائط مرتبطة بهذا الدرس.",
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {assets.map(
          (asset) => (
            <article
              key={asset.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-amber-400 font-black">
                    {asset.asset_type}
                  </p>

                  <h3 className="font-black mt-1">
                    {asset.title ||
                      "بدون عنوان"}
                  </h3>
                </div>

                <span className="text-xs text-slate-500">
                  #{asset.sort_order}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4 break-all">
                {asset.url}
              </p>

              {asset.alt_text && (
                <p className="text-xs text-slate-500 mt-2">
                  ALT:{" "}
                  {asset.alt_text}
                </p>
              )}

              <div className="mt-4">
                <span
                  className={
                    asset.is_published
                      ? "text-xs text-emerald-400"
                      : "text-xs text-slate-500"
                  }
                >
                  {asset.is_published
                    ? "Published"
                    : "Draft"}
                </span>
              </div>
            </article>
          ),
        )}
      </div>
    );
  };

  const renderObjectives = () => {
    if (
      objectives.length ===
      0
    ) {
      return renderEmpty(
        "لا توجد أهداف تعليمية لهذا الدرس.",
      );
    }

    return (
      <div className="space-y-3">
        {objectives.map(
          (objective) => (
            <article
              key={objective.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                {objective.objective_code && (
                  <span className="text-xs text-amber-400 font-black">
                    {
                      objective.objective_code
                    }
                  </span>
                )}

                {objective.cognitive_level && (
                  <span className="text-xs text-slate-500">
                    {
                      objective.cognitive_level
                    }
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-200 leading-7">
                {objective.statement}
              </p>
            </article>
          ),
        )}
      </div>
    );
  };

  const renderVocabulary = () => {
    if (
      vocabulary.length ===
      0
    ) {
      return renderEmpty(
        "لا توجد مفردات لهذا الدرس.",
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {vocabulary.map(
          (item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <h3 className="font-black text-amber-400">
                {item.term}
              </h3>

              {item.definition && (
                <p className="text-sm text-slate-300 mt-2 leading-6">
                  {
                    item.definition
                  }
                </p>
              )}

              {item.pronunciation && (
                <p className="text-xs text-slate-500 mt-2">
                  النطق:{" "}
                  {
                    item.pronunciation
                  }
                </p>
              )}

              {item.example && (
                <p className="text-xs text-slate-400 mt-2 leading-6">
                  مثال:{" "}
                  {item.example}
                </p>
              )}
            </article>
          ),
        )}
      </div>
    );
  };

  const renderConcepts = () => {
    if (
      concepts.length ===
      0
    ) {
      return renderEmpty(
        "لا توجد مفاهيم مرتبطة بهذا الدرس.",
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {concepts.map(
          (concept) => (
            <article
              key={concept.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">
                  {concept.name}
                </h3>

                {concept.is_primary && (
                  <span className="text-[10px] font-black text-amber-400">
                    PRIMARY
                  </span>
                )}
              </div>

              {concept.description && (
                <p className="text-sm text-slate-400 mt-2 leading-6">
                  {
                    concept.description
                  }
                </p>
              )}
            </article>
          ),
        )}
      </div>
    );
  };

  const renderQuestions = () => {
    if (
      questions.length ===
      0
    ) {
      return renderEmpty(
        "لا توجد أسئلة مرتبطة بهذا الدرس.",
      );
    }

    return (
      <div className="space-y-3">
        {questions.map(
          (question, index) => (
            <article
              key={question.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-amber-400 font-black">
                  Question #{index + 1}
                </span>

                <span className="text-[10px] text-slate-500">
                  {question.question_type}
                </span>
              </div>

              <p className="text-sm leading-7 mt-3 text-slate-200">
                {question.question_text}
              </p>

              {question.explanation && (
                <p className="text-xs text-slate-500 mt-3 leading-6">
                  الشرح:{" "}
                  {
                    question.explanation
                  }
                </p>
              )}
            </article>
          ),
        )}
      </div>
    );
  };

  const renderSources = () => {
    if (
      sources.length ===
      0
    ) {
      return renderEmpty(
        "لا توجد مصادر مرتبطة بهذا الدرس.",
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {sources.map(
          (source) => (
            <article
              key={source.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <h3 className="font-black">
                {source.title}
              </h3>

              {source.author && (
                <p className="text-xs text-slate-400 mt-2">
                  المؤلف:{" "}
                  {source.author}
                </p>
              )}

              {source.publisher && (
                <p className="text-xs text-slate-500 mt-1">
                  الناشر:{" "}
                  {source.publisher}
                </p>
              )}

              {source.edition && (
                <p className="text-xs text-slate-500 mt-1">
                  الإصدار:{" "}
                  {source.edition}
                </p>
              )}

              {source.academic_year && (
                <p className="text-xs text-slate-500 mt-1">
                  العام الدراسي:{" "}
                  {
                    source.academic_year
                  }
                </p>
              )}

              {source.source_url && (
                <a
                  href={
                    source.source_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-xs text-blue-400 hover:text-blue-300 mt-3 break-all"
                >
                  {source.source_url}
                </a>
              )}

              {source.rights_notes && (
                <p className="text-xs text-slate-500 mt-3 leading-6">
                  الحقوق:{" "}
                  {
                    source.rights_notes
                  }
                </p>
              )}
            </article>
          ),
        )}
      </div>
    );
  };

  const renderLesson = () => {
    if (!selectedLesson) {
      return renderEmpty(
        "اختر درسًا من القائمة لبدء إدارة محتواه.",
      );
    }

    return (
      <div className="space-y-5">
        <section className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div>
              <span className="text-xs font-black text-amber-400">
                LESSON #
                {
                  selectedLesson.id
                }
              </span>

              <h2 className="text-2xl font-black mt-2">
                {
                  selectedLesson.title
                }
              </h2>

              {selectedLesson.content_summary && (
                <p className="text-sm text-slate-400 mt-3 leading-7 max-w-3xl">
                  {
                    selectedLesson.content_summary
                  }
                </p>
              )}
            </div>

            <Link
              to={`/lesson/${selectedLesson.id}`}
              className="shrink-0 inline-flex items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-xs font-black text-amber-400 hover:bg-amber-500/20 transition"
            >
              فتح الدرس كطالب
            </Link>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Lesson Number
            </p>
            <p className="text-2xl font-black text-amber-400 mt-2">
              {
                selectedLesson.lesson_number
              }
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Content Blocks
            </p>
            <p className="text-2xl font-black mt-2">
              {
                contentBlocks.length
              }
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Assets
            </p>
            <p className="text-2xl font-black mt-2">
              {assets.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Questions
            </p>
            <p className="text-2xl font-black mt-2">
              {questions.length}
            </p>
          </article>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-black">
            روابط المحتوى الحالية
          </h3>

          <div className="grid gap-3 md:grid-cols-3 mt-4">
            {[
              {
                label: "Video",
                value:
                  selectedLesson.video_url,
              },
              {
                label: "Infographic",
                value:
                  selectedLesson.infographic_url,
              },
              {
                label: "Game",
                value:
                  selectedLesson.game_url,
              },
            ].map(
              (item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="text-[10px] text-slate-500 font-black">
                    {item.label}
                  </p>

                  {item.value ? (
                    <a
                      href={item.value}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs text-blue-400 hover:text-blue-300 mt-2 break-all"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-600 mt-2">
                      غير موجود
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderActiveTab = () => {
    if (
      activeTab === "overview"
    ) {
      return renderOverview();
    }

    if (
      activeTab === "lesson"
    ) {
      return renderLesson();
    }

    if (
      activeTab === "blocks"
    ) {
      return renderBlocks();
    }

    if (
      activeTab === "assets"
    ) {
      return renderAssets();
    }

    if (
      activeTab === "objectives"
    ) {
      return renderObjectives();
    }

    if (
      activeTab === "vocabulary"
    ) {
      return renderVocabulary();
    }

    if (
      activeTab === "concepts"
    ) {
      return renderConcepts();
    }

    if (
      activeTab === "questions"
    ) {
      return renderQuestions();
    }

    return renderSources();
  };

  const connectionLabel =
    connection === "connected"
      ? "متصل"
      : connection === "error"
        ? "خطأ"
        : "جاري الفحص";

  const connectionClass =
    connection === "connected"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : connection === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-400"
        : "border-amber-500/30 bg-amber-500/10 text-amber-400";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <header className="mb-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black text-amber-400">
                ADMIN DASHBOARD
              </span>

              <h1 className="text-3xl md:text-4xl font-black mt-3">
                لوحة الإدارة
              </h1>

              <p className="text-sm text-slate-500 mt-2 leading-7 max-w-3xl">
                مراقبة حالة المنصة وإحصائيات المحتوى وإدارة
                المحتوى التعليمي من خلال الـAdmin API.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/"
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:border-slate-700"
              >
                الرئيسية
              </Link>

              <button
                type="button"
                onClick={() =>
                  void refreshAdminData()
                }
                disabled={
                  dashboardLoading ||
                  diagnosticsLoading
                }
                className={`rounded-xl border px-4 py-2 text-xs font-black ${connectionClass} disabled:opacity-50`}
              >
                {dashboardLoading ||
                diagnosticsLoading
                  ? "جاري التحديث..."
                  : connectionLabel}
              </button>
            </div>
          </div>
        </header>

        <section
          className={`rounded-2xl border px-5 py-4 mb-6 ${connectionClass}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-xs font-black">
                حالة الـBackend وقاعدة البيانات
              </p>

              <p className="text-xs opacity-80 mt-1">
                {diagnostics.status ===
                "healthy"
                  ? "كل الاختبارات الأساسية ناجحة."
                  : diagnostics.summary
                      .total ===
                    0
                    ? "لم يتم تشغيل الفحص بعد."
                    : "يوجد اختبار أو أكثر يحتاج إلى مراجعة."}
              </p>
            </div>

            {lastChecked && (
              <span className="text-[10px] opacity-60">
                آخر فحص:{" "}
                {lastChecked}
              </span>
            )}
          </div>
        </section>

        {error && (
          <section
            className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 mb-6"
            role="alert"
          >
            <p className="text-sm font-black text-red-400">
              حدث خطأ
            </p>

            <p className="text-xs text-red-300/80 mt-2 leading-6">
              {error}
            </p>
          </section>
        )}

        <nav className="rounded-2xl border border-slate-800 bg-slate-900 p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map(
              (tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id,
                    )
                  }
                  className={`rounded-xl px-4 py-3 text-xs font-black transition ${
                    activeTab ===
                    tab.id
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  {tab.label}

                  {typeof tab.count ===
                    "number" && (
                    <span className="mr-2 opacity-70">
                      {tab.count}
                    </span>
                  )}
                </button>
              ),
            )}
          </div>
        </nav>

        {activeTab !==
          "overview" && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 md:p-6 mb-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-black">
                  اختيار المحتوى
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Grade → Term → Subject → Unit → Lesson
                </p>
              </div>

              {loading && (
                <span className="text-xs text-amber-400">
                  جاري التحميل...
                </span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <select
                value={
                  selectedGradeId ??
                  ""
                }
                onChange={(event) => {
                  const id =
                    Number(
                      event.target
                        .value,
                    );

                  if (id) {
                    void handleGradeChange(
                      id,
                    );
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-amber-500"
              >
                <option value="">
                  اختر الصف
                </option>

                {grades.map(
                  (grade) => (
                    <option
                      key={grade.id}
                      value={grade.id}
                    >
                      {grade.title}
                    </option>
                  ),
                )}
              </select>

              <select
                value={
                  selectedTermId ??
                  ""
                }
                onChange={(event) => {
                  const id =
                    Number(
                      event.target
                        .value,
                    );

                  if (id) {
                    void handleTermChange(
                      id,
                    );
                  }
                }}
                disabled={
                  terms.length === 0
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
              >
                <option value="">
                  اختر الفصل
                </option>

                {terms.map(
                  (term) => (
                    <option
                      key={term.id}
                      value={term.id}
                    >
                      {term.title}
                    </option>
                  ),
                )}
              </select>

              <select
                value={
                  selectedSubjectId ??
                  ""
                }
                onChange={(event) => {
                  const id =
                    Number(
                      event.target
                        .value,
                    );

                  if (id) {
                    void handleSubjectChange(
                      id,
                    );
                  }
                }}
                disabled={
                  subjects.length ===
                  0
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
              >
                <option value="">
                  اختر المادة
                </option>

                {subjects.map(
                  (subject) => (
                    <option
                      key={
                        subject.id
                      }
                      value={
                        subject.id
                      }
                    >
                      {
                        subject.title
                      }
                    </option>
                  ),
                )}
              </select>

              <select
                value={
                  selectedUnitId ??
                  ""
                }
                onChange={(event) => {
                  const id =
                    Number(
                      event.target
                        .value,
                    );

                  if (id) {
                    void handleUnitChange(
                      id,
                    );
                  }
                }}
                disabled={
                  units.length ===
                  0
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
              >
                <option value="">
                  اختر الوحدة
                </option>

                {units.map(
                  (unit) => (
                    <option
                      key={unit.id}
                      value={unit.id}
                    >
                      {
                        unit.unit_number
                      }
                      .{" "}
                      {
                        unit.title
                      }
                    </option>
                  ),
                )}
              </select>

              <select
                value={
                  selectedLessonId ??
                  ""
                }
                onChange={(event) => {
                  const id =
                    Number(
                      event.target
                        .value,
                    );

                  if (!id) {
                    return;
                  }

                  void loadLesson(
                    id,
                  );
                }}
                disabled={
                  lessons.length ===
                  0
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
              >
                <option value="">
                  اختر الدرس
                </option>

                {lessons.map(
                  (lesson) => (
                    <option
                      key={
                        lesson.id
                      }
                      value={
                        lesson.id
                      }
                    >
                      {
                        lesson.lesson_number
                      }
                      .{" "}
                      {
                        lesson.title
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            {(selectedGrade ||
              selectedTerm ||
              selectedSubject ||
              selectedUnit) && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-800">
                {selectedGrade && (
                  <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                    {
                      selectedGrade.title
                    }
                  </span>
                )}

                {selectedTerm && (
                  <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                    {
                      selectedTerm.title
                    }
                  </span>
                )}

                {selectedSubject && (
                  <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                    {
                      selectedSubject.title
                    }
                  </span>
                )}

                {selectedUnit && (
                  <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                    {
                      selectedUnit.title
                    }
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        {lessonLoading && (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 mb-6">
            <p className="text-sm text-amber-400 font-black">
              جاري تحميل بيانات الدرس...
            </p>
          </section>
        )}

        <section>
          {renderActiveTab()}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;