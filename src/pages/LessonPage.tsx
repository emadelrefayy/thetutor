import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  loadLessonDetails,
  loadLessons,
} from '../lib/curriculum';

import type {
  Lesson,
  LessonAsset,
  LessonContentBlock,
  LessonProgress,
  GameDefinition,
} from '../lib/database';

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com'
    ) {
      const videoId = parsed.searchParams.get('v');

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname
        .replace('/', '')
        .trim();

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (
      parsed.hostname === 'www.youtube-nocookie.com' ||
      parsed.hostname === 'youtube-nocookie.com'
    ) {
      return parsed.href;
    }

    return null;
  } catch {
    return null;
  }
}

function isImageAsset(asset: LessonAsset): boolean {
  return (
    asset.asset_type === 'image' ||
    asset.asset_type === 'infographic'
  );
}

function getAssetUrl(asset: LessonAsset): string | null {
  return asset.url ?? asset.storage_path ?? null;
}

function LessonsPage() {
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

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(
    null,
  );
  const [assets, setAssets] = useState<LessonAsset[]>([]);
  const [contentBlocks, setContentBlocks] = useState<
    LessonContentBlock[]
  >([]);
  const [progress, setProgress] =
    useState<LessonProgress | null>(null);
  const [game, setGame] =
    useState<GameDefinition | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchLessons() {
      if (
        !Number.isInteger(parsedGradeId) ||
        !Number.isInteger(parsedTermId) ||
        !Number.isInteger(parsedSubjectId) ||
        !Number.isInteger(parsedUnitId)
      ) {
        setError('Invalid curriculum path.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await loadLessons(parsedUnitId);

        if (!cancelled) {
          setLessons(data);
        }

        if (parsedLessonId === null) {
          if (!cancelled) {
            setLesson(null);
            setAssets([]);
            setContentBlocks([]);
            setProgress(null);
            setGame(null);
          }

          return;
        }

        if (!Number.isInteger(parsedLessonId)) {
          throw new Error('Invalid lesson.');
        }

        const details =
          await loadLessonDetails(parsedLessonId);

        if (cancelled) {
          return;
        }

        setLesson(details.lesson);
        setAssets(details.assets);
        setContentBlocks(details.contentBlocks);
        setProgress(details.progress);
        setGame(details.game);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load lessons.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchLessons();

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
    `/grades/${parsedGradeId}/terms/${parsedTermId}` +
    `/subjects/${parsedSubjectId}/units/${parsedUnitId}`;

  const orderedContentBlocks = useMemo(
    () =>
      [...contentBlocks].sort(
        (a, b) =>
          a.sort_order - b.sort_order ||
          a.id - b.id,
      ),
    [contentBlocks],
  );

  const orderedAssets = useMemo(
    () =>
      [...assets].sort(
        (a, b) =>
          a.sort_order - b.sort_order ||
          a.id - b.id,
      ),
    [assets],
  );

  const currentLessonIndex = lesson
    ? lessons.findIndex(
        (item) => item.id === lesson.id,
      )
    : -1;

  const previousLesson =
    currentLessonIndex > 0
      ? lessons[currentLessonIndex - 1]
      : null;

  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;

  const lessonPath = (id: number) =>
    `${unitPath}/lessons/${id}`;

  const videoUrl = lesson?.video_url
    ? getYouTubeEmbedUrl(lesson.video_url)
    : null;

  if (loading) {
    return (
      <main id="lessons-page">
        <h1>Lessons</h1>
        <p>Loading lessons...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main id="lessons-page">
        <h1>Lessons</h1>

        <p role="alert">{error}</p>

        <Link to={unitPath}>
          Back to unit
        </Link>
      </main>
    );
  }

  if (parsedLessonId === null) {
    return (
      <main id="lessons-page">
        <header>
          <h1>Lessons</h1>

          <Link to={unitPath}>
            Back to unit
          </Link>
        </header>

        {lessons.length === 0 ? (
          <p>No lessons available.</p>
        ) : (
          <ol>
            {lessons.map((item) => (
              <li key={item.id}>
                <Link to={lessonPath(item.id)}>
                  <strong>
                    Lesson {item.lesson_number}
                  </strong>

                  <span> — {item.title}</span>
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
      <main id="lessons-page">
        <h1>Lesson not found</h1>

        <Link to={unitPath}>
          Back to unit
        </Link>
      </main>
    );
  }

  return (
    <main id="lessons-page">
      <header>
        <p>
          <Link to={unitPath}>
            Back to unit
          </Link>
        </p>

        <p>
          Lesson {lesson.lesson_number}
        </p>

        <h1>{lesson.title}</h1>

        {lesson.content_summary && (
          <p>{lesson.content_summary}</p>
        )}
      </header>

      <section aria-labelledby="lesson-progress-title">
        <h2 id="lesson-progress-title">
          Your progress
        </h2>

        {progress ? (
          <>
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
          </>
        ) : (
          <p>Progress has not started yet.</p>
        )}
      </section>

      {videoUrl && (
        <section aria-labelledby="lesson-video-title">
          <h2 id="lesson-video-title">
            Lesson video
          </h2>

          <div>
            <iframe
              src={videoUrl}
              title={`Video for ${lesson.title}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

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

      {!videoUrl && lesson.video_url && (
        <section aria-labelledby="lesson-video-link-title">
          <h2 id="lesson-video-link-title">
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
        <section aria-labelledby="lesson-infographic-title">
          <h2 id="lesson-infographic-title">
            Lesson infographic
          </h2>

          <img
            src={lesson.infographic_url}
            alt={`Infographic for ${lesson.title}`}
            loading="lazy"
          />
        </section>
      )}

      {orderedContentBlocks.length > 0 && (
        <section aria-labelledby="lesson-content-title">
          <h2 id="lesson-content-title">
            Lesson content
          </h2>

          <div>
            {orderedContentBlocks.map((block) => (
              <article key={block.id}>
                {block.title && (
                  <h3>{block.title}</h3>
                )}

                {block.content && (
                  <div>
                    {block.content}
                  </div>
                )}

                {block.media_url && (
                  <img
                    src={block.media_url}
                    alt={
                      block.title ??
                      `Lesson ${block.block_type}`
                    }
                    loading="lazy"
                  />
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {orderedAssets.length > 0 && (
        <section aria-labelledby="lesson-assets-title">
          <h2 id="lesson-assets-title">
            Lesson resources
          </h2>

          <ul>
            {orderedAssets.map((asset) => {
              const url = getAssetUrl(asset);

              if (!url) {
                return (
                  <li key={asset.id}>
                    {asset.title ??
                      asset.asset_type}
                  </li>
                );
              }

              if (isImageAsset(asset)) {
                return (
                  <li key={asset.id}>
                    <figure>
                      <img
                        src={url}
                        alt={
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
            })}
          </ul>
        </section>
      )}

      {game && (
        <section aria-labelledby="lesson-game-title">
          <h2 id="lesson-game-title">
            Lesson game
          </h2>

          <p>
            Test what you learned in this lesson.
          </p>

          <Link to={`/games/lesson/${game.id}`}>
            Play lesson game
          </Link>
        </section>
      )}

      {!game && lesson.game_url && (
        <section aria-labelledby="legacy-game-title">
          <h2 id="legacy-game-title">
            Lesson game
          </h2>

          <a
            href={lesson.game_url}
            target="_blank"
            rel="noreferrer"
          >
            Play lesson game
          </a>
        </section>
      )}

      <nav aria-label="Lesson navigation">
        {previousLesson && (
          <Link
            to={lessonPath(previousLesson.id)}
          >
            Previous lesson
          </Link>
        )}

        {nextLesson && (
          <Link
            to={lessonPath(nextLesson.id)}
          >
            Next lesson
          </Link>
        )}
      </nav>
    </main>
  );
}

export default LessonsPage;