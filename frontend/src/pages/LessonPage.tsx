import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../api/apiClient";

interface Lesson {
  id: number;
  subject_id?: number | null;
  unit_id?: number | null;
  title: string;
  unit_number?: number | null;
  lesson_number?: number | null;
  content_summary?: string | null;
  video_url?: string | null;
  infographic_url?: string | null;
  game_url?: string | null;
  created_at?: string | null;
}

interface ContentBlock {
  id: number;
  lesson_id?: number | null;
  block_type?: string | null;
  content?: string | null;
  asset_id?: number | null;
  sort_order?: number | null;
  is_published?: boolean | null;
  created_at?: string | null;
}

interface LessonAsset {
  id: number;
  lesson_id?: number | null;
  asset_type?: string | null;
  title?: string | null;
  url?: string | null;
  storage_path?: string | null;
  alt_text?: string | null;
  metadata?: Record<string, unknown> | null;
  sort_order?: number | null;
  is_published?: boolean | null;
  created_at?: string | null;
}

interface VocabularyItem {
  id: number;
  lesson_id?: number | null;
  term: string;
  definition?: string | null;
  pronunciation?: string | null;
  example?: string | null;
  created_at?: string | null;
}

interface LearningObjective {
  id: number;
  lesson_id?: number | null;
  objective_code?: string | null;
  statement: string;
  cognitive_level?: string | null;
  created_at?: string | null;
}

interface Concept {
  id: number;
  subject_id?: number | null;
  name: string;
  description?: string | null;
  is_primary?: boolean;
  created_at?: string | null;
}

interface QuestionOption {
  id: number;
  question_id?: string | null;
  option_key?: string | null;
  option_text?: string | null;
  sort_order?: number | null;
  metadata?: Record<string, unknown> | null;
}

interface Question {
  id: string;
  question_type?: string | null;
  difficulty?: string | null;
  prompt?: string | null;
  explanation?: string | null;
  correct_answer?: string | null;
  metadata?: Record<string, unknown> | null;
  source?: string | null;
  status?: string | null;
  skill_type?: string | null;
  generation_source?: string | null;
  relevance?: number | null;
  options?: QuestionOption[];
}

const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [assets, setAssets] = useState<LessonAsset[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const [revealedAnswers, setRevealedAnswers] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!lessonId) {
      setError("معرف الدرس غير صالح.");
      setLoading(false);
      return;
    }

    const id = Number(lessonId);

    if (!Number.isInteger(id) || id <= 0) {
      setError("معرف الدرس غير صالح.");
      setLoading(false);
      return;
    }

    let active = true;

    const loadLesson = async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * The lesson endpoint is the source of truth for the lesson
         * itself. The additional endpoints provide the structured
         * educational data belonging to the lesson.
         */
        const [
          lessonData,
          contentData,
          assetsData,
          vocabularyData,
          objectivesData,
          conceptsData,
          questionsData,
        ] = await Promise.all([
          apiClient.getLesson(id),
          apiClient.getLessonContent(id),
          apiClient.getLessonAssets(id),
          apiClient.getLessonVocabulary(id),
          apiClient.getLessonObjectives(id),
          apiClient.getLessonConcepts(id),
          apiClient.getLessonQuestions(id),
        ]);

        if (!active) return;

        setLesson(
          lessonData &&
            typeof lessonData === "object"
            ? (lessonData as Lesson)
            : null,
        );

        setContent(
          Array.isArray(contentData)
            ? (contentData as ContentBlock[])
            : [],
        );

        setAssets(
          Array.isArray(assetsData)
            ? (assetsData as LessonAsset[])
            : [],
        );

        setVocabulary(
          Array.isArray(vocabularyData)
            ? (vocabularyData as VocabularyItem[])
            : [],
        );

        setObjectives(
          Array.isArray(objectivesData)
            ? (objectivesData as LearningObjective[])
            : [],
        );

        setConcepts(
          Array.isArray(conceptsData)
            ? (conceptsData as Concept[])
            : [],
        );

        setQuestions(
          Array.isArray(questionsData)
            ? (questionsData as Question[])
            : [],
        );

        setSelectedAnswers({});
        setRevealedAnswers({});
      } catch (err) {
        console.error("Failed to load lesson:", err);

        if (!active) return;

        setLesson(null);
        setContent([]);
        setAssets([]);
        setVocabulary([]);
        setObjectives([]);
        setConcepts([]);
        setQuestions([]);
        setError("تعذر تحميل بيانات الدرس.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      active = false;
    };
  }, [lessonId]);

  const getQuestionAnswer = (
    question: Question,
  ): string | null => {
    if (
      question.correct_answer !== undefined &&
      question.correct_answer !== null
    ) {
      return String(question.correct_answer);
    }

    return null;
  };

  const handleAnswer = (
    questionId: string,
    answer: string,
  ) => {
    setSelectedAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));

    setRevealedAnswers((previous) => ({
      ...previous,
      [questionId]: true,
    }));
  };

  const isCorrectAnswer = (
    question: Question,
    option: QuestionOption,
  ) => {
    const answer = getQuestionAnswer(question);

    if (!answer) {
      return false;
    }

    const normalizedAnswer = answer
      .trim()
      .toLowerCase();

    const optionKey = option.option_key
      ?.trim()
      .toLowerCase();

    const optionText = option.option_text
      ?.trim()
      .toLowerCase();

    return (
      normalizedAnswer === optionKey ||
      normalizedAnswer === optionText
    );
  };

  if (loading) {
    return (
      <main
        className="max-w-4xl mx-auto px-4 py-10 text-slate-100"
        dir="rtl"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-amber-400 font-bold animate-pulse">
            جاري تحميل الدرس...
          </p>
        </div>
      </main>
    );
  }

  if (error || !lesson) {
    return (
      <main
        className="max-w-4xl mx-auto px-4 py-10 text-slate-100"
        dir="rtl"
      >
        <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center">
          <h1 className="text-xl font-black text-red-400">
            الدرس غير متاح
          </h1>

          <p className="text-sm text-slate-400 mt-3">
            {error ?? "لم يتم العثور على الدرس."}
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
      {/* --------------------------------------------------
          Navigation
      -------------------------------------------------- */}

      <Link
        to={
          lesson.unit_id
            ? `/unit/${lesson.unit_id}`
            : "/student"
        }
        className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold"
      >
        → العودة للوحدة
      </Link>

      {/* --------------------------------------------------
          Lesson Header
      -------------------------------------------------- */}

      <header className="mt-5 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
          📖 الدرس
          {lesson.lesson_number !== null &&
            lesson.lesson_number !== undefined && (
              <span>
                #{lesson.lesson_number}
              </span>
            )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-amber-400 mt-3">
          {lesson.title}
        </h1>

        {lesson.content_summary && (
          <p className="text-slate-300 mt-4 leading-8 text-base">
            {lesson.content_summary}
          </p>
        )}
      </header>

      {/* --------------------------------------------------
          Learning Objectives
      -------------------------------------------------- */}

      {objectives.length > 0 && (
        <section className="mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-xl font-black text-amber-400 mb-4">
              🎯 أهداف التعلم
            </h2>

            <div className="space-y-3">
              {objectives.map((objective) => (
                <div
                  key={objective.id}
                  className="flex items-start gap-3"
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black"
                  >
                    ✓
                  </span>

                  <div>
                    {objective.objective_code && (
                      <span className="text-xs text-amber-400 font-bold block mb-1">
                        {objective.objective_code}
                      </span>
                    )}

                    <p className="text-slate-300 leading-7">
                      {objective.statement}
                    </p>

                    {objective.cognitive_level && (
                      <span className="inline-block mt-2 text-[11px] text-slate-500">
                        مستوى التفكير:{" "}
                        {objective.cognitive_level}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Main Lesson Content
      -------------------------------------------------- */}

      {content.length > 0 && (
        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-black text-amber-400">
            📚 محتوى الدرس
          </h2>

          {content.map((block, index) => (
            <article
              key={block.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center text-xs font-black">
                  {index + 1}
                </span>

                {block.block_type && (
                  <span className="text-xs text-slate-500">
                    {block.block_type}
                  </span>
                )}
              </div>

              {block.content && (
                <div className="text-slate-300 leading-8 whitespace-pre-wrap">
                  {block.content}
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {/* --------------------------------------------------
          Lesson Media
      -------------------------------------------------- */}

      {(lesson.video_url ||
        lesson.infographic_url ||
        lesson.game_url) && (
        <section className="mb-8">
          <h2 className="text-2xl font-black text-amber-400 mb-4">
            🎨 الوسائط والأنشطة
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {lesson.video_url && (
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-lg"
              >
                <div className="text-3xl mb-3">
                  🎬
                </div>

                <h3 className="font-black text-slate-100">
                  فيديو الدرس
                </h3>

                <p className="text-xs text-slate-500 mt-2">
                  مشاهدة الفيديو التعليمي
                </p>
              </a>
            )}

            {lesson.infographic_url && (
              <a
                href={lesson.infographic_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-lg"
              >
                <div className="text-3xl mb-3">
                  🖼️
                </div>

                <h3 className="font-black text-slate-100">
                  الإنفوجراف
                </h3>

                <p className="text-xs text-slate-500 mt-2">
                  فتح الملخص البصري
                </p>
              </a>
            )}

            {lesson.game_url && (
              <a
                href={lesson.game_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-lg"
              >
                <div className="text-3xl mb-3">
                  🎮
                </div>

                <h3 className="font-black text-slate-100">
                  اللعبة التعليمية
                </h3>

                <p className="text-xs text-slate-500 mt-2">
                  بدء النشاط التفاعلي
                </p>
              </a>
            )}
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Educational Assets
      -------------------------------------------------- */}

      {assets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-black text-amber-400 mb-4">
            📎 الموارد التعليمية
          </h2>

          <div className="space-y-3">
            {assets.map((asset) => {
              if (!asset.url) {
                return null;
              }

              return (
                <a
                  key={asset.id}
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      📎
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-100">
                        {asset.title ??
                          "فتح المورد التعليمي"}
                      </p>

                      {asset.asset_type && (
                        <p className="text-xs text-slate-500 mt-1">
                          {asset.asset_type}
                        </p>
                      )}

                      {asset.alt_text && (
                        <p className="text-xs text-slate-500 mt-1">
                          {asset.alt_text}
                        </p>
                      )}
                    </div>

                    <span className="text-amber-400">
                      ↗
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Concepts
      -------------------------------------------------- */}

      {concepts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-black text-amber-400 mb-4">
            🧠 المفاهيم الأساسية
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {concepts.map((concept) => (
              <article
                key={concept.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-100">
                    {concept.name}
                  </h3>

                  {concept.is_primary && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                      أساسي
                    </span>
                  )}
                </div>

                {concept.description && (
                  <p className="text-sm text-slate-400 mt-2 leading-7">
                    {concept.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Vocabulary
      -------------------------------------------------- */}

      {vocabulary.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-black text-amber-400 mb-4">
            📝 مفردات الدرس
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {vocabulary.map((item) => (
              <article
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
              >
                <h3 className="text-lg font-black text-slate-100">
                  {item.term}
                </h3>

                {item.pronunciation && (
                  <p className="text-xs text-amber-400 mt-1">
                    النطق: {item.pronunciation}
                  </p>
                )}

                {item.definition && (
                  <p className="text-sm text-slate-300 mt-3 leading-7">
                    {item.definition}
                  </p>
                )}

                {item.example && (
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">
                      مثال
                    </p>

                    <p className="text-sm text-slate-300 leading-6">
                      {item.example}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Questions
      -------------------------------------------------- */}

      {questions.length > 0 && (
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-amber-400">
              🎯 اختبر نفسك
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              عدد الأسئلة: {questions.length}
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((question, index) => {
              const selectedAnswer =
                selectedAnswers[question.id];

              const revealed =
                revealedAnswers[question.id];

              return (
                <article
                  key={question.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-bold text-slate-500">
                      السؤال {index + 1}
                    </span>

                    {question.difficulty && (
                      <span className="text-xs text-amber-400">
                        {question.difficulty}
                      </span>
                    )}
                  </div>

                  {question.prompt && (
                    <p className="text-lg font-bold text-slate-100 leading-8">
                      {question.prompt}
                    </p>
                  )}

                  {question.options &&
                    question.options.length > 0 && (
                      <div className="mt-5 space-y-2">
                        {question.options.map(
                          (option) => {
                            const answerValue =
                              option.option_key ??
                              option.option_text ??
                              "";

                            const selected =
                              selectedAnswer ===
                              answerValue;

                            const correct =
                              isCorrectAnswer(
                                question,
                                option,
                              );

                            let optionClass =
                              "border-slate-700 bg-slate-950 hover:border-amber-500/50";

                            if (
                              revealed &&
                              correct
                            ) {
                              optionClass =
                                "border-emerald-500 bg-emerald-500/10";
                            } else if (
                              revealed &&
                              selected &&
                              !correct
                            ) {
                              optionClass =
                                "border-red-500 bg-red-500/10";
                            } else if (
                              selected
                            ) {
                              optionClass =
                                "border-amber-500 bg-amber-500/10";
                            }

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  handleAnswer(
                                    question.id,
                                    answerValue,
                                  )
                                }
                                className={`w-full text-right border rounded-xl p-3 transition-all ${optionClass}`}
                              >
                                {option.option_key && (
                                  <span className="text-amber-400 font-bold ml-2">
                                    {option.option_key}
                                  </span>
                                )}

                                <span className="text-slate-300">
                                  {option.option_text}
                                </span>

                                {revealed &&
                                  correct && (
                                    <span className="float-left text-emerald-400 font-black">
                                      ✓
                                    </span>
                                  )}

                                {revealed &&
                                  selected &&
                                  !correct && (
                                    <span className="float-left text-red-400 font-black">
                                      ✕
                                    </span>
                                  )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}

                  {revealed &&
                    question.explanation && (
                      <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                        <p className="text-xs text-amber-400 font-bold mb-1">
                          💡 التفسير
                        </p>

                        <p className="text-sm text-slate-300 leading-7">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* --------------------------------------------------
          Empty State
      -------------------------------------------------- */}

      {content.length === 0 &&
        assets.length === 0 &&
        vocabulary.length === 0 &&
        objectives.length === 0 &&
        concepts.length === 0 &&
        questions.length === 0 &&
        !lesson.video_url &&
        !lesson.infographic_url &&
        !lesson.game_url && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400">
              لا توجد محتويات إضافية لهذا الدرس حاليًا.
            </p>
          </div>
        )}

      {/* --------------------------------------------------
          Footer Navigation
      -------------------------------------------------- */}

      <div className="mt-10 pt-6 border-t border-slate-800">
        <Link
          to={
            lesson.unit_id
              ? `/unit/${lesson.unit_id}`
              : "/student"
          }
          className="block text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl py-3 transition-colors"
        >
          العودة إلى دروس الوحدة
        </Link>
      </div>
    </main>
  );
};

export default LessonPage;