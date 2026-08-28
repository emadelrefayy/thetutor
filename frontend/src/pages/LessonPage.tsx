import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";

import {
  apiClient,
  type CurriculumSource,
  type Game,
  type GameDefinition,
  type Lesson,
  type LessonAsset,
  type LessonContentBlock,
  type LessonConcept,
  type LessonVocabulary,
  type LearningObjective,
  type Question,
} from "../api/apiClient";

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const getStringValue = (
  value: unknown,
): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return null;
};

const getContentText = (
  content: unknown,
): string | null => {
  if (typeof content === "string") {
    return content;
  }

  if (
    typeof content === "number" ||
    typeof content === "boolean"
  ) {
    return String(content);
  }

  if (Array.isArray(content)) {
    const parts = content
      .map((item) => getContentText(item))
      .filter(
        (item): item is string =>
          Boolean(item),
      );

    return parts.length > 0
      ? parts.join("\n\n")
      : null;
  }

  if (isRecord(content)) {
    const preferredKeys = [
      "text",
      "body",
      "content",
      "description",
      "statement",
      "value",
    ];

    for (const key of preferredKeys) {
      const value = getContentText(
        content[key],
      );

      if (value) {
        return value;
      }
    }
  }

  return null;
};

const getContentHeading = (
  content: unknown,
): string | null => {
  if (!isRecord(content)) {
    return null;
  }

  const keys = [
    "heading",
    "title",
    "label",
  ];

  for (const key of keys) {
    const value = getStringValue(
      content[key],
    );

    if (value) {
      return value;
    }
  }

  return null;
};

const getContentUrl = (
  content: unknown,
): string | null => {
  if (!isRecord(content)) {
    return null;
  }

  const keys = [
    "url",
    "src",
    "href",
  ];

  for (const key of keys) {
    const value = getStringValue(
      content[key],
    );

    if (value) {
      return value;
    }
  }

  return null;
};

const getContentHtml = (
  content: unknown,
): string | null => {
  if (!isRecord(content)) {
    return null;
  }

  for (const key of [
    "html",
    "embed_html",
  ]) {
    const value = getStringValue(
      content[key],
    );

    if (value) {
      return value;
    }
  }

  return null;
};

const getBlockLabel = (
  blockType?: string | null,
): string => {
  switch (blockType) {
    case "heading":
      return "عنوان";

    case "text":
      return "نص";

    case "example":
      return "مثال";

    case "tip":
      return "نصيحة";

    case "warning":
      return "تنبيه";

    case "vocabulary":
      return "مفردات";

    case "activity":
      return "نشاط";

    case "quiz":
      return "اختبار";

    case "game":
      return "لعبة";

    case "image":
      return "صورة";

    case "infographic":
      return "إنفوجراف";

    case "video":
      return "فيديو";

    case "audio":
      return "صوت";

    case "embed":
      return "محتوى مضمّن";

    default:
      return "محتوى";
  }
};

const getAssetIcon = (
  assetType?: string | null,
): string => {
  switch (assetType) {
    case "image":
      return "🖼️";

    case "infographic":
      return "📊";

    case "video":
      return "🎬";

    case "audio":
      return "🔊";

    case "document":
      return "📄";

    case "game":
      return "🎮";

    case "external":
      return "🔗";

    default:
      return "📎";
  }
};

const getGameIcon = (
  gameType?: string | null,
): string => {
  const value =
    gameType?.toLowerCase() ?? "";

  if (
    value.includes("match") ||
    value.includes("matching")
  ) {
    return "🧩";
  }

  if (
    value.includes("memory") ||
    value.includes("memo")
  ) {
    return "🧠";
  }

  if (
    value.includes("order") ||
    value.includes("sorting")
  ) {
    return "🔢";
  }

  if (
    value.includes("drag") ||
    value.includes("drop")
  ) {
    return "🎯";
  }

  if (
    value.includes("quiz") ||
    value.includes("question")
  ) {
    return "❓";
  }

  return "🎮";
};

const getGameLaunchUrl = (
  game: Game,
): string | null => {
  if (!isRecord(game.game_data)) {
    return null;
  }

  for (const key of [
    "url",
    "frontend_url",
    "launch_url",
    "game_url",
    "href",
  ]) {
    const value = getStringValue(
      game.game_data[key],
    );

    if (value) {
      return value;
    }
  }

  return null;
};

const getDefinitionLaunchUrl = (
  definition: GameDefinition,
): string | null => {
  if (
    definition.template?.frontend_url
  ) {
    return definition.template
      .frontend_url;
  }

  if (!isRecord(definition.settings)) {
    return null;
  }

  for (const key of [
    "url",
    "frontend_url",
    "launch_url",
    "game_url",
    "href",
  ]) {
    const value = getStringValue(
      definition.settings[key],
    );

    if (value) {
      return value;
    }
  }

  return null;
};

const isEmbeddableVideoUrl = (
  url: string,
): boolean => {
  const normalized = url
    .toLowerCase()
    .trim();

  return (
    normalized.includes("youtube.com/watch") ||
    normalized.includes("youtu.be/") ||
    normalized.includes("youtube-nocookie.com/embed") ||
    normalized.includes("vimeo.com/")
  );
};

const getVideoEmbedUrl = (
  url: string,
): string => {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes(
        "youtube.com",
      )
    ) {
      const videoId =
        parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (
      parsed.hostname === "youtu.be"
    ) {
      const videoId =
        parsed.pathname
          .replace(/^\/+/, "")
          .split("/")[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (
      parsed.hostname.includes(
        "youtube-nocookie.com",
      )
    ) {
      return url;
    }

    if (
      parsed.hostname.includes(
        "vimeo.com",
      )
    ) {
      const parts =
        parsed.pathname
          .split("/")
          .filter(Boolean);

      const videoId =
        parts[parts.length - 1];

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
  } catch {
    return url;
  }

  return url;
};

const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{
    lessonId: string;
  }>();

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [content, setContent] =
    useState<LessonContentBlock[]>([]);

  const [assets, setAssets] =
    useState<LessonAsset[]>([]);

  const [vocabulary, setVocabulary] =
    useState<LessonVocabulary[]>([]);

  const [objectives, setObjectives] =
    useState<LearningObjective[]>([]);

  const [concepts, setConcepts] =
    useState<LessonConcept[]>([]);

  const [sources, setSources] =
    useState<CurriculumSource[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [games, setGames] =
    useState<Game[]>([]);

  const [gameDefinitions, setGameDefinitions] =
    useState<GameDefinition[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<string, string>>({});

  useEffect(() => {
    if (!lessonId) {
      setError("معرف الدرس غير صالح.");
      setLoading(false);
      return;
    }

    const id = Number(lessonId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
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
          vocabularyData,
          objectivesData,
          conceptsData,
          sourcesData,
          questionsData,
          gamesData,
          definitionsData,
        ] = await Promise.all([
          apiClient.getLesson(id),
          apiClient.getLessonContent(id),
          apiClient.getLessonAssets(id),
          apiClient.getLessonVocabulary(id),
          apiClient.getLessonObjectives(id),
          apiClient.getLessonConcepts(id),
          apiClient.getLessonSources(id),
          apiClient.getLessonQuestions(id),
          apiClient.getLessonGames(id),
          apiClient.getGameDefinitions({
            lesson_id: id,
          }),
        ]);

        if (!active) {
          return;
        }

        setLesson(
          lessonData &&
            typeof lessonData ===
              "object"
            ? lessonData
            : null,
        );

        setContent(
          Array.isArray(contentData)
            ? contentData
            : [],
        );

        setAssets(
          Array.isArray(assetsData)
            ? assetsData
            : [],
        );

        setVocabulary(
          Array.isArray(vocabularyData)
            ? vocabularyData
            : [],
        );

        setObjectives(
          Array.isArray(objectivesData)
            ? objectivesData
            : [],
        );

        setConcepts(
          Array.isArray(conceptsData)
            ? conceptsData
            : [],
        );

        setSources(
          Array.isArray(sourcesData)
            ? sourcesData
            : [],
        );

        setQuestions(
          Array.isArray(questionsData)
            ? questionsData
            : [],
        );

        setGames(
          Array.isArray(gamesData)
            ? gamesData
            : [],
        );

        setGameDefinitions(
          Array.isArray(
            definitionsData,
          )
            ? definitionsData
            : [],
        );

        setSelectedAnswers({});
      } catch (err) {
        console.error(
          "Failed to load lesson:",
          err,
        );

        if (!active) {
          return;
        }

        setLesson(null);
        setContent([]);
        setAssets([]);
        setVocabulary([]);
        setObjectives([]);
        setConcepts([]);
        setSources([]);
        setQuestions([]);
        setGames([]);
        setGameDefinitions([]);

        setError(
          "تعذر تحميل بيانات الدرس.",
        );
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

  const assetsById = useMemo(() => {
    const map = new Map<
      string,
      LessonAsset
    >();

    assets.forEach((asset) => {
      map.set(
        String(asset.id),
        asset,
      );
    });

    return map;
  }, [assets]);

  const allGamesCount =
    games.length +
    gameDefinitions.length;

  const handleAnswer = (
    questionId: string,
    answer: string,
  ) => {
    setSelectedAnswers(
      (previous) => ({
        ...previous,
        [questionId]: answer,
      }),
    );
  };

  const renderContentBlock = (
    block: LessonContentBlock,
    index: number,
  ) => {
    const blockType =
      block.block_type ?? "text";

    const asset = block.asset_id
      ? assetsById.get(
          String(block.asset_id),
        )
      : undefined;

    const heading =
      getContentHeading(
        block.content,
      );

    const text =
      getContentText(
        block.content,
      );

    const contentUrl =
      getContentUrl(
        block.content,
      );

    const html =
      getContentHtml(
        block.content,
      );

    if (
      blockType === "image" ||
      blockType === "infographic"
    ) {
      const imageUrl =
        asset?.url ?? contentUrl;

      if (imageUrl) {
        return (
          <article
            key={String(block.id)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                {blockType ===
                "infographic"
                  ? "📊"
                  : "🖼️"}
              </span>

              <span className="text-xs font-bold text-slate-500">
                {getBlockLabel(
                  blockType,
                )}
              </span>
            </div>

            {heading && (
              <h3 className="text-xl font-black text-slate-100 mb-4">
                {heading}
              </h3>
            )}

            <img
              src={imageUrl}
              alt={
                asset?.alt_text ??
                heading ??
                "محتوى الدرس"
              }
              className="w-full rounded-xl border border-slate-800 object-contain max-h-[650px]"
            />

            {text && (
              <p className="text-sm text-slate-400 mt-4 leading-7 whitespace-pre-wrap">
                {text}
              </p>
            )}
          </article>
        );
      }
    }

    if (blockType === "video") {
      const videoUrl =
        asset?.url ?? contentUrl;

      if (videoUrl) {
        return (
          <article
            key={String(block.id)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                🎬
              </span>

              <span className="text-xs font-bold text-slate-500">
                فيديو
              </span>
            </div>

            {heading && (
              <h3 className="text-xl font-black text-slate-100 mb-4">
                {heading}
              </h3>
            )}

            {isEmbeddableVideoUrl(
              videoUrl,
            ) ? (
              <div className="aspect-video overflow-hidden rounded-xl bg-black border border-slate-800">
                <iframe
                  src={getVideoEmbedUrl(
                    videoUrl,
                  )}
                  title={
                    heading ??
                    "فيديو الدرس"
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                controls
                preload="metadata"
                className="w-full rounded-xl bg-black"
                src={videoUrl}
              >
                متصفحك لا يدعم تشغيل
                الفيديو.
              </video>
            )}

            {text && (
              <p className="text-sm text-slate-400 mt-4 leading-7 whitespace-pre-wrap">
                {text}
              </p>
            )}
          </article>
        );
      }
    }

    if (blockType === "audio") {
      const audioUrl =
        asset?.url ?? contentUrl;

      if (audioUrl) {
        return (
          <article
            key={String(block.id)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                🔊
              </span>

              <span className="text-xs font-bold text-slate-500">
                ملف صوتي
              </span>
            </div>

            {heading && (
              <h3 className="text-xl font-black text-slate-100 mb-4">
                {heading}
              </h3>
            )}

            <audio
              controls
              preload="metadata"
              className="w-full"
              src={audioUrl}
            >
              متصفحك لا يدعم تشغيل
              الصوت.
            </audio>

            {text && (
              <p className="text-sm text-slate-400 mt-4 leading-7 whitespace-pre-wrap">
                {text}
              </p>
            )}
          </article>
        );
      }
    }

    if (
      blockType === "example" ||
      blockType === "tip" ||
      blockType === "warning"
    ) {
      const styles = {
        example: {
          icon: "💡",
          title: "مثال",
        },
        tip: {
          icon: "💎",
          title: "نصيحة",
        },
        warning: {
          icon: "⚠️",
          title: "تنبيه",
        },
      };

      const style =
        styles[
          blockType as keyof typeof styles
        ];

      return (
        <article
          key={String(block.id)}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">
              {style.icon}
            </span>

            <h3 className="font-black text-amber-400">
              {heading ??
                style.title}
            </h3>
          </div>

          {text && (
            <p className="text-slate-300 leading-8 whitespace-pre-wrap">
              {text}
            </p>
          )}
        </article>
      );
    }

    if (blockType === "embed") {
      if (html) {
        return (
          <article
            key={String(block.id)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
          >
            {heading && (
              <h3 className="text-xl font-black text-slate-100 mb-4">
                {heading}
              </h3>
            )}

            <div
              className="rounded-xl overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />

            {text && (
              <p className="text-sm text-slate-400 mt-4 leading-7 whitespace-pre-wrap">
                {text}
              </p>
            )}
          </article>
        );
      }

      if (contentUrl) {
        return (
          <article
            key={String(block.id)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
          >
            {heading && (
              <h3 className="text-xl font-black text-slate-100 mb-4">
                {heading}
              </h3>
            )}

            <div className="aspect-video overflow-hidden rounded-xl bg-black border border-slate-800">
              <iframe
                src={contentUrl}
                title={
                  heading ??
                  "محتوى مضمّن"
                }
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </article>
        );
      }
    }

    if (
      blockType === "game" ||
      blockType === "activity"
    ) {
      const activityUrl =
        asset?.url ?? contentUrl;

      return (
        <article
          key={String(block.id)}
          className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
              {blockType ===
              "game"
                ? "🎮"
                : "🎯"}
            </span>

            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500">
                {getBlockLabel(
                  blockType,
                )}
              </p>

              <h3 className="text-lg font-black text-slate-100">
                {heading ??
                  (blockType ===
                  "game"
                    ? "لعبة تعليمية"
                    : "نشاط تعليمي")}
              </h3>
            </div>
          </div>

          {text && (
            <p className="text-sm text-slate-400 mt-4 leading-7 whitespace-pre-wrap">
              {text}
            </p>
          )}

          {activityUrl && (
            <a
              href={activityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-4 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors"
            >
              {blockType ===
              "game"
                ? "بدء اللعبة 🎮"
                : "فتح النشاط ↗"}
            </a>
          )}
        </article>
      );
    }

    return (
      <article
        key={String(block.id)}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center text-xs font-black">
            {index + 1}
          </span>

          <span className="text-xs font-bold text-slate-500">
            {getBlockLabel(
              blockType,
            )}
          </span>
        </div>

        {blockType ===
          "heading" &&
          heading && (
            <h3 className="text-2xl font-black text-amber-400 leading-9">
              {heading}
            </h3>
          )}

        {blockType !==
          "heading" &&
          heading && (
            <h3 className="text-xl font-black text-slate-100 mb-3">
              {heading}
            </h3>
          )}

        {text && (
          <p className="text-slate-300 leading-8 whitespace-pre-wrap">
            {text}
          </p>
        )}

        {!text &&
          isRecord(
            block.content,
          ) && (
            <pre className="text-xs text-slate-400 whitespace-pre-wrap break-words bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
              {JSON.stringify(
                block.content,
                null,
                2,
              )}
            </pre>
          )}
      </article>
    );
  };

  if (loading) {
    return (
      <main
        className="max-w-5xl mx-auto px-4 py-10 text-slate-100"
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
        className="max-w-5xl mx-auto px-4 py-10 text-slate-100"
        dir="rtl"
      >
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
      className="max-w-5xl mx-auto px-4 py-6 sm:py-8 text-slate-100"
      dir="rtl"
    >
      <div className="space-y-8 pb-12">
        {/* Navigation */}

        <Link
          to={
            lesson.unit_id
              ? `/unit/${lesson.unit_id}`
              : "/student"
          }
          className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold"
        >
          ← العودة للوحدة
        </Link>

        {/* Lesson Header */}

        <header className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
            📖 الدرس

            {lesson.lesson_number !==
              null &&
              lesson.lesson_number !==
                undefined && (
                <span>
                  #{lesson.lesson_number}
                </span>
              )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-amber-400 mt-4 leading-tight">
            {lesson.title}
          </h1>

          {lesson.content_summary && (
            <p className="text-slate-300 mt-4 leading-8">
              {lesson.content_summary}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-5">
            {lesson.unit_number !==
              null &&
              lesson.unit_number !==
                undefined && (
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400">
                  الوحدة{" "}
                  <span className="text-amber-400 font-bold">
                    {lesson.unit_number}
                  </span>
                </span>
              )}

            {lesson.lesson_number !==
              null &&
              lesson.lesson_number !==
                undefined && (
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400">
                  الدرس{" "}
                  <span className="text-amber-400 font-bold">
                    {lesson.lesson_number}
                  </span>
                </span>
              )}

            {allGamesCount >
              0 && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-bold">
                🎮{" "}
                {allGamesCount} نشاط
                تفاعلي
              </span>
            )}
          </div>
        </header>

        {/* Learning Objectives */}

        {objectives.length >
          0 && (
          <section>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h2 className="text-xl font-black text-amber-400 mb-4">
                🎯 أهداف التعلم
              </h2>

              <div className="space-y-3">
                {objectives.map(
                  (objective) => (
                    <div
                      key={
                        objective.id
                      }
                      className="flex items-start gap-3"
                    >
                      <span className="shrink-0 w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                        ✓
                      </span>

                      <div>
                        {objective.objective_code && (
                          <span className="text-xs text-amber-400 font-bold block mb-1">
                            {
                              objective.objective_code
                            }
                          </span>
                        )}

                        <p className="text-slate-300 leading-7">
                          {
                            objective.statement
                          }
                        </p>

                        {objective.cognitive_level && (
                          <span className="inline-block mt-2 text-[11px] text-slate-500">
                            مستوى التفكير:{" "}
                            {
                              objective.cognitive_level
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* Main Lesson Content */}

        {content.length >
          0 && (
          <section>
            <h2 className="text-2xl font-black text-amber-400 mb-4">
              📚 محتوى الدرس
            </h2>

            <div className="space-y-4">
              {content.map(
                (
                  block,
                  index,
                ) =>
                  renderContentBlock(
                    block,
                    index,
                  ),
              )}
            </div>
          </section>
        )}

        {/* Lesson Direct Media */}

        {(lesson.video_url ||
          lesson.infographic_url ||
          lesson.game_url) && (
          <section>
            <h2 className="text-2xl font-black text-amber-400 mb-4">
              🎨 الوسائط والأنشطة
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              {lesson.video_url && (
                <a
                  href={
                    lesson.video_url
                  }
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
                    مشاهدة الفيديو
                    التعليمي
                  </p>
                </a>
              )}

              {lesson.infographic_url && (
                <a
                  href={
                    lesson.infographic_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-lg"
                >
                  <div className="text-3xl mb-3">
                    📊
                  </div>

                  <h3 className="font-black text-slate-100">
                    الإنفوجراف
                  </h3>

                  <p className="text-xs text-slate-500 mt-2">
                    فتح الملخص
                    البصري
                  </p>
                </a>
              )}

              {lesson.game_url && (
                <a
                  href={
                    lesson.game_url
                  }
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
                    بدء النشاط
                    التفاعلي
                  </p>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Games */}

        {allGamesCount >
          0 && (
          <section>
            <h2 className="text-2xl font-black text-amber-400 mb-4">
              🎮 الألعاب والأنشطة
              التفاعلية
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {games.map(
                (game) => {
                  const url =
                    getGameLaunchUrl(
                      game,
                    );

                  return (
                    <article
                      key={`game-${game.id}`}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <span className="w-12 h-12 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                          {getGameIcon(
                            game.game_type,
                          )}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 font-bold">
                            {game.game_type}
                          </p>

                          <h3 className="text-lg font-black text-slate-100 mt-1">
                            {game.title ??
                              "لعبة تعليمية"}
                          </h3>

                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black transition-colors"
                            >
                              بدء اللعبة
                              🎮
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}

              {gameDefinitions.map(
                (definition) => {
                  const url =
                    getDefinitionLaunchUrl(
                      definition,
                    );

                  return (
                    <article
                      key={`definition-${definition.id}`}
                      className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5 shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <span className="w-12 h-12 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                          {getGameIcon(
                            definition
                              .template
                              ?.game_type,
                          )}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 font-bold">
                            {definition
                              .template
                              ?.name ??
                              definition
                                .scope_type}
                          </p>

                          <h3 className="text-lg font-black text-slate-100 mt-1">
                            {
                              definition.title
                            }
                          </h3>

                          {definition
                            .template
                            ?.description && (
                            <p className="text-sm text-slate-400 mt-2 leading-6">
                              {
                                definition
                                  .template
                                  .description
                              }
                            </p>
                          )}

                          {definition
                            .questions &&
                            definition
                              .questions
                              .length >
                              0 && (
                              <p className="text-xs text-slate-500 mt-2">
                                {
                                  definition
                                    .questions
                                    .length
                                }{" "}
                                سؤال
                              </p>
                            )}

                          {url && (
                            <a
                              href={
                                url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black transition-colors"
                            >
                              بدء النشاط
                              🎮
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* Educational Assets */}

        {assets.length >
          0 && (
          <section>
            <h2 className="text-2xl font-black text-amber-400 mb-4">
              📎 الموارد التعليمية
            </h2>

            <div className="space-y-3">
              {assets.map(
                (asset) => {
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
                          {getAssetIcon(
                            asset.asset_type,
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-100">
                            {asset.title ??
                              "فتح المورد التعليمي"}
                          </p>

                          {asset.asset_type && (
                            <p className="text-xs text-slate-500 mt-1">
                              {
                                asset.asset_type
                              }
                            </p>
                          )}

                          {asset.alt_text && (
                            <p className="text-xs text-slate-500 mt-1">
                              {
                                asset.alt_text
                              }
                            </p>
                          )}
                        </div>

                        <span className="text-amber-400">
                          ↗
                        </span>
                      </div>
                    </a>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* Concepts */}

        {concepts.length >
          0 && (
          <section>
            <h2 className="text-2xl font-black text-amber-400 mb-4">
              🧠 المفاهيم الأساسية
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {concepts.map(
                (concept) => (
                  <article
                    key={concept.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-100">
                        {
                          concept.name
                        }
                      </h3>

                      {concept.is_primary && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                          أساسي
                        </span>
                      )}
                    </div>

                    {concept.description && (
                      <p className="text-sm text-slate-400 mt-2 leading-7">
                        {
                          concept.description
                        }
                      </p>
                    )}
                  </article>
                ),
              )}
            </div>
          </section>
        )}

        {/* Vocabulary */}

        {vocabulary.length >
          0 && (
          <section>
            <h2 className="text-2xl font-black text-amber-400 mb-4">
              📝 مفردات الدرس
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {vocabulary.map(
                (item) => (
                  <article
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
                  >
                    <h3 className="text-lg font-black text-slate-100">
                      {item.term}
                    </h3>

                    {item.pronunciation && (
                      <p className="text-xs text-amber-400 mt-1">
                        النطق:{" "}
                        {
                          item.pronunciation
                        }
                      </p>
                    )}

                    {item.definition && (
                      <p className="text-sm text-slate-300 mt-3 leading-7">
                        {
                          item.definition
                        }
                      </p>
                    )}

                    {item.example && (
                      <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-1">
                          مثال
                        </p>

                        <p className="text-sm text-slate-300 leading-6">
                          {
                            item.example
                          }
                        </p>
                      </div>
                    )}
                  </article>
                ),
              )}
            </div>
          </section>
        )}

        {/* Sources */}

        {sources.length >
          0 && (
          <section>
            <h2 className="text-2xl font-black text-amber-400 mb-4">
              📚 مصادر الدرس
            </h2>

            <div className="space-y-3">
              {sources.map(
                (source) => (
                  <article
                    key={source.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        📚
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-slate-100">
                          {
                            source.name
                          }
                        </h3>

                        {source.source_type && (
                          <p className="text-xs text-amber-400 mt-1">
                            {
                              source.source_type
                            }
                          </p>
                        )}

                        {source.publisher && (
                          <p className="text-sm text-slate-400 mt-1">
                            الناشر:{" "}
                            {
                              source.publisher
                            }
                          </p>
                        )}

                        {source.edition && (
                          <p className="text-xs text-slate-500 mt-1">
                            الطبعة:{" "}
                            {
                              source.edition
                            }
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

                        {source.locator && (
                          <p className="text-xs text-slate-500 mt-2">
                            الموضع:{" "}
                            {
                              source.locator
                            }
                          </p>
                        )}

                        {source.notes && (
                          <p className="text-sm text-slate-400 mt-2 leading-6">
                            {
                              source.notes
                            }
                          </p>
                        )}

                        {source.rights_notes && (
                          <p className="text-xs text-slate-500 mt-2 leading-6">
                            ملاحظات الحقوق:{" "}
                            {
                              source.rights_notes
                            }
                          </p>
                        )}

                        {source.source_url && (
                          <a
                            href={
                              source.source_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex mt-3 text-sm text-amber-400 hover:text-amber-300 font-bold"
                          >
                            فتح المصدر ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>
        )}

        {/* Questions */}

        {questions.length >
          0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-black text-amber-400">
                🎯 اختبر نفسك
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                عدد الأسئلة:{" "}
                {questions.length}
              </p>

              <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-300 leading-6">
                  هذه الأسئلة للعرض
                  والتدريب داخل الدرس.
                  تسجيل المحاولات
                  والتصحيح النهائي يتم
                  من خلال نظام الألعاب
                  والتقييم التفاعلي.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {questions.map(
                (
                  question,
                  index,
                ) => {
                  const selectedAnswer =
                    selectedAnswers[
                      question.id
                    ];

                  return (
                    <article
                      key={
                        question.id
                      }
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-xs font-bold text-slate-500">
                          السؤال{" "}
                          {index + 1}
                        </span>

                        {question.difficulty && (
                          <span className="text-xs text-amber-400">
                            {
                              question.difficulty
                            }
                          </span>
                        )}
                      </div>

                      {question.prompt && (
                        <p className="text-lg font-bold text-slate-100 leading-8">
                          {
                            question.prompt
                          }
                        </p>
                      )}

                      {question.options &&
                        question.options
                          .length >
                          0 && (
                          <div className="mt-5 space-y-2">
                            {question.options.map(
                              (
                                option,
                              ) => {
                                const answerValue =
                                  option.option_key ??
                                  option.option_text ??
                                  "";

                                const selected =
                                  selectedAnswer ===
                                  answerValue;

                                return (
                                  <button
                                    key={
                                      option.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      handleAnswer(
                                        question.id,
                                        answerValue,
                                      )
                                    }
                                    className={[
                                      "w-full text-right border rounded-xl p-3 transition-all",
                                      selected
                                        ? "border-amber-500 bg-amber-500/10"
                                        : "border-slate-700 bg-slate-950 hover:border-amber-500/50",
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    {option.option_key && (
                                      <span className="text-amber-400 font-bold ml-2">
                                        {
                                          option.option_key
                                        }
                                      </span>
                                    )}

                                    <span className="text-slate-300">
                                      {
                                        option.option_text
                                      }
                                    </span>

                                    {selected && (
                                      <span className="float-left text-amber-400 font-black">
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        )}
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* Empty State */}

        {content.length ===
          0 &&
          assets.length ===
            0 &&
          vocabulary.length ===
            0 &&
          objectives.length ===
            0 &&
          concepts.length ===
            0 &&
          sources.length ===
            0 &&
          questions.length ===
            0 &&
          games.length ===
            0 &&
          gameDefinitions.length ===
            0 &&
          !lesson.video_url &&
          !lesson.infographic_url &&
          !lesson.game_url && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">
                لا توجد محتويات إضافية لهذا
                الدرس حاليًا.
              </p>
            </div>
          )}

        {/* Footer Navigation */}

        <div className="pt-2">
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
      </div>
    </main>
  );
};

export default LessonPage;
```0