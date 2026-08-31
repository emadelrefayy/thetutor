import { supabase } from './supabase';

export type UserRole =
  | 'student'
  | 'parent'
  | 'teacher'
  | 'admin'
  | 'super_admin';

export type TenantRole =
  | 'tenant_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'staff'
  | 'member';

export type MembershipStatus =
  | 'invited'
  | 'active'
  | 'suspended'
  | 'revoked';

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
  id: string;
  lesson_id: number;
  asset_type:
    | 'image'
    | 'infographic'
    | 'video'
    | 'audio'
    | 'document'
    | 'game'
    | 'external'
    | string;
  title: string | null;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};

export type LessonContentBlock = {
  id: string;
  lesson_id: number;
  block_type:
    | 'text'
    | 'heading'
    | 'image'
    | 'infographic'
    | 'video'
    | 'audio'
    | 'example'
    | 'tip'
    | 'warning'
    | 'vocabulary'
    | 'activity'
    | 'quiz'
    | 'game'
    | 'embed'
    | string;
  content: Record<string, unknown>;
  asset_id: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};

export type LessonProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed';

export type LessonProgress = {
  id: string;
  student_profile_id: string;
  lesson_id: number;
  tenant_id: string | null;
  status: LessonProgressStatus;
  completion_percent: number;
  first_started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  time_spent_seconds: number;
  updated_at: string;
};

export type GameScopeType =
  | 'lesson'
  | 'unit'
  | 'subject'
  | 'course'
  | 'challenge';

export type GameDefinition = {
  id: string;
  template_id: string;
  scope_type: GameScopeType;
  lesson_id: number | null;
  unit_id: number | null;
  subject_id: number | null;
  course_id: string | null;
  challenge_id: string | null;
  title: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
};

export type Profile = {
  id: string;
  name: string;
  role: UserRole;
  grade_id: number | null;
  created_at: string | null;
  invitation_code: string | null;
  is_code_used: boolean;
};

export type TenantMembership = {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  status: MembershipStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TenantStudentProfile = {
  id: string;
  tenant_id: string;
  profile_id: string;
  student_code: string;
  display_name: string | null;
  grade_id: number | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ParentStudentLink = {
  tenant_id: string;
  parent_profile_id: string;
  student_profile_id: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
};

export type ParentStudent = ParentStudentLink & {
  student: TenantStudentProfile | null;
};

export type CurrentUserContext = {
  profile: Profile;
  memberships: TenantMembership[];
  studentProfiles: TenantStudentProfile[];
  parentStudents: ParentStudent[];
};

async function throwIfError<T>(
  result: {
    data: T | null;
    error: { message: string } | null;
  },
): Promise<T> {
  if (result.error) {
    throw result.error;
  }

  return result.data as T;
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Authentication required.');
  }

  return user.id;
}

export async function getCurrentProfile(): Promise<Profile> {
  const userId = await getCurrentUserId();

  const result = await supabase
    .from('profiles')
    .select(
      'id, name, role, grade_id, created_at, invitation_code, is_code_used',
    )
    .eq('id', userId)
    .maybeSingle();

  const profile = await throwIfError(result);

  if (!profile) {
    throw new Error('Authenticated profile was not found.');
  }

  return profile;
}

export async function getCurrentTenantMemberships(): Promise<
  TenantMembership[]
> {
  const userId = await getCurrentUserId();

  const result = await supabase
    .from('tenant_memberships')
    .select(
      'id, tenant_id, user_id, role, status, metadata, created_at, updated_at',
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at');

  return (await throwIfError(result)) ?? [];
}

export async function getCurrentStudentProfiles(): Promise<
  TenantStudentProfile[]
> {
  const userId = await getCurrentUserId();

  const result = await supabase
    .from('tenant_student_profiles')
    .select(
      'id, tenant_id, profile_id, student_code, display_name, grade_id, date_of_birth, avatar_url, xp, level, is_active, deleted_at, created_at, updated_at',
    )
    .eq('profile_id', userId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at');

  return (await throwIfError(result)) ?? [];
}

export async function getCurrentParentStudents(): Promise<
  ParentStudent[]
> {
  const userId = await getCurrentUserId();

  const linksResult = await supabase
    .from('tenant_parent_students')
    .select(
      'tenant_id, parent_profile_id, student_profile_id, relationship, is_primary, created_at',
    )
    .eq('parent_profile_id', userId)
    .order('created_at');

  const links = (await throwIfError(linksResult)) ?? [];

  if (links.length === 0) {
    return [];
  }

  /*
   * student_profile_id in tenant_parent_students refers to
   * profiles.id. The actual tenant-scoped student persona is
   * identified by tenant_id + profile_id.
   */

  const studentProfileIds = [
    ...new Set(
      links.map((link) => link.student_profile_id),
    ),
  ];

  const tenantIds = [
    ...new Set(
      links.map((link) => link.tenant_id),
    ),
  ];

  const studentsResult = await supabase
    .from('tenant_student_profiles')
    .select(
      'id, tenant_id, profile_id, student_code, display_name, grade_id, date_of_birth, avatar_url, xp, level, is_active, deleted_at, created_at, updated_at',
    )
    .in('profile_id', studentProfileIds)
    .in('tenant_id', tenantIds)
    .eq('is_active', true)
    .is('deleted_at', null);

  const students =
    (await throwIfError(studentsResult)) ?? [];

  /*
   * IMPORTANT:
   * profile_id alone is not sufficient because the same global
   * profile may have a tenant_student_profiles row in multiple
   * tenants.
   */
  const studentsByTenantAndProfile = new Map<
    string,
    TenantStudentProfile
  >();

  for (const student of students) {
    studentsByTenantAndProfile.set(
      `${student.tenant_id}:${student.profile_id}`,
      student,
    );
  }

  return links.map((link) => ({
    ...link,
    student:
      studentsByTenantAndProfile.get(
        `${link.tenant_id}:${link.student_profile_id}`,
      ) ?? null,
  }));
}

export async function getCurrentUserContext(): Promise<
  CurrentUserContext
> {
  const [
    profile,
    memberships,
    studentProfiles,
    parentStudents,
  ] = await Promise.all([
    getCurrentProfile(),
    getCurrentTenantMemberships(),
    getCurrentStudentProfiles(),
    getCurrentParentStudents(),
  ]);

  return {
    profile,
    memberships,
    studentProfiles,
    parentStudents,
  };
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
      'id, lesson_id, asset_type, title, url, storage_path, alt_text, metadata, sort_order, is_published, created_at',
    )
    .eq('lesson_id', lessonId)
    .eq('is_published', true)
    .order('sort_order')
    .order('created_at');

  return (await throwIfError(result)) ?? [];
}

export async function getLessonContentBlocks(
  lessonId: number,
): Promise<LessonContentBlock[]> {
  const result = await supabase
    .from('lesson_content_blocks')
    .select(
      'id, lesson_id, block_type, content, asset_id, sort_order, is_published, created_at',
    )
    .eq('lesson_id', lessonId)
    .eq('is_published', true)
    .order('sort_order')
    .order('created_at');

  return (await throwIfError(result)) ?? [];
}

export async function getLessonProgress(
  lessonId: number,
  studentProfileId?: string,
): Promise<LessonProgress | null> {
  /*
   * lesson_progress.student_profile_id references the global
   * profile identity (profiles.id).
   *
   * The tenant scope must be resolved separately because the
   * same profile may have a tenant_student_profiles row in
   * more than one tenant.
   */

  const resolvedStudentProfileId =
    studentProfileId ??
    (await getCurrentStudentProfiles()).at(0)?.profile_id;

  if (!resolvedStudentProfileId) {
    return null;
  }

  const currentStudentProfiles =
    await getCurrentStudentProfiles();

  const matchingProfiles =
    currentStudentProfiles.filter(
      (student) =>
        student.profile_id ===
        resolvedStudentProfileId,
    );

  if (matchingProfiles.length === 0) {
    return null;
  }

  /*
   * A lesson belongs to one tenant. Resolve its tenant first,
   * then find the matching student persona inside that tenant.
   */
  const lessonResult = await supabase
    .from('lessons')
    .select('id, tenant_id')
    .eq('id', lessonId)
    .is('deleted_at', null)
    .maybeSingle();

  const lesson =
    await throwIfError(lessonResult);

  if (!lesson) {
    return null;
  }

  const matchingStudent =
    matchingProfiles.find(
      (student) =>
        student.tenant_id === lesson.tenant_id,
    );

  if (!matchingStudent) {
    return null;
  }

  const result = await supabase
    .from('lesson_progress')
    .select(
      'id, student_profile_id, lesson_id, tenant_id, status, completion_percent, first_started_at, completed_at, last_accessed_at, time_spent_seconds, updated_at',
    )
    .eq(
      'student_profile_id',
      resolvedStudentProfileId,
    )
    .eq('tenant_id', matchingStudent.tenant_id)
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
      'id, template_id, scope_type, lesson_id, unit_id, subject_id, course_id, challenge_id, title, settings, is_active, tenant_id, created_at',
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
      'id, template_id, scope_type, lesson_id, unit_id, subject_id, course_id, challenge_id, title, settings, is_active, tenant_id, created_at',
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
      'id, template_id, scope_type, lesson_id, unit_id, subject_id, course_id, challenge_id, title, settings, is_active, tenant_id, created_at',
    )
    .eq('subject_id', subjectId)
    .eq('scope_type', 'subject')
    .eq('is_active', true)
    .maybeSingle();

  return throwIfError(result);
}