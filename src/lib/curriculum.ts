import {
  getGradeById,
  getGrades,
  getLessonAssets,
  getLessonById,
  getLessonContentBlocks,
  getLessonGame,
  getLessonProgress,
  getLessonsByUnit,
  getSubjectById,
  getSubjectGame,
  getSubjectsByTerm,
  getTermById,
  getTermsByGrade,
  getUnitById,
  getUnitGame,
  getUnitsBySubject,
  type GameDefinition,
  type Grade,
  type Lesson,
  type LessonAsset,
  type LessonContentBlock,
  type LessonProgress,
  type Subject,
  type Term,
  type Unit,
} from './database';

/* -------------------------------------------------------------------------- */
/* Curriculum types                                                           */
/* -------------------------------------------------------------------------- */

export type CurriculumTree = {
  grade: Grade;
  terms: Array<{
    term: Term;
    subjects: Array<{
      subject: Subject;
      units: Array<{
        unit: Unit;
        lessons: Lesson[];
      }>;
    }>;
  }>;
};

export type LessonDetails = {
  lesson: Lesson;
  assets: LessonAsset[];
  contentBlocks: LessonContentBlock[];
  progress: LessonProgress | null;
  game: GameDefinition | null;
};

/**
 * Tenant context used by curriculum operations.
 *
 * The tenant is part of the identity boundary.
 * Numeric curriculum IDs are not globally sufficient.
 *
 * tenantId is optional at this layer only for compatibility with
 * single-tenant authenticated sessions. When the authenticated user
 * has access to multiple tenants, database.ts requires an explicit
 * tenantId and will reject ambiguous access.
 */
export type CurriculumContext = {
  tenantId?: string;
  studentProfileId?: string;
};

/* -------------------------------------------------------------------------- */
/* Grades                                                                     */
/* -------------------------------------------------------------------------- */

export async function loadGrades(
  tenantId?: string,
): Promise<Grade[]> {
  return getGrades(tenantId);
}

export async function loadGrade(
  gradeId: number,
  tenantId?: string,
): Promise<Grade | null> {
  return getGradeById(
    gradeId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Terms                                                                      */
/* -------------------------------------------------------------------------- */

export async function loadTerms(
  gradeId: number,
  tenantId?: string,
): Promise<Term[]> {
  return getTermsByGrade(
    gradeId,
    tenantId,
  );
}

export async function loadTerm(
  termId: number,
  tenantId?: string,
): Promise<Term | null> {
  return getTermById(
    termId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Subjects                                                                   */
/* -------------------------------------------------------------------------- */

export async function loadSubjects(
  termId: number,
  tenantId?: string,
): Promise<Subject[]> {
  return getSubjectsByTerm(
    termId,
    tenantId,
  );
}

export async function loadSubject(
  subjectId: number,
  tenantId?: string,
): Promise<Subject | null> {
  return getSubjectById(
    subjectId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Units                                                                      */
/* -------------------------------------------------------------------------- */

export async function loadUnits(
  subjectId: number,
  tenantId?: string,
): Promise<Unit[]> {
  return getUnitsBySubject(
    subjectId,
    tenantId,
  );
}

export async function loadUnit(
  unitId: number,
  tenantId?: string,
): Promise<Unit | null> {
  return getUnitById(
    unitId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Lessons                                                                    */
/* -------------------------------------------------------------------------- */

export async function loadLessons(
  unitId: number,
  tenantId?: string,
): Promise<Lesson[]> {
  return getLessonsByUnit(
    unitId,
    tenantId,
  );
}

export async function loadLesson(
  lessonId: number,
  tenantId?: string,
): Promise<Lesson | null> {
  return getLessonById(
    lessonId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Lesson details                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Loads everything required by the lesson page.
 *
 * The same tenant context is propagated to every lesson-related
 * database operation.
 *
 * Student progress additionally receives the explicit student
 * profile ID when one is available.
 */
export async function loadLessonDetails(
  lessonId: number,
  context: CurriculumContext = {},
): Promise<LessonDetails> {
  const {
    tenantId,
    studentProfileId,
  } = context;

  const lesson = await getLessonById(
    lessonId,
    tenantId,
  );

  if (!lesson) {
    throw new Error(
      `Lesson ${lessonId} was not found in the selected tenant.`,
    );
  }

  const [
    assets,
    contentBlocks,
    progress,
    game,
  ] = await Promise.all([
    getLessonAssets(
      lessonId,
      tenantId,
    ),
    getLessonContentBlocks(
      lessonId,
      tenantId,
    ),
    getLessonProgress(
      lessonId,
      studentProfileId,
      tenantId,
    ),
    getLessonGame(
      lessonId,
      tenantId,
    ),
  ]);

  return {
    lesson,
    assets,
    contentBlocks,
    progress,
    game,
  };
}

/* -------------------------------------------------------------------------- */
/* Lesson game                                                                */
/* -------------------------------------------------------------------------- */

export async function loadLessonGame(
  lessonId: number,
  tenantId?: string,
): Promise<GameDefinition | null> {
  return getLessonGame(
    lessonId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Unit game                                                                  */
/* -------------------------------------------------------------------------- */

export async function loadUnitGame(
  unitId: number,
  tenantId?: string,
): Promise<GameDefinition | null> {
  return getUnitGame(
    unitId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Subject game                                                               */
/* -------------------------------------------------------------------------- */

export async function loadSubjectGame(
  subjectId: number,
  tenantId?: string,
): Promise<GameDefinition | null> {
  return getSubjectGame(
    subjectId,
    tenantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Complete curriculum tree                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Loads a complete curriculum tree inside one tenant context.
 *
 * The hierarchy remains:
 *
 * Grade
 *   └── Term
 *       └── Subject
 *           └── Unit
 *               └── Lesson
 *
 * tenantId is propagated through every level.
 */
export async function loadCurriculumTree(
  gradeId: number,
  tenantId?: string,
): Promise<CurriculumTree> {
  const [
    grade,
    terms,
  ] = await Promise.all([
    getGradeById(
      gradeId,
      tenantId,
    ),
    getTermsByGrade(
      gradeId,
      tenantId,
    ),
  ]);

  if (!grade) {
    throw new Error(
      `Grade ${gradeId} was not found in the selected tenant.`,
    );
  }

  const subjectsByTerm =
    await Promise.all(
      terms.map(async (term) => ({
        term,
        subjects:
          await getSubjectsByTerm(
            term.id,
            tenantId,
          ),
      })),
    );

  const subjectsWithUnits =
    await Promise.all(
      subjectsByTerm.map(
        async ({
          term,
          subjects,
        }) => ({
          term,
          subjects:
            await Promise.all(
              subjects.map(
                async (subject) => ({
                  subject,
                  units:
                    await getUnitsBySubject(
                      subject.id,
                      tenantId,
                    ),
                }),
              ),
            ),
        }),
      ),
    );

  const termsWithLessons =
    await Promise.all(
      subjectsWithUnits.map(
        async ({
          term,
          subjects,
        }) => ({
          term,
          subjects:
            await Promise.all(
              subjects.map(
                async ({
                  subject,
                  units,
                }) => ({
                  subject,
                  units:
                    await Promise.all(
                      units.map(
                        async (unit) => ({
                          unit,
                          lessons:
                            await getLessonsByUnit(
                              unit.id,
                              tenantId,
                            ),
                        }),
                      ),
                    ),
                }),
              ),
            ),
        }),
      ),
    );

  return {
    grade,
    terms: termsWithLessons,
  };
}