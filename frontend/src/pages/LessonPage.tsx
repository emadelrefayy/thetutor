import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { apiClient } from '../api/apiClient';

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

interface ContentValue {
  [key: string]: unknown;
}

interface ContentBlock {
  id: string | number;
  lesson_id: number;
  block_type?: string | null;
  content?: unknown;
  asset_id?: string | null;
  sort_order?: number | null;
  is_published?: boolean | null;
  created_at?: string | null;
}

interface LessonAsset {
  id: string;
  lesson_id: number;
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
  lesson_id: number;
  term: string;
  definition?: string | null;
  pronunciation?: string | null;
  example?: string | null;
  created_at?: string | null;
}

interface LearningObjective {
  id: number;
  lesson_id: number;
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

interface LessonSource {
  id: string;
  name: string;
  source_type?: string | null;
  publisher?: string | null;
  source_url?: string | null;
  edition?: string | null;
  academic_year?: string | null;
  language?: string | null;
  rights_notes?: string | null;
  metadata?: Record<string, unknown> | null;
  locator?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

interface QuestionOption {
  id: string | number;
  question_id: string;
  option_key?: string | null;
  option_text?: string | null;
  sort_order?: number | null;
  metadata?: Record<string, unknown> | null;
}

interface Question {
  id: string;
  question_type: string;
  difficulty?: string | null;
  prompt?: string | null;
  explanation?: string | null;
  metadata?: Record<string, unknown> | null;
  source?: string | null;
  status?: string | null;
  skill_type?: string | null;
  generation_source?: string | null;
  relevance?: number | null;
  options?: QuestionOption[];
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const getStringValue = (
  value: unknown,
): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return null;
};

const getContentText = (
  content: unknown,
): string | null => {
  if (typeof content === 'string') {
    return content;
  }

  if (
    typeof content === 'number' ||
    typeof content === 'boolean'
  ) {
    return String(content);
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map((item) => getContentText(item))
      .filter(
        (item): item is string =>
          Boolean(item),
      );

    return textParts.length > 0
      ? textParts.join('\n\n')
      : null;
  }

  if (isRecord(content)) {
    const preferredKeys = [
      'text',
      'body',
      'content',
      'description',
      'statement',
      'value',
    ];

    for (const key of preferredKeys) {
      const value = getContentText(
        content[key],
      );

      if (value) {
        return value;
      }
    }

    return null;
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
    'heading',
    'title',
    'label',
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
    'url',
    'src',
    'href',
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

const getBlockLabel = (
  blockType?: string | null,
): string => {
  switch (blockType) {
    case 'heading':
      return 'عنوان';

    case 'text':
      return 'نص';

    case 'example':
      return 'مثال';

    case 'tip':
      return 'نصيحة';

    case 'warning':
      return 'تنبيه';

    case 'vocabulary':
      return 'مفردات';

    case 'activity':
      return 'نشاط';

    case 'quiz':
      return 'اختبار';

    case 'game':
      return 'لعبة';

    case 'image':
      return 'صورة';

    case 'infographic':
      return 'إنفوجراف';

    case 'video':
      return 'فيديو';

    case 'audio':
      return 'صوت';

    case 'embed':
      return 'محتوى مضمّن';

    default:
      return 'محتوى';
  }
};

const getAssetIcon = (
  assetType?: string | null,
): string => {
  switch (assetType) {
    case 'image':
      return '🖼️';

    case 'infographic':
      return '📊';

    case 'video':
      return '🎬';

    case 'audio':
      return '🔊';

    case 'document':
      return '📄';

    case 'game':
      return '🎮';

    default:
      return '📎';
  }
};

const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{
    lessonId: string;
  }>();

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [content, setContent] =
    useState<ContentBlock[]>([]);

  const [assets, setAssets] =
    useState<LessonAsset[]>([]);

  const [vocabulary, setVocabulary] =
    useState<VocabularyItem[]>([]);

  const [objectives, setObjectives] =
    useState<LearningObjective[]>([]);

  const [concepts, setConcepts] =
    useState<Concept[]>([]);

  const [sources, setSources] =
    useState<LessonSource[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<string, string>>({});

  useEffect(() => {
    if (!lessonId) {
      setError('معرف الدرس غير صالح.');
      setLoading(false);
      return;
    }

    const id = Number(lessonId);

    if (!Number.isInteger(id) || id <= 0) {
      setError('معرف الدرس غير صالح.');
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
        ] = await Promise.all([
          apiClient.getLesson(id),
          apiClient.getLessonContent(id),
          apiClient.getLessonAssets(id),
          apiClient.getLessonVocabulary(id),
          apiClient.getLessonObjectives(id),
          apiClient.getLessonConcepts(id),
          apiClient.getLessonSources(id),
          apiClient.getLessonQuestions(id),
        ]);

        if (!active) {
          return;
        }

        setLesson(
          lessonData &&
            typeof lessonData === 'object'
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

        setSources(
          Array.isArray(sourcesData)
            ? (sourcesData as LessonSource[])
            : [],
        );

        setQuestions(
          Array.isArray(questionsData)
            ? (questionsData as Question[])
            : [],
        );

        setSelectedAnswers({});
      } catch (err) {
        console.error(
          'Failed to load lesson:',
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

        setError(
          'تعذر تحميل بيانات الدرس.',
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
      map.set(String(asset.id), asset);
    });

    return map;
  }, [assets]);

  const handleAnswer = (
    questionId: string,
    answer: string,
  ) => {
    setSelectedAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  const renderContentBlock = (
    block: ContentBlock,
    index: number,
  ) => {
    const blockType =
      block.block_type ?? 'text';

    const asset = block.asset_id
      ? assetsById.get(
          String(block.asset_id),
        )
      : undefined;

    const heading =
      getContentHeading(block.content);

    const text =
      getContentText(block.content);

    const contentUrl =
      getContentUrl(block.content);

    if (
      blockType === 'image' ||
      blockType === 'infographic'
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
                'infographic'
                  ? '📊'
                  : '🖼️'}
              </span>

              <span className="text-xs font-bold text-slate-500">
                {getBlockLabel(blockType)}
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
                'محتوى الدرس'
              }
              className="w-full rounded-xl border border-slate-800 object-contain max-h-[600px]"
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

    if (blockType === 'video') {
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

            <video
              controls
              preload="metadata"
              className="w-full rounded-xl bg-black"
              src={videoUrl}
            >
              متصفحك لا يدعم تشغيل الفيديو.
            </video>

            {text && (
              <p className="text-sm text-slate-400 mt-4 leading-7 whitespace-pre-wrap">
                {text}
              </p>
            )}
          </article>
        );
      }
    }

    if (blockType === 'audio') {
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
              متصفحك لا يدعم تشغيل الصوت.
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
      blockType === 'example' ||
      blockType === 'tip' ||
      blockType === 'warning'
    ) {
      const styles = {
        example: {
          icon: '💡',
          title: 'مثال',
        },
        tip: {
          icon: '💎',
          title: 'نصيحة',
        },
        warning: {
          icon: '⚠️',
          title: 'تنبيه',
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
              {heading ?? style.title}
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
            {getBlockLabel(blockType)}
          </span>
        </div>

        {blockType === 'heading' &&
          heading && (
            <h3 className="text-2xl font-black text-amber-400 leading-9">
              {heading}
            </h3>
          )}

        {blockType !== 'heading' &&
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
          isRecord(block.content) && (
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
            {error ??
              'لم يتم العثور على الدرس.'}
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
      {/* Navigation */}

      <Link
        to={
          lesson.unit_id
            ? `/unit/${lesson.unit_id}`
            : '/student'
        }
        className="inline-flex items-center text-sm text-amber-400 hover:text-amber-300 font-bold"
      >
        → العودة للوحدة
      </Link>

      {/* Lesson Header */}

      <header className="mt-5 mb-8">
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

        <h1 className="text-3xl md:text-4xl font-black text-amber-400 mt-3">
          {lesson.title}
        </h1>

        {lesson.content_summary && (
          <p className="text-slate-300 mt-4 leading-8 text-base">
            {lesson.content_summary}
          </p>
        )}
      </header>

      {/* Learning Objectives */}

      {objectives.length > 0 && (
        <section className="mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-xl font-black text-amber-400 mb-4">
              🎯 أهداف التعلم
            </h2>

            <div className="space-y-3">
              {objectives.map(
                (objective) => (
                  <div
                    key={objective.id}
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
                          مستوى التفكير:{' '}
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

      {content.length > 0 && (
        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-black text-amber-400">
            📚 محتوى الدرس
          </h2>

          {content.map(
            (block, index) =>
              renderContentBlock(
                block,
                index,
              ),
          )}
        </section>
      )}

      {/* Lesson Media */}

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
                href={
                  lesson.infographic_url
                }
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

      {/* Educational Assets */}

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
                      {getAssetIcon(
                        asset.asset_type,
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-100">
                        {asset.title ??
                          'فتح المورد التعليمي'}
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
            })}
          </div>
        </section>
      )}

      {/* Concepts */}

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
                    {
                      concept.description
                    }
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Vocabulary */}

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
                    النطق:{' '}
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
                      {item.example}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}

      {sources.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-black text-amber-400 mb-4">
            📚 مصادر الدرس
          </h2>

          <div className="space-y-3">
            {sources.map((source) => (
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
                      {source.name}
                    </h3>

                    {source.publisher && (
                      <p className="text-sm text-slate-400 mt-1">
                        الناشر:{' '}
                        {
                          source.publisher
                        }
                      </p>
                    )}

                    {source.edition && (
                      <p className="text-xs text-slate-500 mt-1">
                        الطبعة:{' '}
                        {source.edition}
                      </p>
                    )}

                    {source.academic_year && (
                      <p className="text-xs text-slate-500 mt-1">
                        العام الدراسي:{' '}
                        {
                          source.academic_year
                        }
                      </p>
                    )}

                    {source.locator && (
                      <p className="text-xs text-slate-500 mt-2">
                        الموضع:{' '}
                        {source.locator}
                      </p>
                    )}

                    {source.notes && (
                      <p className="text-sm text-slate-400 mt-2 leading-6">
                        {
                          source.notes
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
            ))}
          </div>
        </section>
      )}

      {/* Questions */}

      {questions.length > 0 && (
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-amber-400">
              🎯 اختبر نفسك
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              عدد الأسئلة:{' '}
              {questions.length}
            </p>

            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-xs text-amber-300 leading-6">
                هذه الأسئلة للتدريب داخل الدرس.
                نتيجة الاختبار والتصحيح النهائي
                تتم من خلال نظام التقييم التفاعلي،
                وليس بكشف الإجابات الصحيحة داخل
                المتصفح.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {questions.map(
              (question, index) => {
                const selectedAnswer =
                  selectedAnswers[
                    question.id
                  ];

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
                          {
                            question.difficulty
                          }
                        </span>
                      )}
                    </div>

                    {question.prompt && (
                      <p className="text-lg font-bold text-slate-100 leading-8">
                        {question.prompt}
                      </p>
                    )}

                    {question.options &&
                      question.options
                        .length > 0 && (
                        <div className="mt-5 space-y-2">
                          {question.options.map(
                            (option) => {
                              const answerValue =
                                option.option_key ??
                                option.option_text ??
                                '';

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
                                    'w-full text-right border rounded-xl p-3 transition-all',
                                    selected
                                      ? 'border-amber-500 bg-amber-500/10'
                                      : 'border-slate-700 bg-slate-950 hover:border-amber-500/50',
                                  ].join(' ')}
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

      {content.length === 0 &&
        assets.length === 0 &&
        vocabulary.length === 0 &&
        objectives.length === 0 &&
        concepts.length === 0 &&
        sources.length === 0 &&
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

      {/* Footer Navigation */}

      <div className="mt-10 pt-6 border-t border-slate-800">
        <Link
          to={
            lesson.unit_id
              ? `/unit/${lesson.unit_id}`
              : '/student'
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