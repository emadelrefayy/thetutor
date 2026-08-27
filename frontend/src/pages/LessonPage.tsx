import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import { apiClient } from "../api/apiClient";


interface Lesson {
  id: number;
  title: string;
  description?: string | null;
  lesson_number?: number;
  [key: string]: unknown;
}


interface ContentBlock {
  id: number;
  block_type?: string | null;
  content?: string | null;
  title?: string | null;
  sort_order?: number | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}


interface LessonAsset {
  id: number;
  asset_type?: string | null;
  title?: string | null;
  url?: string | null;
  file_url?: string | null;
  sort_order?: number | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}


interface QuestionOption {
  id: number;
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
  metadata?: Record<string, unknown> | null;
  source?: string | null;
  status?: string | null;
  skill_type?: string | null;
  generation_source?: string | null;
  relevance?: number | null;
  options?: QuestionOption[];
}


const LessonPage: React.FC = () => {
  const { lessonId } =
    useParams<{ lessonId: string }>();

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [content, setContent] =
    useState<ContentBlock[]>([]);

  const [assets, setAssets] =
    useState<LessonAsset[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    if (!lessonId) {
      setError("معرف الدرس غير صالح.");
      setLoading(false);
      return;
    }

    const id = Number(lessonId);

    if (!Number.isInteger(id)) {
      setError("معرف الدرس غير صالح.");
      setLoading(false);
      return;
    }

    let active = true;

    const loadLesson = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          lessonData,
          contentData,
          assetsData,
          questionsData,
        ] = await Promise.all([
          apiClient.getLesson(id),
          apiClient.getLessonContent(id),
          apiClient.getLessonAssets(id),
          apiClient.getLessonQuestions(id),
        ]);

        if (!active) return;

        setLesson(lessonData as Lesson);

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

        setQuestions(
          Array.isArray(questionsData)
            ? (questionsData as Question[])
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load lesson:",
          err,
        );

        if (active) {
          setLesson(null);
          setContent([]);
          setAssets([]);
          setQuestions([]);

          setError(
            "تعذر تحميل بيانات الدرس.",
          );
        }
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


  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-950 text-slate-100"
        dir="rtl"
      >
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-amber-400 font-bold animate-pulse">
              جاري تحميل الدرس...
            </p>
          </div>
        </main>
      </div>
    );
  }


  if (error || !lesson) {
    return (
      <div
        className="min-h-screen bg-slate-950 text-slate-100"
        dir="rtl"
      >
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center">
            <h1 className="text-xl font-black text-red-400">
              الدرس غير متاح
            </h1>

            <p className="text-sm text-slate-400 mt-3">
              {error ??
                "لم يتم العثور على الدرس."}
            </p>

            <Link
              to="/student"
              className="inline-block mt-6 text-amber-400 hover:text-amber-300"
            >
              العودة للمناهج
            </Link>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      dir="rtl"
    >
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">

        <Link
          to="/student"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          ← العودة للمناهج
        </Link>


        <header className="mt-5 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-amber-400">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-slate-300 mt-3 leading-7">
              {lesson.description}
            </p>
          )}
        </header>


        {content.length > 0 && (
          <section className="space-y-4 mb-8">
            {content.map((block) => (
              <article
                key={block.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
              >
                {block.title && (
                  <h2 className="text-xl font-black text-slate-100 mb-3">
                    {block.title}
                  </h2>
                )}

                {block.content && (
                  <div className="text-slate-300 leading-8 whitespace-pre-wrap">
                    {block.content}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}


        {assets.length > 0 && (
          <section className="mb-8">

            <h2 className="text-2xl font-black text-amber-400 mb-4">
              📎 الوسائط التعليمية
            </h2>

            <div className="space-y-3">
              {assets.map((asset) => {
                const assetUrl =
                  asset.url ??
                  asset.file_url;

                if (!assetUrl) {
                  return null;
                }

                return (
                  <a
                    key={asset.id}
                    href={assetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        📎
                      </span>

                      <div>
                        <p className="font-bold text-slate-100">
                          {asset.title ??
                            "فتح المورد التعليمي"}
                        </p>

                        {asset.asset_type && (
                          <p className="text-xs text-slate-500 mt-1">
                            {asset.asset_type}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

          </section>
        )}


        {questions.length > 0 && (
          <section>

            <div className="mb-4">
              <h2 className="text-2xl font-black text-amber-400">
                🎯 أسئلة الدرس
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                عدد الأسئلة: {questions.length}
              </p>
            </div>


            <div className="space-y-5">

              {questions.map(
                (question, index) => (
                  <article
                    key={question.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
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
                            (option) => (
                              <div
                                key={option.id}
                                className="border border-slate-700 bg-slate-950 rounded-xl p-3"
                              >
                                <span className="text-amber-400 font-bold ml-2">
                                  {option.option_key}
                                </span>

                                <span className="text-slate-300">
                                  {option.option_text}
                                </span>
                              </div>
                            ),
                          )}

                        </div>
                      )}

                  </article>
                ),
              )}

            </div>

          </section>
        )}


        {content.length === 0 &&
          assets.length === 0 &&
          questions.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">
                لا توجد محتويات إضافية لهذا الدرس حاليًا.
              </p>
            </div>
          )}

      </main>
    </div>
  );
};


export default LessonPage;