import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  apiClient,
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

interface HealthResponse {
  service?: string;
  status?: string;
  version?: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<ContentTab>("overview");

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

  const [error, setError] =
    useState<string | null>(null);

  const [connection, setConnection] = useState<
    "checking" | "connected" | "error"
  >("checking");

  const [lastChecked, setLastChecked] =
    useState<string | null>(null);

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

  const resetLessonData = () => {
    setSelectedLesson(null);
    setSelectedLessonId(null);
    setContentBlocks([]);
    setAssets([]);
    setObjectives([]);
    setVocabulary([]);
    setConcepts([]);
    setQuestions([]);
    setSources([]);
  };

  const resetFromGrade = () => {
    setTerms([]);
    setSubjects([]);
    setUnits([]);
    setLessons([]);
    resetLessonData();
    setSelectedTermId(null);
    setSelectedSubjectId(null);
    setSelectedUnitId(null);
  };

  const resetFromTerm = () => {
    setSubjects([]);
    setUnits([]);
    setLessons([]);
    resetLessonData();
    setSelectedSubjectId(null);
    setSelectedUnitId(null);
  };

  const resetFromSubject = () => {
    setUnits([]);
    setLessons([]);
    resetLessonData();
    setSelectedUnitId(null);
  };

  const resetFromUnit = () => {
    setLessons([]);
    resetLessonData();
  };

  const checkConnection = useCallback(
    async () => {
      setConnection("checking");

      try {
        const response =
          await apiClient.get<HealthResponse>(
            "/health",
          );

        if (
          !response ||
          response.status !== "healthy"
        ) {
          throw new Error(
            "Backend health check failed.",
          );
        }

        setConnection("connected");
        setLastChecked(
          new Date().toLocaleString("ar-EG"),
        );
      } catch (err) {
        console.error(
          "Admin server check failed:",
          err,
        );

        setConnection("error");
        setLastChecked(
          new Date().toLocaleString("ar-EG"),
        );
      }
    },
    [],
  );

  const loadGrades = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await apiClient.getGrades();

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid grades response.",
          );
        }

        setGrades(data);

        if (data.length === 0) {
          resetFromGrade();
          return;
        }

        const currentId =
          selectedGradeId &&
          data.some(
            (item) =>
              item.id === selectedGradeId,
          )
            ? selectedGradeId
            : data[0].id;

        setSelectedGradeId(currentId);

        const termData =
          await apiClient.getGradeTerms(
            currentId,
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
              item.id === selectedTermId,
          )
            ? selectedTermId
            : termData[0].id;

        setSelectedTermId(termId);

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
              item.id === selectedSubjectId,
          )
            ? selectedSubjectId
            : subjectData[0].id;

        setSelectedSubjectId(subjectId);

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
              item.id === selectedUnitId,
          )
            ? selectedUnitId
            : unitData[0].id;

        setSelectedUnitId(unitId);

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
          "Failed to load curriculum:",
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
    ],
  );

  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    void loadGrades();
  }, [loadGrades]);

  const handleGradeChange = async (
    gradeId: number,
  ) => {
    setSelectedGradeId(gradeId);

    resetFromGrade();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getGradeTerms(
          gradeId,
        );

      setTerms(
        Array.isArray(data) ? data : [],
      );

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return;
      }

      const termId = data[0].id;

      setSelectedTermId(termId);

      const subjectsData =
        await apiClient.getTermSubjects(
          termId,
        );

      setSubjects(
        Array.isArray(subjectsData)
          ? subjectsData
          : [],
      );

      if (
        !Array.isArray(subjectsData) ||
        subjectsData.length === 0
      ) {
        return;
      }

      const subjectId =
        subjectsData[0].id;

      setSelectedSubjectId(subjectId);

      const unitsData =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(unitsData)
          ? unitsData
          : [],
      );

      if (
        !Array.isArray(unitsData) ||
        unitsData.length === 0
      ) {
        return;
      }

      const unitId = unitsData[0].id;

      setSelectedUnitId(unitId);

      const lessonsData =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(lessonsData)
          ? lessonsData
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
    setSelectedTermId(termId);

    resetFromTerm();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getTermSubjects(
          termId,
        );

      setSubjects(
        Array.isArray(data) ? data : [],
      );

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return;
      }

      const subjectId = data[0].id;

      setSelectedSubjectId(subjectId);

      const unitsData =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(unitsData)
          ? unitsData
          : [],
      );

      if (
        !Array.isArray(unitsData) ||
        unitsData.length === 0
      ) {
        return;
      }

      const unitId = unitsData[0].id;

      setSelectedUnitId(unitId);

      const lessonsData =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(lessonsData)
          ? lessonsData
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
    setSelectedSubjectId(subjectId);

    resetFromSubject();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getUnits(
          subjectId,
        );

      setUnits(
        Array.isArray(data) ? data : [],
      );

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return;
      }

      const unitId = data[0].id;

      setSelectedUnitId(unitId);

      const lessonsData =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(lessonsData)
          ? lessonsData
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
    setSelectedUnitId(unitId);

    resetFromUnit();

    setLoading(true);
    setError(null);

    try {
      const data =
        await apiClient.getUnitLessons(
          unitId,
        );

      setLessons(
        Array.isArray(data) ? data : [],
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
    setSelectedLessonId(lessonId);
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
        apiClient.getLesson(lessonId),
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

      setSelectedLesson(lesson);
      setContentBlocks(
        Array.isArray(blocks)
          ? blocks
          : [],
      );
      setAssets(
        Array.isArray(lessonAssets)
          ? lessonAssets
          : [],
      );
      setObjectives(
        Array.isArray(lessonObjectives)
          ? lessonObjectives
          : [],
      );
      setVocabulary(
        Array.isArray(lessonVocabulary)
          ? lessonVocabulary
          : [],
      );
      setConcepts(
        Array.isArray(lessonConcepts)
          ? lessonConcepts
          : [],
      );
      setQuestions(
        Array.isArray(lessonQuestions)
          ? lessonQuestions
          : [],
      );
      setSources(
        Array.isArray(lessonSources)
          ? lessonSources
          : [],
      );

      setActiveTab("lesson");
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

  const openLesson = (
    lesson: Lesson,
  ) => {
    void loadLesson(lesson.id);
  };

  const connectionLabel =
    connection === "connected"
      ? "متصل"
      : connection === "error"
        ? "خطأ في الاتصال"
        : "جاري الاختبار";

  const connectionClass =
    connection === "connected"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : connection === "error"
        ? "border-red-500/30 bg-red-500/10 text-red-400"
        : "border-amber-500/30 bg-amber-500/10 text-amber-400";

  const contentStats = [
    {
      label: "الدروس",
      value: lessons.length,
      icon: "📖",
    },
    {
      label: "Blocks",
      value: contentBlocks.length,
      icon: "🧩",
    },
    {
      label: "Assets",
      value: assets.length,
      icon: "🖼️",
    },
    {
      label: "أسئلة",
      value: questions.length,
      icon: "❓",
    },
    {
      label: "أهداف",
      value: objectives.length,
      icon: "🎯",
    },
    {
      label: "مفردات",
      value: vocabulary.length,
      icon: "🔤",
    },
  ];

  const tabs: Array<{
    id: ContentTab;
    label: string;
    count?: number;
  }> = [
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

  const renderBlocks = () => {
    if (contentBlocks.length === 0) {
      return renderEmpty(
        "لا توجد Content Blocks منشورة لهذا الدرس.",
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

              <pre className="overflow-auto rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-300 leading-6 text-left" dir="ltr">
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
    if (assets.length === 0) {
      return renderEmpty(
        "لا توجد وسائط مرتبطة بهذا الدرس.",
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {assets.map((asset) => (
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
                ALT: {asset.alt_text}
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
        ))}
      </div>
    );
  };

  const renderObjectives = () => {
    if (objectives.length === 0) {
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
                    {objective.objective_code}
                  </span>
                )}

                {objective.cognitive_level && (
                  <span className="text-xs text-slate-500">
                    {objective.cognitive_level}
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
    if (vocabulary.length === 0) {
      return renderEmpty(
        "لا توجد مفردات لهذا الدرس.",
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {vocabulary.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <h3 className="font-black text-amber-400">
              {item.term}
            </h3>

            {item.definition && (
              <p className="text-sm text-slate-300 mt-2 leading-6">
                {item.definition}
              </p>
            )}

            {item.pronunciation && (
              <p className="text-xs text-slate-500 mt-2">
                النطق:{" "}
                {item.pronunciation}
              </p>
            )}

            {item.example && (
              <p className="text-xs text-slate-400 mt-2 leading-6">
                مثال: {item.example}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  };

  const renderConcepts = () => {
    if (concepts.length === 0) {
      return renderEmpty(
        "لا توجد مفاهيم مرتبطة بهذا الدرس.",
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {concepts.map((concept) => (
          <article
            key={concept.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-slate-100">
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
                {concept.description}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  };

  const renderQuestions = () => {
    if (questions.length === 0) {
      return renderEmpty(
        "لا توجد أسئلة منشورة مرتبطة بهذا الدرس.",
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
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-black text-amber-400">
                  السؤال {index + 1}
                </span>

                <span className="text-[10px] text-slate-500">
                  {question.question_type}
                </span>

                {question.difficulty && (
                  <span className="text-[10px] text-slate-500">
                    {question.difficulty}
                  </span>
                )}

                {question.status && (
                  <span className="text-[10px] text-emerald-400">
                    {question.status}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-100 leading-7">
                {question.prompt}
              </p>

              {question.options.length > 0 && (
                <div className="mt-4 space-y-2">
                  {question.options.map(
                    (option) => (
                      <div
                        key={option.id}
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-slate-300"
                      >
                        <strong className="text-amber-400">
                          {option.option_key}
                        </strong>{" "}
                        {option.option_text}
                      </div>
                    ),
                  )}
                </div>
              )}

              {question.explanation && (
                <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-4">
                  <p className="text-[10px] text-slate-500 mb-1">
                    الشرح
                  </p>

                  <p className="text-xs text-slate-400 leading-6">
                    {question.explanation}
                  </p>
                </div>
              )}
            </article>
          ),
        )}
      </div>
    );
  };

  const renderSources = () => {
    if (sources.length === 0) {
      return renderEmpty(
        "لا توجد مصادر مرتبطة بهذا الدرس.",
      );
    }

    return (
      <div className="space-y-3">
        {sources.map((source) => (
          <article
            key={source.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black">
                {source.name}
              </h3>

              <span className="text-xs text-amber-400">
                {source.source_type}
              </span>
            </div>

            {source.publisher && (
              <p className="text-xs text-slate-500 mt-2">
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
                {source.academic_year}
              </p>
            )}

            {source.source_url && (
              <a
                href={source.source_url}
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
                {source.rights_notes}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  };

  const renderLessonTab = () => {
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
                LESSON #{selectedLesson.id}
              </span>

              <h2 className="text-2xl font-black mt-2">
                {selectedLesson.title}
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Lesson Number
            </p>
            <p className="text-2xl font-black text-amber-400 mt-2">
              {selectedLesson.lesson_number}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Content Blocks
            </p>
            <p className="text-2xl font-black mt-2">
              {contentBlocks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Assets
            </p>
            <p className="text-2xl font-black mt-2">
              {assets.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Questions
            </p>
            <p className="text-2xl font-black mt-2">
              {questions.length}
            </p>
          </div>
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
            ].map((item) => (
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
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "lesson":
        return renderLessonTab();

      case "blocks":
        return renderBlocks();

      case "assets":
        return renderAssets();

      case "objectives":
        return renderObjectives();

      case "vocabulary":
        return renderVocabulary();

      case "concepts":
        return renderConcepts();

      case "questions":
        return renderQuestions();

      case "sources":
        return renderSources();

      default:
        return renderLessonTab();
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">

        {/* Header */}

        <header className="mb-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black text-amber-400">
                ADMIN CONTENT MANAGEMENT
              </span>

              <h1 className="text-3xl md:text-4xl font-black mt-3">
                إدارة المحتوى التعليمي
              </h1>

              <p className="text-sm text-slate-500 mt-2 leading-7 max-w-3xl">
                إدارة واستعراض المنهج والمحتوى المرتبط
                بالدروس من المصدر الأساسي للبيانات.
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
                  void checkConnection()
                }
                className={`rounded-xl border px-4 py-2 text-xs font-black ${connectionClass}`}
              >
                {connectionLabel}
              </button>
            </div>
          </div>
        </header>

        {/* Server status */}

        <section
          className={`rounded-2xl border px-5 py-4 mb-6 ${connectionClass}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-xs font-black">
                اتصال الـBackend
              </p>

              <p className="text-xs opacity-80 mt-1">
                {connection ===
                "connected"
                  ? "الخدمة متاحة."
                  : connection === "error"
                    ? "تعذر الوصول إلى الخدمة."
                    : "جاري التحقق من الخدمة..."}
              </p>
            </div>

            {lastChecked && (
              <span className="text-[10px] opacity-60">
                آخر اختبار:{" "}
                {lastChecked}
              </span>
            )}
          </div>
        </section>

        {/* Curriculum selector */}

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
              <span className="text-xs text-amber-400 animate-pulse">
                جاري التحميل...
              </span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">

            <select
              value={selectedGradeId ?? ""}
              onChange={(event) =>
                void handleGradeChange(
                  Number(event.target.value),
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-amber-500"
            >
              <option value="">
                اختر الصف
              </option>

              {grades.map((grade) => (
                <option
                  key={grade.id}
                  value={grade.id}
                >
                  {grade.title}
                </option>
              ))}
            </select>

            <select
              value={selectedTermId ?? ""}
              onChange={(event) =>
                void handleTermChange(
                  Number(event.target.value),
                )
              }
              disabled={terms.length === 0}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
            >
              <option value="">
                اختر الفصل
              </option>

              {terms.map((term) => (
                <option
                  key={term.id}
                  value={term.id}
                >
                  {term.title}
                </option>
              ))}
            </select>

            <select
              value={
                selectedSubjectId ?? ""
              }
              onChange={(event) =>
                void handleSubjectChange(
                  Number(event.target.value),
                )
              }
              disabled={
                subjects.length === 0
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
            >
              <option value="">
                اختر المادة
              </option>

              {subjects.map(
                (subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.title}
                  </option>
                ),
              )}
            </select>

            <select
              value={
                selectedUnitId ?? ""
              }
              onChange={(event) =>
                void handleUnitChange(
                  Number(event.target.value),
                )
              }
              disabled={units.length === 0}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
            >
              <option value="">
                اختر الوحدة
              </option>

              {units.map((unit) => (
                <option
                  key={unit.id}
                  value={unit.id}
                >
                  {unit.unit_number}.{" "}
                  {unit.title}
                </option>
              ))}
            </select>

            <select
              value={
                selectedLessonId ?? ""
              }
              onChange={(event) => {
                const id = Number(
                  event.target.value,
                );

                const lesson =
                  lessons.find(
                    (item) =>
                      item.id === id,
                  );

                if (lesson) {
                  openLesson(lesson);
                }
              }}
              disabled={lessons.length === 0}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none disabled:opacity-40 focus:border-amber-500"
            >
              <option value="">
                اختر الدرس
              </option>

              {lessons.map(
                (lesson) => (
                  <option
                    key={lesson.id}
                    value={lesson.id}
                  >
                    {lesson.lesson_number}.{" "}
                    {lesson.title}
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
                  {selectedGrade.title}
                </span>
              )}

              {selectedTerm && (
                <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                  {selectedTerm.title}
                </span>
              )}

              {selectedSubject && (
                <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                  {selectedSubject.title}
                </span>
              )}

              {selectedUnit && (
                <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] text-slate-400">
                  {selectedUnit.title}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Error */}

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

        {/* Stats */}

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {contentStats.map(
            (stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="text-xl">
                  {stat.icon}
                </div>

                <p className="text-[10px] text-slate-500 mt-3">
                  {stat.label}
                </p>

                <p className="text-xl font-black text-slate-100 mt-1">
                  {stat.value}
                </p>
              </div>
            ),
          )}
        </section>

        {/* Lessons list */}

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="font-black">
                دروس الوحدة
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                اختر الدرس لفتح لوحة إدارة مكوناته.
              </p>
            </div>

            <span className="text-xs text-slate-500">
              {lessons.length} درس
            </span>
          </div>

          {lessons.length === 0 ? (
            renderEmpty(
              "لا توجد دروس في الوحدة المحددة.",
            )
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {lessons.map(
                (lesson) => {
                  const active =
                    selectedLessonId ===
                    lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() =>
                        openLesson(lesson)
                      }
                      className={`text-right rounded-2xl border p-5 transition ${
                        active
                          ? "border-amber-500/60 bg-amber-500/10"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                          {
                            lesson.lesson_number
                          }
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black text-sm">
                            {lesson.title}
                          </h3>

                          {lesson.content_summary && (
                            <p className="text-xs text-slate-500 mt-2 leading-6 line-clamp-2">
                              {
                                lesson.content_summary
                              }
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            {lesson.video_url && (
                              <span className="text-[9px] text-blue-400">
                                VIDEO
                              </span>
                            )}

                            {lesson.infographic_url && (
                              <span className="text-[9px] text-purple-400">
                                INFOGRAPHIC
                              </span>
                            )}

                            {lesson.game_url && (
                              <span className="text-[9px] text-emerald-400">
                                GAME
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

        {/* Lesson content */}

        {selectedLesson && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black">
                  {selectedLesson.title}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  إدارة مكونات المحتوى
                </p>
              </div>

              {lessonLoading && (
                <span className="text-xs text-amber-400 animate-pulse">
                  جاري تحميل مكونات الدرس...
                </span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black transition ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}

                  {tab.count !==
                    undefined && (
                    <span className="mr-2 opacity-70">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {renderActiveTab()}
          </section>
        )}

        {/* Current architecture notice */}

        <section className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-xs font-black text-blue-400">
            ملاحظة هندسية
          </p>

          <p className="text-xs text-slate-400 mt-2 leading-7">
            هذه الشاشة تستخدم الـAPI الحالي لعرض وإدارة
            بنية المحتوى دون الاتصال المباشر بقاعدة البيانات
            من الـFrontend. عمليات الإنشاء والتعديل والحذف
            ستُضاف بعد تجهيز Admin CRUD API في الـBackend،
            حتى لا نضع endpoints وهمية أو نعيد استخدام جداول
            الـlegacy.
          </p>
        </section>

      </div>
    </main>
  );
};

export default AdminDashboard;