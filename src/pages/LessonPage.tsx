import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  loadLessonDetails,
  loadLessons,
} from '../lib/curriculum';

import type {
  GameDefinition,
  Lesson,
  LessonAsset,
  LessonContentBlock,
  LessonProgress,
} from '../lib/database';

function getYouTubeEmbedUrl(
  url: string,
): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com'
    ) {
      const videoId = parsed.searchParams.get('v');

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (
      hostname === 'youtu.be' ||
      hostname === 'www.youtu.be'
    ) {
      const videoId = parsed.pathname
        .replace(/^\/+/, '')
        .split('/')[0]
        .trim();

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (
      hostname === 'youtube-nocookie.com' ||
      hostname === 'www.youtube-nocookie.com'
    ) {
      return parsed.href;
    }

    return null;
  } catch {
    return null;
  }
}

function getAssetUrl(
  asset: LessonAsset,
): string | null {
  if (asset.url.trim()) {
    return asset.url;
  }

  if (asset.storage_path?.trim()) {
    return asset.storage_path;
  }

  return null;
}

function getString(
  value: unknown,
): string | null {
  return typeof value === 'string'
    ? value
    : null;
}

function getContentText(
  content: Record<string, unknown>,
): string | null {
  const candidates = [
    content.text,
    content.content,
    content.body,
    content.description,
    content.value,
  ];

  for (const candidate of candidates) {
    const text = getString(candidate);

    if (text?.trim()) {
      return text;
    }
  }

  return null;
}

function getContentTitle(
  content: Record<string, unknown>,
): string | null {
  const candidates = [
    content.title,
    content.heading,
    content.label,
  ];

  for (const candidate of candidates) {
    const text = getString(candidate);

    if (text?.trim()) {
      return text;
    }
  }

  return null;
}

function getContentUrl(
  content: Record<string, unknown>,
): string | null {
  const candidates = [
    content.url,
    content.media_url,
    content.image_url,
    content.video_url,
    content.href,
  ];

  for (const candidate of candidates) {
    const url = getString(candidate);

    if (url?.trim()) {
      return url;
    }
  }

  return null;
}

function ContentBlock({
  block,
}: {
  block: LessonContentBlock;
}) {
  const title = getContentTitle(block.content);
  const text = getContentText(block.content);
  const url = getContentUrl(block.content);

  switch (block.block_type) {
    case 'heading':
      return (
        <article>
          {title || text ? (
            <h3>{title ?? text}</h3>
          ) : null}
        </article>
      );

    case 'image':
    case 'infographic':
      return (
        <article>
          {title && <h3>{title}</h3>}

          {url ? (
            <img
              src={url}
              alt={title ?? 'Lesson visual'}
              loading="lazy"
            />
          ) : text ? (
            <p>{text}</p>
          ) : null}
        </article>
      );

    case 'video': {
      const embedUrl = url
        ? getYouTubeEmbedUrl(url)
        : null;

      return (
        <article>
          {title && <h3>{title}</h3>}

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title ?? 'Lesson video'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Open video
            </a>
          ) : text ? (
            <p>{text}</p>
          ) : null}
        </article>
      );
    }

    case 'example':
    case 'tip':
    case 'warning':
    case 'vocabulary':
    case 'activity':
    case 'quiz':
    case 'game':
    case 'text':
    case 'embed':
    default:
      return (
        <article>
          {title && <h3>{title}</h3>}

          {text && <p>{text}</p>}

          {!text &&
            !title &&
            Object.keys(block.content).length > 0 && (
              <pre>
                {JSON.stringify(
                  block.content,
                  null,
                  2,
                )}
              </pre>
            )}

          {url && block.block_type === 'embed' && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Open resource
            </a>
          )}
        </article>
      );
  }
}

function ProgressSummary({
  progress,
}: {
  progress: LessonProgress | null;
}) {
  if (!progress) {
    return (
      <section aria-labelledby="progress-title">
        <h2 id="progress-title">
          Progress
        </h2>

        <p>
          This lesson has not been started yet.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="progress-title">
      <h2 id="progress-title">
        Progress
      </h2>

      <p>
        Status:{' '}
        <strong>{progress.status}</strong>
      </p>

      <progress
        value={progress.completion_percent}
        max={100}
      >
        {progress.completion_percent}%
      </progress>

      <p>
        {progress.completion_percent}% complete
      </p>

      <p>
        Time spent:{' '}
        {Math.floor(
          progress.time_spent_seconds / 60,
        )}{' '}
        minutes
      </p>
    </section>
  );
}

function LessonGame({
  game,
}: {
  game: GameDefinition | null;
}) {
  if (!game) {
    return null;
  }

  return (
    <section aria-labelledby="game-title">
      <h2 id="game-title">
        Lesson game
      </h2>

      <p>
        Practice what you learned in this
        lesson.
      </p>

      <Link
        to={`/games/lesson/${game.id}`}
      >
        Play lesson game
      </Link>
    </section>
  );
}

function LessonPage() {
  const {
    gradeId,
    termId,
    subjectId,
    unitId,
    lessonId,
  } = useParams<{
    gradeId: string;
    termId: string;
    subjectId: string;
    unitId: string;
    lessonId?: string;
  }>();

  const parsedGradeId = Number(gradeId);
  const parsedTermId = Number(termId);
  const parsedSubjectId = Number(subjectId);
  const parsedUnitId = Number(unitId);
  const parsedLessonId = lessonId
    ? Number(lessonId)
    : null;

  const [lessons, setLessons] = useState<
    Lesson[]
  >([]);

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [assets, setAssets] = useState<
    LessonAsset[]
  >([]);

  const [contentBlocks, setContentBlocks] =
    useState<LessonContentBlock[]>([]);

  const [progress, setProgress] =
    useState<LessonProgress | null>(null);

  const [game, setGame] =
    useState<GameDefinition | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      if (
        !Number.isInteger(parsedGradeId) ||
        !Number.isInteger(parsedTermId) ||
        !Number.isInteger(parsedSubjectId) ||
        !Number.isInteger(parsedUnitId)
      ) {
        setError(
          'Invalid curriculum path.',
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const lessonList =
          await loadLessons(
            parsedUnitId,
          );

        if (cancelled) {
          return;
        }

        setLessons(lessonList);

        if (parsedLessonId === null) {
          setLesson(null);
          setAssets([]);
          setContentBlocks([]);
          setProgress(null);
          setGame(null);
          return;
        }

        if (
          !Number.isInteger(
            parsedLessonId,
          )
        ) {
          throw new Error(
            'Invalid lesson.',
          );
        }

        const details =
          await loadLessonDetails(
            parsedLessonId,
          );

        if (cancelled) {
          return;
        }

        /*
         * Guard against opening a lesson that does
         * not belong to the current unit route.
         */
        if (
          details.lesson.unit_id !==
          parsedUnitId
        ) {
          throw new Error(
            'Lesson does not belong to this unit.',
          );
        }

        setLesson(details.lesson);
        setAssets(details.assets);
        setContentBlocks(
          details.contentBlocks,
        );
        setProgress(details.progress);
        setGame(details.game);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load lesson.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [
    parsedGradeId,
    parsedTermId,
    parsedSubjectId,
    parsedUnitId,
    parsedLessonId,
  ]);

  const unitPath =
    `/grades/${parsedGradeId}` +
    `/terms/${parsedTermId}` +
    `/subjects/${parsedSubjectId}` +
    `/units/${parsedUnitId}`;

  const lessonPath = (id: number) =>
    `${unitPath}/lessons/${id}`;

  const orderedContentBlocks =
    useMemo(
      () =>
        [...contentBlocks].sort(
          (a, b) =>
            a.sort_order -
            b.sort_order,
        ),
      [contentBlocks],
    );

  const orderedAssets = useMemo(
    () =>
      [...assets].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order,
      ),
    [assets],
  );

  const currentLessonIndex =
    lesson
      ? lessons.findIndex(
          (item) =>
            item.id === lesson.id,
        )
      : -1;

  const previousLesson =
    currentLessonIndex > 0
      ? lessons[currentLessonIndex - 1]
      : null;

  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex <
      lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;

  const videoEmbedUrl =
    lesson?.video_url
      ? getYouTubeEmbedUrl(
          lesson.video_url,
        )
      : null;

  if (loading) {
    return (
      <main id="lesson-page">
        <h1>Lesson</h1>
        <p>Loading lesson...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main id="lesson-page">
        <h1>Lesson</h1>

        <p role="alert">
          {error}
        </p>

        <Link to={unitPath}>
          Back to unit
        </Link>
      </main>
    );
  }

  if (parsedLessonId === null) {
    return (
      <main id="lesson-page">
        <header>
          <h1>Lessons</h1>

          <Link to={unitPath}>
            Back to unit
          </Link>
        </header>

        {lessons.length === 0 ? (
          <p>
            No lessons available.
          </p>
        ) : (
          <ol>
            {lessons.map((item) => (
              <li key={item.id}>
                <Link
                  to={lessonPath(
                    item.id,
                  )}
                >
                  <strong>
                    Lesson{' '}
                    {item.lesson_number}
                  </strong>

                  <span>
                    {' — '}
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    );
  }

  if (!lesson) {
    return (
      <main id="lesson-page">
        <h1>
          Lesson not found
        </h1>

        <Link to={unitPath}>
          Back to unit
        </Link>
      </main>
    );
  }

  return (
    <main id="lesson-page">
      <header>
        <p>
          <Link to={unitPath}>
            Back to unit
          </Link>
        </p>

        <p>
          Lesson{' '}
          {lesson.lesson_number}
        </p>

        <h1>{lesson.title}</h1>

        {lesson.content_summary && (
          <p>
            {lesson.content_summary}
          </p>
        )}
      </header>

      <ProgressSummary
        progress={progress}
      />

      {videoEmbedUrl && (
        <section aria-labelledby="video-title">
          <h2 id="video-title">
            Lesson video
          </h2>

          <iframe
            src={videoEmbedUrl}
            title={`Video for ${lesson.title}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

          {lesson.video_url && (
            <p>
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noreferrer"
              >
                Open video on YouTube
              </a>
            </p>
          )}
        </section>
      )}

      {!videoEmbedUrl &&
        lesson.video_url && (
          <section aria-labelledby="video-link-title">
            <h2 id="video-link-title">
              Lesson video
            </h2>

            <a
              href={lesson.video_url}
              target="_blank"
              rel="noreferrer"
            >
              Watch lesson video
            </a>
          </section>
        )}

      {lesson.infographic_url && (
        <section
          aria-labelledby="infographic-title"
        >
          <h2 id="infographic-title">
            Lesson infographic
          </h2>

          <img
            src={lesson.infographic_url}
            alt={`Infographic for ${lesson.title}`}
            loading="lazy"
          />
        </section>
      )}

      {orderedContentBlocks.length >
        0 && (
        <section
          aria-labelledby="content-title"
        >
          <h2 id="content-title">
            Lesson content
          </h2>

          <div>
            {orderedContentBlocks.map(
              (block) => (
                <ContentBlock
                  key={block.id}
                  block={block}
                />
              ),
            )}
          </div>
        </section>
      )}

      {orderedAssets.length > 0 && (
        <section
          aria-labelledby="resources-title"
        >
          <h2 id="resources-title">
            Lesson resources
          </h2>

          <ul>
            {orderedAssets.map(
              (asset) => {
                const url =
                  getAssetUrl(asset);

                if (!url) {
                  return (
                    <li key={asset.id}>
                      {asset.title ??
                        asset.asset_type}
                    </li>
                  );
                }

                if (
                  asset.asset_type ===
                    'image' ||
                  asset.asset_type ===
                    'infographic'
                ) {
                  return (
                    <li key={asset.id}>
                      <figure>
                        <img
                          src={url}
                          alt={
                            asset.alt_text ??
                            asset.title ??
                            asset.asset_type
                          }
                          loading="lazy"
                        />

                        {asset.title && (
                          <figcaption>
                            {asset.title}
                          </figcaption>
                        )}
                      </figure>
                    </li>
                  );
                }

                return (
                  <li key={asset.id}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {asset.title ??
                        `Open ${asset.asset_type}`}
                    </a>
                  </li>
                );
              },
            )}
          </ul>
        </section>
      )}

      <LessonGame game={game} />

      <nav aria-label="Lesson navigation">
        {previousLesson && (
          <Link
            to={lessonPath(
              previousLesson.id,
            )}
          >
            Previous lesson
          </Link>
        )}

        {nextLesson && (
          <Link
            to={lessonPath(
              nextLesson.id,
            )}
          >
            Next lesson
          </Link>
        )}
      </nav>
    </main>
  );
}

export default LessonPage;