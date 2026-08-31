import { supabase } from './supabase';

export type Grade = {
  id: number;
  title: string;
  code: string;
  level_code: number | null;
  tenant_id: string;
  created_at: string | null;
};

export type Term = {
  id: number;
  title: string;
  code: string;
  grade_id: number | null;
  tenant_id: string;
  created_at: string | null;
};

export type Subject = {
  id: number;
  title: string;
  code: string;
  term_id: number | null;
  tenant_id: string;
  icon_name: string | null;
  color_theme: string | null;
  created_at: string | null;
  deleted_at: string | null;
};

export type Unit = {
  id: number;
  title: string;
  unit_number: number;
  subject_id: number;
  tenant_id: string;
  description: string | null;
  created_at: string;
  deleted_at: string | null;
};

export type Lesson = {
  id: number;
  title: string;
  lesson_number: number;
  unit_number: number;
  subject_id: number | null;
  unit_id: number | null;
  tenant_id: string;
  content_summary: string | null;
  video_url: string | null;
  infographic_url: string | null;
  game_url: string | null;
  created_at: string | null;
  deleted_at: string | null;
};

export type LessonAsset = {
  id: number;
  lesson_id: number;
  asset_type: string;
  title: string | null;
  url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string | null;
};

export type LessonContentBlock = {
  id: number;
  lesson_id: number;
  block_type: string;
  title: string | null;
  content: string | null;
  media_url: string | null;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string | null;
};

export type LessonProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed';

export type LessonProgress = {
  id: number;
  student_profile_id: number;
  lesson_id: number;
  tenant_id: string;
  status: LessonProgressStatus;
  completion_percent: number;
  first_started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  time_spent_seconds: number;
  updated_at: string | null;
};

export type GameDefinition = {
  id: number;
  name: string;
  scope_type: 'lesson' | 'unit' | 'subject' | 'challenge';
  lesson_id: number | null;
  unit_id: number | null;
  subject_id: number | null;
  game_type_id: number | null;
  template_id: number | null;
  settings: Record<string, unknown> | null;
  is_active: boolean;
  tenant_id: string;
  created_at: string | null;
  updated_at: string | null;
};

async function throwIfError<T>(
  result: { data: T | null; error: { message: string } | null },
): Promise<T> {
  if (result.error) {
    throw result.error;
  }

  return result.data as T;
}

export async function getGrades(): Promise<Grade[]> {
  const result = await supabase
    .from('grades')
    .select(
      'id, title, code, level_code, tenant_id, created_at',
    )
    .order('id');

  return (await throwIfError(result)) ?? [];
}

export async function getTermsByGrade(
  gradeId: number,
): Promise<Term[]> {
  const result = await supabase
    .from('terms')
    .select(
      'id, title, code, grade_id, tenant_id, created_at',
    )
    .eq('grade_id', gradeId)
    .order('id');

  return (await throwIfError(result)) ?? [];
}

export async function getSubjectsByTerm(
  termId: number,
): Promise<Subject[]> {
  const result = await supabase
    .from('subjects')
    .select(
      'id, title, code, term_id, tenant_id, icon_name, color_theme, created_at, deleted_at',
    )
    .eq('term_id', termId)
    .is('deleted_at', null)
    .order('id');

  return (await throwIfError(result)) ?? [];
}

export async function getUnitsBySubject(
  subjectId: number,
): Promise<Unit[]> {
  const result = await supabase
    .from('units')
    .select(
      'id, title, unit_number, subject_id, tenant_id, description, created_at, deleted_at',
    )
    .eq('subject_id', subjectId)
    .is('deleted_at', null)
    .order('unit_number');

  return (await throwIfError(result)) ?? [];
}

export async function getLessonsByUnit(
  unitId: number,
): Promise<Lesson[]> {
  const result = await supabase
    .from('lessons')
    .select(
      'id, title, lesson_number, unit_number, subject_id, unit_id, tenant_id, content_summary, video_url, infographic_url, game_url, created_at, deleted_at',
    )
    .eq('unit_id', unitId)
    .is('deleted_at', null)
    .order('lesson_number');

  return (await throwIfError(result)) ?? [];
}

export async function getLessonById(
  lessonId: number,
): Promise<Lesson | null> {
  const result = await supabase
    .from('lessons')
    .select(
      'id, title, lesson_number, unit_number, subject_id, unit_id, tenant_id, content_summary, video_url, infographic_url, game_url, created_at, deleted_at',
    )
    .eq('id', lessonId)
    .is('deleted_at', null)
    .maybeSingle();

  return throwIfError(result);
}

export async function getLessonAssets(
  lessonId: number,
): Promise<LessonAsset[]> {
  const result = await supabase
    .from('lesson_assets')
    .select(
      'id, lesson_id, asset_type, title, url, storage_path, mime_type, metadata, sort_order, created_at',
    )
    .eq('lesson_id', lessonId)
    .order('sort_order')
    .order('id');

  return (await throwIfError(result)) ?? [];
}

export async function getLessonContentBlocks(
  lessonId: number,
): Promise<LessonContentBlock[]> {
  const result = await supabase
    .from('lesson_content_blocks')
    .select(
      'id, lesson_id, block_type, title, content, media_url, metadata, sort_order, created_at',
    )
    .eq('lesson_id', lessonId)
    .order('sort_order')
    .order('id');

  return (await throwIfError(result)) ?? [];
}

export async function getLessonProgress(
  lessonId: number,
): Promise<LessonProgress | null> {
  const result = await supabase
    .from('lesson_progress')
    .select(
      'id, student_profile_id, lesson_id, tenant_id, status, completion_percent, first_started_at, completed_at, last_accessed_at, time_spent_seconds, updated_at',
    )
    .eq('lesson_id', lessonId)
    .maybeSingle();

  return throwIfError(result);
}

export async function getLessonGame(
  lessonId: number,
): Promise<GameDefinition | null> {
  const result = await supabase
    .from('game_definitions')
    .select(
      'id, name, scope_type, lesson_id, unit_id, subject_id, game_type_id, template_id, settings, is_active, tenant_id, created_at, updated_at',
    )
    .eq('lesson_id', lessonId)
    .eq('scope_type', 'lesson')
    .eq('is_active', true)
    .maybeSingle();

  return throwIfError(result);
}

export async function getUnitGame(
  unitId: number,
): Promise<GameDefinition | null> {
  const result = await supabase
    .from('game_definitions')
    .select(
      'id, name, scope_type, lesson_id, unit_id, subject_id, game_type_id, template_id, settings, is_active, tenant_id, created_at, updated_at',
    )
    .eq('unit_id', unitId)
    .eq('scope_type', 'unit')
    .eq('is_active', true)
    .maybeSingle();

  return throwIfError(result);
}

export async function getSubjectGame(
  subjectId: number,
): Promise<GameDefinition | null> {
  const result = await supabase
    .from('game_definitions')
    .select(
      'id, name, scope_type, lesson_id, unit_id, subject_id, game_type_id, template_id, settings, is_active, tenant_id, created_at, updated_at',
    )
    .eq('subject_id', subjectId)
    .eq('scope_type', 'subject')
    .eq('is_active', true)
    .maybeSingle();

  return throwIfError(result);
}