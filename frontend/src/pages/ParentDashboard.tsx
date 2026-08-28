import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { apiClient } from '../api/apiClient';
import { supabase } from '../lib/supabase';


interface ParentDashboardStudent {
  parent_profile_id: string;
  student_profile_id: string;
  grade_id: number | null;
  xp: number;
  level: number;
  is_active: boolean;
  completed_lessons: number;
  games_played: number;
  questions_answered: number;
  correct_answers: number;
  accuracy_percent: number;
}


interface DashboardStudent
  extends ParentDashboardStudent {
  grade_title: string;
}


const formatNumber = (
  value: number | null | undefined,
): string => {
  const numericValue = Number(
    value ?? 0,
  );

  if (!Number.isFinite(numericValue)) {
    return '0';
  }

  return new Intl.NumberFormat(
    'ar-EG',
  ).format(numericValue);
};


const formatPercent = (
  value: number | null | undefined,
): string => {
  const numericValue = Number(
    value ?? 0,
  );

  if (
    !Number.isFinite(numericValue)
  ) {
    return '0%';
  }

  return `${Math.round(numericValue)}%`;
};


const normalizeStudent = (
  value: unknown,
): ParentDashboardStudent | null => {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return null;
  }

  const item =
    value as Record<
      string,
      unknown
    >;

  const studentProfileId =
    typeof item.student_profile_id ===
    'string'
      ? item.student_profile_id
      : null;

  const parentProfileId =
    typeof item.parent_profile_id ===
    'string'
      ? item.parent_profile_id
      : null;

  if (
    !studentProfileId ||
    !parentProfileId
  ) {
    return null;
  }

  const gradeId =
    typeof item.grade_id ===
      'number' &&
    Number.isInteger(
      item.grade_id,
    )
      ? item.grade_id
      : null;

  const xp =
    typeof item.xp === 'number' &&
    Number.isFinite(item.xp)
      ? item.xp
      : Number(item.xp ?? 0);

  const level =
    typeof item.level === 'number' &&
    Number.isFinite(item.level)
      ? item.level
      : Number(item.level ?? 1);

  const completedLessons =
    typeof item.completed_lessons ===
      'number' &&
    Number.isFinite(
      item.completed_lessons,
    )
      ? item.completed_lessons
      : Number(
          item.completed_lessons ?? 0,
        );

  const gamesPlayed =
    typeof item.games_played ===
      'number' &&
    Number.isFinite(
      item.games_played,
    )
      ? item.games_played
      : Number(
          item.games_played ?? 0,
        );

  const questionsAnswered =
    typeof item.questions_answered ===
      'number' &&
    Number.isFinite(
      item.questions_answered,
    )
      ? item.questions_answered
      : Number(
          item.questions_answered ?? 0,
        );

  const correctAnswers =
    typeof item.correct_answers ===
      'number' &&
    Number.isFinite(
      item.correct_answers,
    )
      ? item.correct_answers
      : Number(
          item.correct_answers ?? 0,
        );

  const accuracyPercent =
    typeof item.accuracy_percent ===
      'number' &&
    Number.isFinite(
      item.accuracy_percent,
    )
      ? item.accuracy_percent
      : Number(
          item.accuracy_percent ?? 0,
        );

  return {
    parent_profile_id:
      parentProfileId,

    student_profile_id:
      studentProfileId,

    grade_id:
      gradeId,

    xp:
      Number.isFinite(xp)
        ? xp
        : 0,

    level:
      Number.isFinite(level) &&
      level >= 1
        ? level
        : 1,

    is_active:
      item.is_active === true,

    completed_lessons:
      Number.isFinite(
        completedLessons,
      )
        ? completedLessons
        : 0,

    games_played:
      Number.isFinite(
        gamesPlayed,
      )
        ? gamesPlayed
        : 0,

    questions_answered:
      Number.isFinite(
        questionsAnswered,
      )
        ? questionsAnswered
        : 0,

    correct_answers:
      Number.isFinite(
        correctAnswers,
      )
        ? correctAnswers
        : 0,

    accuracy_percent:
      Number.isFinite(
        accuracyPercent,
      )
        ? accuracyPercent
        : 0,
  };
};


const getAccuracyLabel = (
  accuracy: number,
): string => {
  if (accuracy >= 90) {
    return 'ممتاز';
  }

  if (accuracy >= 80) {
    return 'جيد جدًا';
  }

  if (accuracy >= 70) {
    return 'جيد';
  }

  if (accuracy > 0) {
    return 'يحتاج إلى مزيد من التدريب';
  }

  return 'لا توجد بيانات بعد';
};


const ParentDashboard: React.FC = () => {
  const [students, setStudents] =
    useState<DashboardStudent[]>(
      [],
    );

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState<string | null>(
    null,
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [parentName, setParentName] =
    useState<string | null>(
      null,
    );


  const selectedStudent =
    useMemo(
      () =>
        students.find(
          (student) =>
            student.student_profile_id ===
            selectedStudentId,
        ) ?? null,
      [
        students,
        selectedStudentId,
      ],
    );


  useEffect(() => {
    let active = true;


    const loadDashboard =
      async () => {
        setLoading(true);
        setError(null);


        try {
          const {
            data: {
              session,
            },
          } =
            await supabase.auth.getSession();


          if (
            !session?.access_token
          ) {
            throw new Error(
              'يجب تسجيل الدخول أولًا.',
            );
          }


          const accessToken =
            session.access_token;


          const {
            data: {
              user,
            },
          } =
            await supabase.auth.getUser();


          if (!user?.id) {
            throw new Error(
              'تعذر تحديد حساب ولي الأمر.',
            );
          }


          const metadata =
            user.user_metadata ?? {};


          const metadataName =
            typeof metadata.name ===
            'string'
              ? metadata.name
              : typeof metadata.full_name ===
                  'string'
                ? metadata.full_name
                : null;


          if (active) {
            setParentName(
              metadataName,
            );
          }


          const rawStudents =
            await apiClient.getParentStudents(
              user.id,
              accessToken,
            );


          if (!active) {
            return;
          }


          if (
            !Array.isArray(
              rawStudents,
            )
          ) {
            setStudents([]);
            setSelectedStudentId(
              null,
            );
            return;
          }


          const normalized =
            rawStudents
              .map(
                (student) =>
                  normalizeStudent(
                    student,
                  ),
              )
              .filter(
                (
                  student,
                ): student is ParentDashboardStudent =>
                  student !== null,
              );


          if (!normalized.length) {
            setStudents([]);
            setSelectedStudentId(
              null,
            );
            return;
          }


          const gradeIds =
            Array.from(
              new Set(
                normalized
                  .map(
                    (student) =>
                      student.grade_id,
                  )
                  .filter(
                    (
                      gradeId,
                    ): gradeId is number =>
                      typeof gradeId ===
                        'number' &&
                      Number.isInteger(
                        gradeId,
                      ),
                  ),
              ),
            );


          const gradeResults =
            await Promise.all(
              gradeIds.map(
                async (
                  gradeId,
                ) => {
                  try {
                    const grade =
                      await apiClient.getGrade(
                        gradeId,
                        accessToken,
                      );

                    return [
                      gradeId,
                      grade.title,
                    ] as const;
                  } catch {
                    return [
                      gradeId,
                      null,
                    ] as const;
                  }
                },
              ),
            );


          if (!active) {
            return;
          }


          const gradeTitles =
            new Map<
              number,
              string | null
            >(
              gradeResults,
            );


          const dashboardStudents =
            normalized.map(
              (student) => {
                const gradeTitle =
                  student.grade_id !==
                  null
                    ? gradeTitles.get(
                        student.grade_id,
                      ) ??
                      `الصف ${student.grade_id}`
                    : 'الصف غير محدد';


                return {
                  ...student,
                  grade_title:
                    gradeTitle,
                };
              },
            );


          setStudents(
            dashboardStudents,
          );


          setSelectedStudentId(
            (current) => {
              if (
                current &&
                dashboardStudents.some(
                  (student) =>
                    student.student_profile_id ===
                    current,
                )
              ) {
                return current;
              }


              return (
                dashboardStudents[0]
                  ?.student_profile_id ??
                null
              );
            },
          );
        } catch (err) {
          console.error(
            'Failed to load parent dashboard:',
            err,
          );


          if (!active) {
            return;
          }


          setStudents([]);
          setSelectedStudentId(
            null,
          );


          if (
            err instanceof Error
          ) {
            setError(
              err.message,
            );
          } else if (
            err &&
            typeof err ===
              'object' &&
            'message' in err &&
            typeof (
              err as {
                message?: unknown;
              }
            ).message ===
              'string'
          ) {
            setError(
              (
                err as {
                  message: string;
                }
              ).message,
            );
          } else {
            setError(
              'تعذر تحميل لوحة ولي الأمر.',
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };


    loadDashboard();


    return () => {
      active = false;
    };
  }, []);


  if (loading) {
    return (
      <main
        className="max-w-6xl mx-auto px-4 py-10 text-slate-100"
        dir="rtl"
      >
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-amber-400 font-bold animate-pulse">
            جاري تحميل لوحة ولي الأمر...
          </p>
        </div>
      </main>
    );
  }


  if (error) {
    return (
      <main
        className="max-w-6xl mx-auto px-4 py-10 text-slate-100"
        dir="rtl"
      >
        <div
          className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center"
          role="alert"
        >
          <div className="text-4xl mb-4">
            ⚠️
          </div>

          <h1 className="text-xl font-black text-red-400">
            تعذر تحميل لوحة ولي الأمر
          </h1>

          <p className="text-sm text-slate-400 mt-3 leading-7">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }


  return (
    <main
      className="max-w-6xl mx-auto px-4 py-8 text-slate-100"
      dir="rtl"
    >
      <header className="mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
          👨‍👩‍👧‍👦 لوحة ولي الأمر
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-amber-400 mt-3">
          {parentName
            ? `مرحبًا، ${parentName}`
            : 'لوحة ولي الأمر'}
        </h1>

        <p className="text-slate-400 mt-2 leading-7">
          تابع تقدم أبنائك الدراسي
          ونشاطهم في الدروس والألعاب
          والأنشطة التعليمية.
        </p>
      </header>


      {students.length === 0 ? (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-5">
            👨‍👩‍👧
          </div>

          <h2 className="text-xl font-black text-slate-100">
            لا يوجد أبناء مرتبطون بحسابك
          </h2>

          <p className="text-sm text-slate-400 mt-3 leading-7">
            لا توجد حاليًا علاقة مسجلة
            بين حساب ولي الأمر وأي طالب.
          </p>
        </section>
      ) : (
        <>
          {students.length > 1 && (
            <section className="mb-6">
              <h2 className="text-lg font-black mb-3">
                أبنائي
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {students.map(
                  (student) => {
                    const isSelected =
                      student.student_profile_id ===
                      selectedStudentId;


                    return (
                      <button
                        key={
                          student.student_profile_id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedStudentId(
                            student.student_profile_id,
                          )
                        }
                        className={[
                          'text-right p-4 rounded-2xl border transition-all',
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/60'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              'w-11 h-11 rounded-xl flex items-center justify-center font-black shrink-0',
                              isSelected
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-amber-400',
                            ].join(' ')}
                          >
                            ط
                          </div>

                          <div className="min-w-0">
                            <p className="font-black truncate">
                              الطالب
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {student.grade_title}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </section>
          )}


          {selectedStudent && (
            <>
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl font-black">
                      ط
                    </div>

                    <div>
                      <h2 className="text-2xl font-black">
                        تقدم الطالب
                      </h2>

                      <p className="text-sm text-slate-400 mt-1">
                        {selectedStudent.grade_title}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        المستوى{' '}
                        {formatNumber(
                          selectedStudent.level,
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    className={[
                      'inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl text-xs font-black',
                      selectedStudent.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700',
                    ].join(' ')}
                  >
                    <span>●</span>

                    {selectedStudent.is_active
                      ? 'الحساب نشط'
                      : 'الحساب غير نشط'}
                  </div>
                </div>
              </section>


              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs text-slate-500">
                    نقاط XP
                  </p>

                  <p className="text-2xl font-black text-amber-400 mt-2">
                    {formatNumber(
                      selectedStudent.xp,
                    )}
                  </p>
                </div>


                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs text-slate-500">
                    الدروس المكتملة
                  </p>

                  <p className="text-2xl font-black text-emerald-400 mt-2">
                    {formatNumber(
                      selectedStudent.completed_lessons,
                    )}
                  </p>
                </div>


                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs text-slate-500">
                    الألعاب التي تم لعبها
                  </p>

                  <p className="text-2xl font-black text-sky-400 mt-2">
                    {formatNumber(
                      selectedStudent.games_played,
                    )}
                  </p>
                </div>


                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs text-slate-500">
                    دقة الإجابات
                  </p>

                  <p className="text-2xl font-black text-violet-400 mt-2">
                    {formatPercent(
                      selectedStudent.accuracy_percent,
                    )}
                  </p>
                </div>
              </section>


              <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <h2 className="text-lg font-black">
                      أداء الأسئلة
                    </h2>

                    <span className="text-xs text-slate-500">
                      إجمالي الإجابات:{' '}
                      {formatNumber(
                        selectedStudent.questions_answered,
                      )}
                    </span>
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-500">
                        إجابات صحيحة
                      </p>

                      <p className="text-xl font-black text-emerald-400 mt-2">
                        {formatNumber(
                          selectedStudent.correct_answers,
                        )}
                      </p>
                    </div>


                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-500">
                        إجابات غير صحيحة
                      </p>

                      <p className="text-xl font-black text-red-400 mt-2">
                        {formatNumber(
                          Math.max(
                            0,
                            selectedStudent.questions_answered -
                              selectedStudent.correct_answers,
                          ),
                        )}
                      </p>
                    </div>
                  </div>


                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400">
                        مستوى الدقة
                      </span>

                      <span className="font-black text-amber-400">
                        {formatPercent(
                          selectedStudent.accuracy_percent,
                        )}
                      </span>
                    </div>


                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              Number(
                                selectedStudent.accuracy_percent ??
                                  0,
                              ),
                            ),
                          )}%`,
                        }}
                      />
                    </div>


                    <p className="text-xs text-slate-500 mt-3">
                      {getAccuracyLabel(
                        Number(
                          selectedStudent.accuracy_percent ??
                            0,
                        ),
                      )}
                    </p>
                  </div>
                </div>


                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-lg font-black mb-5">
                    ملخص النشاط
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-sm text-slate-400">
                        المستوى الحالي
                      </span>

                      <span className="font-black text-amber-400">
                        {formatNumber(
                          selectedStudent.level,
                        )}
                      </span>
                    </div>


                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-sm text-slate-400">
                        الدروس المكتملة
                      </span>

                      <span className="font-black text-emerald-400">
                        {formatNumber(
                          selectedStudent.completed_lessons,
                        )}
                      </span>
                    </div>


                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-sm text-slate-400">
                        الألعاب
                      </span>

                      <span className="font-black text-sky-400">
                        {formatNumber(
                          selectedStudent.games_played,
                        )}
                      </span>
                    </div>


                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-sm text-slate-400">
                        الأسئلة المجابة
                      </span>

                      <span className="font-black text-violet-400">
                        {formatNumber(
                          selectedStudent.questions_answered,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
};


export {
  ParentDashboard,
};

export default ParentDashboard;