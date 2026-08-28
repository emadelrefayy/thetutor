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
          <p className="text-slate-300 leading-8 whitespace-pre-wrap