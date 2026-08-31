import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  loadSubjects,
  loadSubjectGame,
} from '../lib/curriculum';

import type {
  GameDefinition,
  Subject,
} from '../lib/database';

function SubjectsPage() {
  const { gradeId, termId } = useParams<{
    gradeId: string;
    termId: string;
  }>();

  const parsedGradeId = Number(gradeId);
  const parsedTermId = Number(termId);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectGames, setSubjectGames] = useState<
    Record<number, GameDefinition | null>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubjects() {
      if (
        !Number.isInteger(parsedGradeId) ||
        !Number.isInteger(parsedTermId)
      ) {
        setError('Invalid grade or term.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await loadSubjects(parsedTermId);

        if (cancelled) {
          return;
        }

        setSubjects(data);

        const games = await Promise.all(
          data.map(async (subject) => ({
            subjectId: subject.id,
            game: await loadSubjectGame(subject.id),
          })),
        );

        if (!cancelled) {
          setSubjectGames(
            Object.fromEntries(
              games.map(({ subjectId, game }) => [
                subjectId,
                game,
              ]),
            ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load subjects.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchSubjects();

    return () => {
      cancelled = true;
    };
  }, [parsedGradeId, parsedTermId]);

  const termsPath =
    `/grades/${parsedGradeId}/terms`;

  if (loading) {
    return (
      <main id="subjects-page">
        <h1>Subjects</h1>
        <p>Loading subjects...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main id="subjects-page">
        <h1>Subjects</h1>

        <p role="alert">{error}</p>

        <Link to={termsPath}>
          Back to terms
        </Link>
      </main>
    );
  }

  return (
    <main id="subjects-page">
      <header>
        <h1>Subjects</h1>

        <Link to={termsPath}>
          Back to terms
        </Link>
      </header>

      {subjects.length === 0 ? (
        <p>No subjects available.</p>
      ) : (
        <ul>
          {subjects.map((subject) => {
            const game = subjectGames[subject.id];

            return (
              <li key={subject.id}>
                <article>
                  <header>
                    <h2>{subject.title}</h2>

                    {subject.code && (
                      <p>{subject.code}</p>
                    )}
                  </header>

                  <nav aria-label={`${subject.title} actions`}>
                    <Link
                      to={`/grades/${parsedGradeId}/terms/${parsedTermId}/subjects/${subject.id}/units`}
                    >
                      View units
                    </Link>

                    {game && (
                      <Link
                        to={`/games/subject/${game.id}`}
                      >
                        Play subject game
                      </Link>
                    )}
                  </nav>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default SubjectsPage;