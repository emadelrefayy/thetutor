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
  subject_id: number | null;
  title: string;
  unit_number: number;
  lesson_number: number;
  content_summary: string | null;
  video_url: string | null;
  infographic_url: string | null;
  game_url: string | null;
  created_at: string | null;
  unit_id: number | null;
  tenant_id: string;
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

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

async function throwIfError<T>(
  result: QueryResult<T>,
): Promise<T> {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data as T;
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error('Authentication required.');
  }

  return user.id;
}

/**
 * Returns every tenant that the current authenticated identity
 * is legitimately connected to.
 *
 * A user can have multiple tenant contexts.
 * We never collapse those contexts into one student identity.
 */
async function getAccessibleTenantIds(): Promise<string[]> {
  const userId = await getCurrentUserId();

  const [
    membershipsResult,
    studentProfilesResult,
    parentLinksResult,
  ] = await Promise.all([
    supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', userId)
      .eq('status', 'active'),

    supabase
      .from('tenant_student_profiles')
      .select('tenant_id')
      .eq('profile_id', userId)
      .eq('is_active', true)
      .is('deleted_at', null),

    supabase
      .from('tenant_parent_students')
      .select('tenant_id')
      .eq('parent_profile_id', userId),
  ]);

  const memberships =
    (await throwIfError(membershipsResult)) ?? [];

  const studentProfiles =
    (await throwIfError(studentProfilesResult)) ?? [];

  const parentLinks =
    (await throwIfError(parentLinksResult)) ?? [];

  return [
    ...new Set([
      ...memberships.map((row) => row.tenant_id),
      ...studentProfiles.map((row) => row.tenant_id),
      ...parentLinks.map((row) => row.tenant_id),
    ]),
  ];
}

/**
 * Curriculum queries must execute inside exactly one tenant context.
 *
 * This is intentional.
 *
 * If a user belongs to multiple tenants, we do NOT merge curriculum
 * records from those tenants merely because numeric IDs or names happen
 * to match. The caller must provide the tenant explicitly.
 */
async function resolveTenantId(
  tenantId?: string,
): Promise<string> {
  if (tenantId) {
    const accessibleTenantIds =
      await getAccessibleTenantIds();

    if (!accessibleTenantIds.includes(tenantId)) {
      throw new Error(
        'You are not authorized to access this tenant.',
      );
    }

    return tenantId;
  }

  const accessibleTenantIds =
    await getAccessibleTenantIds();

  if (accessibleTenantIds.length === 0) {
    throw new Error(
      'No accessible tenant context was found.',
    );
  }

  if (accessibleTenantIds.length > 1) {
    throw new Error(
      'Multiple tenant contexts are available. A tenant_id is required.',
    );
  }

  return accessibleTenantIds[0];
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
    throw new Error(
      'Authenticated profile was not found.',
    );
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

  const studentProfileIds = [
    ...new Set(
      links.map(
        (link) => link.student_profile_id,
      ),
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

/**
 * Grades
 */
export async function getGrades(
  tenantId?: string,
): Promise<Grade[]> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const result = await supabase
    .from('grades')
    .select(
      'id, title, code, level_code, tenant_id, created_at',
    )
    .eq('tenant_id', resolvedTenantId)
    .order('level_code')
    .order('id');

  return (await throwIfError(result)) ?? [];
}

/**
 * Terms
 *
 * The parent grade is resolved inside the same tenant first.
 * This prevents a grade ID from being reused across tenants
 * to accidentally expose another tenant's terms.
 */
export async function getTermsByGrade(
  gradeId: number,
  tenantId?: string,
): Promise<Term[]> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const gradeResult = await supabase
    .from('grades')
    .select('id')
    .eq('id', gradeId)
    .eq('tenant_id', resolvedTenantId)
    .maybeSingle();

  const grade = await throwIfError(gradeResult);

  if (!grade) {
    throw new Error(
      `Grade ${gradeId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('terms')
    .select(
      'id, title, code, grade_id, tenant_id, created_at',
    )
    .eq('grade_id', grade.id)
    .eq('tenant_id', resolvedTenantId)
    .order('id');

  return (await throwIfError(result)) ?? [];
}

/**
 * Subjects
 */
export async function getSubjectsByTerm(
  termId: number,
  tenantId?: string,
): Promise<Subject[]> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const termResult = await supabase
    .from('terms')
    .select('id')
    .eq('id', termId)
    .eq('tenant_id', resolvedTenantId)
    .maybeSingle();

  const term = await throwIfError(termResult);

  if (!term) {
    throw new Error(
      `Term ${termId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('subjects')
    .select(
      'id, title, code, term_id, tenant_id, icon_name, color_theme, created_at, deleted_at',
    )
    .eq('term_id', term.id)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .order('id');

  return (await throwIfError(result)) ?? [];
}

/**
 * Units
 */
export async function getUnitsBySubject(
  subjectId: number,
  tenantId?: string,
): Promise<Unit[]> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const subjectResult = await supabase
    .from('subjects')
    .select('id')
    .eq('id', subjectId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const subject =
    await throwIfError(subjectResult);

  if (!subject) {
    throw new Error(
      `Subject ${subjectId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('units')
    .select(
      'id, title, unit_number, subject_id, tenant_id, description, created_at, deleted_at',
    )
    .eq('subject_id', subject.id)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .order('unit_number')
    .order('id');

  return (await throwIfError(result)) ?? [];
}

/**
 * Lessons
 */
export async function getLessonsByUnit(
  unitId: number,
  tenantId?: string,
): Promise<Lesson[]> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const unitResult = await supabase
    .from('units')
    .select('id')
    .eq('id', unitId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const unit = await throwIfError(unitResult);

  if (!unit) {
    throw new Error(
      `Unit ${unitId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('lessons')
    .select(
      'id, subject_id, title, unit_number, lesson_number, content_summary, video_url, infographic_url, game_url, created_at, unit_id, tenant_id, deleted_at',
    )
    .eq('unit_id', unit.id)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .order('lesson_number')
    .order('id');

  return (await throwIfError(result)) ?? [];
}

/**
 * Single lesson
 */
export async function getLessonById(
  lessonId: number,
  tenantId?: string,
): Promise<Lesson | null> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const result = await supabase
    .from('lessons')
    .select(
      'id, subject_id, title, unit_number, lesson_number, content_summary, video_url, infographic_url, game_url, created_at, unit_id, tenant_id, deleted_at',
    )
    .eq('id', lessonId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  return throwIfError(result);
}

/**
 * Lesson assets do not have their own tenant_id.
 *
 * Therefore the lesson is resolved first and its tenant_id becomes
 * the security boundary for the child records.
 */
export async function getLessonAssets(
  lessonId: number,
  tenantId?: string,
): Promise<LessonAsset[]> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const lessonResult = await supabase
    .from('lessons')
    .select('id, tenant_id')
    .eq('id', lessonId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const lesson = await throwIfError(
    lessonResult,
  );

  if (!lesson) {
    throw new Error(
      `Lesson ${lessonId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('lesson_assets')
    .select(
      'id, lesson_id, asset_type, title, url, storage_path, alt_text, metadata, sort_order, is_published, created_at',
    )
    .eq('lesson_id', lesson.id)
    .eq('is_published', true)
    .order('sort_order')
    .order('created_at');

  return (await throwIfError(result)) ?? [];
}

/**
 * Lesson content blocks use the same parent-lesson tenant boundary.
 */
export async function getLessonContentBlocks(
  lessonId: number,
  tenantId?: string,
): Promise<LessonContentBlock[]> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const lessonResult = await supabase
    .from('lessons')
    .select('id, tenant_id')
    .eq('id', lessonId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const lesson = await throwIfError(
    lessonResult,
  );

  if (!lesson) {
    throw new Error(
      `Lesson ${lessonId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('lesson_content_blocks')
    .select(
      'id, lesson_id, block_type, content, asset_id, sort_order, is_published, created_at',
    )
    .eq('lesson_id', lesson.id)
    .eq('is_published', true)
    .order('sort_order')
    .order('created_at');

  return (await throwIfError(result)) ?? [];
}

/**
 * Resolve a student persona inside one tenant.
 *
 * The global auth profile ID is not enough.
 * The actual student identity is:
 *
 * tenant_id + profile_id
 */
async function resolveStudentProfile(
  tenantId: string,
  studentProfileId?: string,
): Promise<TenantStudentProfile> {
  const profileId =
    studentProfileId ??
    (await getCurrentStudentProfiles())
      .filter(
        (student) =>
          student.tenant_id === tenantId,
      )
      .map((student) => student.profile_id)
      .at(0);

  if (!profileId) {
    throw new Error(
      'No student profile was found in the selected tenant.',
    );
  }

  const result = await supabase
    .from('tenant_student_profiles')
    .select(
      'id, tenant_id, profile_id, student_code, display_name, grade_id, date_of_birth, avatar_url, xp, level, is_active, deleted_at, created_at, updated_at',
    )
    .eq('tenant_id', tenantId)
    .eq('profile_id', profileId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  const student =
    await throwIfError(result);

  if (!student) {
    throw new Error(
      'The selected student profile is not available in the selected tenant.',
    );
  }

  return student;
}

/**
 * Lesson progress is tenant-scoped by the composite relationship:
 *
 * tenant_id + student_profile_id
 */
export async function getLessonProgress(
  lessonId: number,
  studentProfileId?: string,
  tenantId?: string,
): Promise<LessonProgress | null> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const lessonResult = await supabase
    .from('lessons')
    .select('id, tenant_id')
    .eq('id', lessonId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const lesson = await throwIfError(
    lessonResult,
  );

  if (!lesson) {
    throw new Error(
      `Lesson ${lessonId} was not found in the selected tenant.`,
    );
  }

  const student =
    await resolveStudentProfile(
      resolvedTenantId,
      studentProfileId,
    );

  const result = await supabase
    .from('lesson_progress')
    .select(
      'id, student_profile_id, lesson_id, status, completion_percent, first_started_at, completed_at, last_accessed_at, time_spent_seconds, updated_at, tenant_id',
    )
    .eq(
      'student_profile_id',
      student.profile_id,
    )
    .eq('tenant_id', resolvedTenantId)
    .eq('lesson_id', lesson.id)
    .maybeSingle();

  return throwIfError(result);
}

const GAME_DEFINITION_SELECT =
  'id, template_id, scope_type, lesson_id, unit_id, subject_id, course_id, challenge_id, title, settings, is_active, tenant_id, created_at';

/**
 * Lesson-level game
 */
export async function getLessonGame(
  lessonId: number,
  tenantId?: string,
): Promise<GameDefinition | null> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const lessonResult = await supabase
    .from('lessons')
    .select('id')
    .eq('id', lessonId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const lesson = await throwIfError(
    lessonResult,
  );

  if (!lesson) {
    throw new Error(
      `Lesson ${lessonId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('game_definitions')
    .select(GAME_DEFINITION_SELECT)
    .eq('lesson_id', lesson.id)
    .eq('scope_type', 'lesson')
    .eq('tenant_id', resolvedTenantId)
    .eq('is_active', true)
    .maybeSingle();

  return throwIfError(result);
}

/**
 * Unit-level game
 */
export async function getUnitGame(
  unitId: number,
  tenantId?: string,
): Promise<GameDefinition | null> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const unitResult = await supabase
    .from('units')
    .select('id')
    .eq('id', unitId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const unit = await throwIfError(
    unitResult,
  );

  if (!unit) {
    throw new Error(
      `Unit ${unitId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('game_definitions')
    .select(GAME_DEFINITION_SELECT)
    .eq('unit_id', unit.id)
    .eq('scope_type', 'unit')
    .eq('tenant_id', resolvedTenantId)
    .eq('is_active', true)
    .maybeSingle();

  return throwIfError(result);
}

/**
 * Subject-level game
 */
export async function getSubjectGame(
  subjectId: number,
  tenantId?: string,
): Promise<GameDefinition | null> {
  const resolvedTenantId =
    await resolveTenantId(tenantId);

  const subjectResult = await supabase
    .from('subjects')
    .select('id')
    .eq('id', subjectId)
    .eq('tenant_id', resolvedTenantId)
    .is('deleted_at', null)
    .maybeSingle();

  const subject =
    await throwIfError(subjectResult);

  if (!subject) {
    throw new Error(
      `Subject ${subjectId} was not found in the selected tenant.`,
    );
  }

  const result = await supabase
    .from('game_definitions')
    .select(GAME_DEFINITION_SELECT)
    .eq('subject_id', subject.id)
    .eq('scope_type', 'subject')
    .eq('tenant_id', resolvedTenantId)
    .eq('is_active', true)
    .maybeSingle();

  return throwIfError(result);
}