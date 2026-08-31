import {
  getGrades,
  getTermsByGrade,
  getSubjectsByTerm,
  getUnitsBySubject,
  getLessonsByUnit,
  getLessonById,
  getLessonAssets,
  getLessonContentBlocks,
  getLessonProgress,
  getLessonGame,
  getUnitGame,
  getSubjectGame,
  type Grade,
  type Term,
  type Subject,
  type Unit,
  type Lesson,
  type LessonAsset,
  type LessonContentBlock,
  type LessonProgress,
  type GameDefinition,
} from './database';

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

export async function loadGrades(): Promise<Grade[]> {
  return getGrades();
}

export async function loadTerms(
  gradeId: number,
): Promise<Term[]> {
  return getTermsByGrade(gradeId);
}

export async function loadSubjects(
  termId: number,
): Promise<Subject[]> {
  return getSubjectsByTerm(termId);
}

export async function loadUnits(
  subjectId: number,
): Promise<Unit[]> {
  return getUnitsBySubject(subjectId);
}

export async function loadLessons(
  unitId: number,
): Promise<Lesson[]> {
  return getLessonsByUnit(unitId);
}

export async function loadLessonDetails(
  lessonId: number,
): Promise<LessonDetails> {
  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    throw new Error(`Lesson ${lessonId} was not found.`);
  }

  const [
    assets,
    contentBlocks,
    progress,
    game,
  ] = await Promise.all([
    getLessonAssets(lessonId),
    getLessonContentBlocks(lessonId),
    getLessonProgress(lessonId),
    getLessonGame(lessonId),
  ]);

  return {
    lesson,
    assets,
    contentBlocks,
    progress,
    game,
  };
}

export async function loadUnitGame(
  unitId: number,
): Promise<GameDefinition | null> {
  return getUnitGame(unitId);
}

export async function loadSubjectGame(
  subjectId: number,
): Promise<GameDefinition | null> {
  return getSubjectGame(subjectId);
}

export async function loadCurriculumTree(
  gradeId: number,
): Promise<CurriculumTree> {
  const [gradeResult, terms] = await Promise.all([
    getGrades().then((grades) => {
      const grade = grades.find(
        (item) => item.id === gradeId,
      );

      if (!grade) {
        throw new Error(
          `Grade ${gradeId} was not found.`,
        );
      }

      return grade;
    }),
    getTermsByGrade(gradeId),
  ]);

  const subjectsByTerm = await Promise.all(
    terms.map(async (term) => ({
      term,
      subjects: await getSubjectsByTerm(term.id),
    })),
  );

  const subjectsWithUnits = await Promise.all(
    subjectsByTerm.map(async ({ term, subjects }) => ({
      term,
      subjects: await Promise.all(
        subjects.map(async (subject) => ({
          subject,
          units: await getUnitsBySubject(subject.id),
        })),
      ),
    })),
  );

  const termsWithLessons = await Promise.all(
    subjectsWithUnits.map(async ({ term, subjects }) => ({
      term,
      subjects: await Promise.all(
        subjects.map(async ({ subject, units }) => ({
          subject,
          units: await Promise.all(
            units.map(async (unit) => ({
              unit,
              lessons: await getLessonsByUnit(unit.id),
            })),
          ),
        })),
      ),
    })),
  );

  return {
    grade: gradeResult,
    terms: termsWithLessons,
  };
}