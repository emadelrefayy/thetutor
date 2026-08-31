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

export async function getGrades(): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select(
      'id, title, code, level_code, tenant_id, created_at',
    )
    .order('id');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getTermsByGrade(
  gradeId: number,
): Promise<Term[]> {
  const { data, error } = await supabase
    .from('terms')
    .select(
      'id, title, code, grade_id, tenant_id, created_at',
    )
    .eq('grade_id', gradeId)
    .order('id');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getSubjectsByTerm(
  termId: number,
): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select(
      'id, title, code, term_id, tenant_id, icon_name, color_theme, created_at, deleted_at',
    )
    .eq('term_id', termId)
    .is('deleted_at', null)
    .order('id');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getUnitsBySubject(
  subjectId: number,
): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select(
      'id, title, unit_number, subject_id, tenant_id, description, created_at, deleted_at',
    )
    .eq('subject_id', subjectId)
    .is('deleted_at', null)
    .order('unit_number');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getLessonsByUnit(
  unitId: number,
): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select(
      'id, title, lesson_number, unit_number, subject_id, unit_id, tenant_id, content_summary, video_url, infographic_url, game_url, created_at, deleted_at',
    )
    .eq('unit_id', unitId)
    .is('deleted_at', null)
    .order('lesson_number');

  if (error) {
    throw error;
  }

  return data ?? [];
}