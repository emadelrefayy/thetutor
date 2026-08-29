import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";

import {
  apiClient,
  type CurriculumSource,
  type GameDefinition,
  type Lesson,
  type LessonAsset,
  type LessonContentBlock,
  type LessonConcept,
  type LessonVocabulary,
  type LearningObjective,
  type Question,
} from "../api/apiClient";

/* =====================================================================
 * Helpers
 * ===================================================================== */

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const getString = (
  value: unknown,
): string | null => {
  if (typeof value === "string") {
    const result = value.trim();
    return result || null;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return null;
};

const getText = (
  value: unknown,
): string | null => {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map(getText)
      .filter(
        (item): item is string =>
          Boolean(item),
      );

    return parts.length
      ? parts.join("\n\n")
      : null;
  }

  if (isRecord(value)) {
    const preferredKeys = [
      "text",
      "body",
      "content",
      "description",
      "statement",
      "value",
    ];

    for (const key of preferredKeys) {
      const result = getText(value[key]);

      if (result) {
        return result;
      }
    }
  }

  return null;
};

const getHeading = (
  value: unknown,
): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  for (const key of [
    "heading",
    "title",
    "label",
  ]) {
    const result = getString(value[key]);

    if (result) {
      return result;
    }
  }

  return null;
};

const getUrl = (
  value: unknown,
): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  for (const key of [
    "url",
    "src",
    "href",
  ]) {
    const result = getString(value[key]);

    if (result) {
      return result;
    }
  }

  return null;
};

const getHtml = (
  value: unknown,
): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  for (const key of [
    "html",
    "embed_html",
  ]) {
    const result = getString(value[key]);

    if (result) {
      return result;
    }
  }

  return null;
};

const blockLabel = (
  type: string,
): string => {
  switch (type) {
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
      return "تدريب";

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

const assetIcon = (
  type: string,
): string => {
  switch (type) {
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

const gameIcon = (
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

const gameLaunchUrl = (
  game: GameDefinition,
): string | null => {
  if (game.template?.frontend_url) {
    return game.template.frontend_url;
  }

  if (!isRecord(game.settings)) {
    return null;
  }

  for (const key of [
    "url",
    "frontend_url",
    "launch_url",
    "game_url",
    "href",
  ]) {
    const value = getString(
      game.settings[key],
    );

    if (value) {
      return value;
    }
  }

  return null;
};

const isYoutubeOrVimeo = (
  url: string,
): boolean => {
  const value = url.toLowerCase();

  return (
    value.includes("youtube.com/watch") ||
    value.includes("youtu.be/") ||
    value.includes("youtube-nocookie.com/embed") ||
    value.includes("vimeo.com/")
  );
};

const videoEmbedUrl = (
  url: string,
): string => {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes(
        "youtube.com",
      )
    ) {
      const id =
        parsed.searchParams.get("v");

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (
      parsed.hostname ===
      "youtu.be"
    ) {
      const id =
        parsed.pathname
          .replace(/^\/+/, "")
          .split("/")[0];

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
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

      const id =
        parts[parts.length - 1];

      if (id) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  } catch {
    return url;
  }

  return url;
};

/* =====================================================================
 * Component
 * ===================================================================== */

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

  const [objectives, setObjectives] =
    useState<LearningObjective[]>([]);

  const [vocabulary, setVocabulary] =
    useState<LessonVocabulary[]>([]);

  const [concepts, setConcepts] =
    useState<LessonConcept[]>([]);

  const [sources, setSources] =
    useState<CurriculumSource[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [games, setGames] =
    useState<GameDefinition[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const assetsById = useMemo(() => {
    const map = new Map<
      string,
      LessonAsset
    >();

    for (const asset of assets) {
      map.set(String(asset.id), asset);
    }

    return map;
  }, [assets]);

  /* -------------------------------------------------------------------
   * Load lesson
   * ------------------------------------------------------------------- */

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

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          lessonData,
          contentData,
          assetsData,
          objectivesData,
          vocabularyData,
          conceptsData,
          sourcesData,
          questionsData,
          gamesData,
        ] = await Promise.all([
          apiClient.getLesson(id),
          apiClient.getLessonContent(id),
          apiClient.getLessonAssets(id),
          apiClient.getLessonObjectives(id),
          apiClient.getLessonVocabulary(id),
          apiClient.getLessonConcepts(id),
          apiClient.getLessonSources(id),
          apiClient.getLessonQuestions(id),
          apiClient.getGameDefinitions({
            lesson_id: id,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setLesson(lessonData);
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
        setObjectives(
          Array.isArray(objectivesData)
            ? objectivesData
            : [],
        );
        setVocabulary(
          Array.isArray(vocabularyData)
            ? vocabularyData
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
      } catch (err) {
        console.error(
          "Lesson loading failed:",
          err,
        );

        if (cancelled) {
          return;
        }

        setLesson(null);
        setContent([]);
        setAssets([]);
        setObjectives([]);
        setVocabulary([]);
        setConcepts([]);
        setSources([]);
        setQuestions([]);
        setGames([]);

        setError(
          "تعذر تحميل بيانات الدرس.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  /* -------------------------------------------------------------------
   * Content renderer
   * ------------------------------------------------------------------- */

  const renderBlock = (
    block: LessonContentBlock,
    index: number,
  ) => {
    const type =
      block.block_type || "text";

    const asset = block.asset_id
      ? assetsById.get(
          String(block.asset_id),
        )
      : undefined;

    const heading =
      getHeading(block.content);

    const text =
      getText(block.content);

    const url =
      asset?.url ??
      getUrl(block.content);

    const html =
      getHtml(block.content);

    if (
      type === "image" ||
      type === "infographic"
    ) {
      if (!url) {
        return null;
      }

      return (
        <article
          key={block.id}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
              {type === "infographic"
                ? "📊"
                : "🖼️"}
            </span>

            <span className="text-xs font-bold text-slate-500">
              {blockLabel(type)}
            </span>
          </div>

          {heading && (
            <h3 className="mb-4 text-xl font-black text-slate-100">
              {heading}
            </h3>
          )}

          <img
            src={url}
            alt={
              asset?.alt_text ??
              heading ??
              "محتوى الدرس"
            }
            loading="lazy"
            className="max-h-[650px] w-full rounded-xl border border-slate-800 object-contain"
          />

          {text && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {text}
            </p>
          )}
        </article>
      );
    }

    if (type === "video") {
      if (!url) {
        return null;
      }

      return (
        <article
          key={block.id}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
              🎬
            </span>

            <span className="text-xs font-bold text-slate-500">
              فيديو
            </span>
          </div>

          {heading && (
            <h3 className="mb-4 text-xl font-black text-slate-100">
              {heading}
            </h3>
          )}

          {isYoutubeOrVimeo(url) ? (
            <div className="aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black">
              <iframe
                src={videoEmbedUrl(url)}
                title={
                  heading ??
                  "فيديو الدرس"
                }
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              controls
              preload="metadata"
              src={url}
              className="w-full rounded-xl bg-black"
            >
              متصفحك لا يدعم تشغيل
              الفيديو.
            </video>
          )}

          {text && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {text}
            </p>
          )}
        </article>
      );
    }

    if (type === "audio") {
      if (!url) {
        return null;
      }

      return (
        <article
          key={block.id}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
              🔊
            </span>

            <span className="text-xs font-bold text-slate-500">
              صوت
            </span>
          </div>

          {heading && (
            <h3 className="mb-4 text-xl font-black text-slate-100">
              {heading}
            </h3>
          )}

          <audio
            controls
            preload="metadata"
            src={url}
            className="w-full"
          >
            متصفحك لا يدعم تشغيل
            الصوت.
          </audio>

          {text && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {text}
            </p>
          )}
        </article>
      );
    }

    if (
      type === "example" ||
      type === "tip" ||
      type === "warning"
    ) {
      const config = {
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
      } as const;

      const item =
        config[
          type as keyof typeof config
        ];

      return (
        <article
          key={block.id}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">
              {item.icon}
            </span>

            <h3 className="font-black text-amber-400">
              {heading ?? item.title}
            </h3>
          </div>

          {text && (
            <p className="whitespace-pre-wrap leading-8 text-slate-300">
              {text}
            </p>
          )}
        </article>
      );
    }

    if (type === "embed") {
      if (html) {
        return (
          <article
            key={block.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
          >
            {heading && (
              <h3 className="mb-4 text-xl font-black text-slate-100">
                {heading}
              </h3>
            )}

            <div
              className="overflow-hidden rounded-xl"
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />

            {text && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                {text}
              </p>
            )}
          </article>
        );
      }

      if (url) {
        return (
          <article
            key={block.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
          >
            {heading && (
              <h3 className="mb-4 text-xl font-black text-slate-100">
                {heading}
              </h3>
            )}

            <div className="aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black">
              <iframe
                src={url}
                title={
                  heading ??
                  "محتوى مضمّن"
                }
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          </article>
        );
      }
    }

    if (
  type === "game" ||
  type === "activity"
) {
  const matchingGames =
    type === "game"
      ? games.filter(
          (game) =>
            Number(game.lesson_id) ===
            Number(lesson?.id),
        )
      : [];

  return (
    <article
      key={block.id}
      className="rounded-2xl border border-amber-500/20 bg-slate-900 p-5 shadow-lg"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-xl">
          {type === "game"
            ? gameIcon(
                matchingGames[0]
                  ?.template?.game_type,
              )
            : "🎯"}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-500">
            {blockLabel(type)}
          </p>

          <h3 className="mt-1 text-lg font-black text-slate-100">
            {heading ??
              (type === "game"
                ? matchingGames[0]?.name ??
                  "لعبة تعليمية"
                : "نشاط تعليمي")}
          </h3>

          {text && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
              {text}
            </p>
          )}

          {type === "game" &&
            matchingGames.length > 0 && (
              <div className="mt-4 space-y-3">
                {matchingGames.map((game) => {
                  const launchUrl =
                    gameLaunchUrl(game);

                  return (
                    <div
                      key={game.id}
                      className="flex flex-wrap items-center gap-3"
                    >
                      {launchUrl ? (
                        <a
                          href={launchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-xl bg-amber-500 px-5 py-3 font-black text-slate-950 transition-colors hover:bg-amber-400"
                        >
                          بدء اللعبة 🎮
                        </a>
                      ) : (
                        <span className="text-sm font-bold text-slate-500">
                          اللعبة غير متاحة حاليًا.
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          {type === "game" &&
            matchingGames.length === 0 && (
              <p className="mt-4 text-sm font-bold text-slate-500">
                لا توجد لعبة مرتبطة بهذا الدرس.
              </p>
            )}

          {type === "activity" &&
            url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-xl bg-amber-500 px-5 py-3 font-black text-slate-950 transition-colors hover:bg-amber-400"
              >
                فتح النشاط ↗
              </a>
            )}
        </div>
      </div>
    </article>
  );
}

    return (
      <article
        key={block.id}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-black text-amber-400">
            {index + 1}
          </span>

          <span className="text-xs font-bold text-slate-500">
            {blockLabel(type)}
          </span>
        </div>

        {type === "heading" &&
          heading && (
            <h3 className="text-2xl font-black leading-9 text-amber-400">
              {heading}
            </h3>
          )}

        {type !== "heading" &&
          heading && (
            <h3 className="mb-3 text-xl font-black text-slate-100">
              {heading}
            </h3>
          )}

        {text && (
          <p className="whitespace-pre-wrap leading-8 text-slate-300">
            {text}
          </p>
        )}

        {!text &&
          isRecord(
            block.content,
          ) && (
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
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

  /* -------------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------------- */

  if (loading) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-5xl px-4 py-10 text-slate-100"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="animate-pulse font-bold text-amber-400">
            جاري تحميل الدرس...
          </p>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------------
   * Error
   * ------------------------------------------------------------------- */

  if (error || !lesson) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-5xl px-4 py-10 text-slate-100"
      >
        <div className="rounded-2xl border border-red-900/50 bg-slate-900 p-8 text-center">
          <h1 className="text-xl font-black text-red-400">
            الدرس غير متاح
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            {error ??
              "لم يتم العثور على الدرس."}
          </p>

          <Link
            to="/student"
            className="mt-6 inline-block font-bold text-amber-400 hover:text-amber-300"
          >
            العودة للمناهج
          </Link>
        </div>
      </main>
    );
  }

  const hasGames = games.length > 0;

  const hasContent =
    content.length > 0 ||
    assets.length > 0 ||
    objectives.length > 0 ||
    vocabulary.length > 0 ||
    concepts.length > 0 ||
    sources.length > 0 ||
    questions.length > 0 ||
    hasGames ||
    Boolean(lesson.video_url) ||
    Boolean(lesson.infographic_url);

  /* -------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------- */

  return (
    <main
      dir="rtl"
      className="mx-auto max-w-5xl px-4 py-6 text-slate-100 sm:py-8"
    >
      <div className="space-y-8 pb-12">

        {/* Navigation */}

        <Link
          to={
            lesson.unit_id
              ? `/unit/${lesson.unit_id}`
              : "/student"
          }
          className="inline-flex items-center font-bold text-amber-400 hover:text-amber-300"
        >
          ← العودة للوحدة
        </Link>

        {/* Header */}

        <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-400">
            📖 الدرس

            {lesson.lesson_number > 0 && (
              <span>
                #{lesson.lesson_number}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight text-amber-400 sm:text-4xl">
            {lesson.title}
          </h1>

          {lesson.content_summary && (
            <p className="mt-4 leading-8 text-slate-300">
              {lesson.content_summary}
            </p>
          )}