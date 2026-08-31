import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  loadUnits,
  loadUnitGame,
} from '../lib/curriculum';

import type {
  GameDefinition,
  Unit,
} from '../lib/database';

function UnitsPage() {
  const {
    gradeId,
    termId,
    subjectId,
  } = useParams<{
    gradeId: string;
    termId: string;
    subjectId: string;
  }>();

  const parsedGradeId = Number(gradeId);
  const parsedTermId = Number(termId);
  const parsedSubjectId = Number(subjectId);

  const [units, setUnits] = useState<Unit[]>([]);
  const [unitGames, setUnitGames] = useState<
    Record<number, GameDefinition | null>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUnits() {
      if (
        !Number.isInteger(parsedGradeId) ||
        !Number.isInteger(parsedTermId) ||
        !Number.isInteger(parsedSubjectId)
      ) {
        setError('Invalid curriculum path.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await loadUnits(parsedSubjectId);

        if (cancelled) {
          return;
        }

        setUnits(data);

        const games = await Promise.all(
          data.map(async (unit) => ({
            unitId: unit.id,
            game: await loadUnitGame(unit.id),
          })),
        );

        if (!cancelled) {
          setUnitGames(
            Object.fromEntries(
              games.map(({ unitId, game }) => [
                unitId,
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
              : 'Failed to load units.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchUnits();

    return () => {
      cancelled = true;
    };
  }, [
    parsedGradeId,
    parsedTermId,
    parsedSubjectId,
  ]);

  const subjectsPath =
    `/grades/${parsedGradeId}/terms/${parsedTermId}/subjects`;

  if (loading) {
    return (
      <main id="units-page">
        <h1>Units</h1>
        <p>Loading units...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main id="units-page">
        <h1>Units</h1>

        <p role="alert">{error}</p>

        <Link to={subjectsPath}>
          Back to subjects
        </Link>
      </main>
    );
  }

  return (
    <main id="units-page">
      <header>
        <h1>Units</h1>

        <Link to={subjectsPath}>
          Back to subjects
        </Link>
      </header>

      {units.length === 0 ? (
        <p>No units available.</p>
      ) : (
        <ol>
          {units.map((unit) => {
            const game = unitGames[unit.id];

            const lessonsPath =
              `/grades/${parsedGradeId}/terms/${parsedTermId}` +
              `/subjects/${parsedSubjectId}/units/${unit.id}/lessons`;

            return (
              <li key={unit.id}>
                <article>
                  <header>
                    <h2>
                      Unit {unit.unit_number}
                    </h2>

                    <h3>{unit.title}</h3>

                    {unit.description && (
                      <p>{unit.description}</p>
                    )}
                  </header>

                  <nav
                    aria-label={`${unit.title} actions`}
                  >
                    <Link to={lessonsPath}>
                      View lessons
                    </Link>

                    {game && (
                      <Link
                        to={`/games/unit/${game.id}`}
                      >
                        Play unit game
                      </Link>
                    )}
                  </nav>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}

export default UnitsPage;