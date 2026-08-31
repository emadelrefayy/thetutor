import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { loadUnits } from '../lib/curriculum';
import type { Unit } from '../lib/database';

function UnitsPage() {
  const { gradeId, termId, subjectId } = useParams<{
    gradeId: string;
    termId: string;
    subjectId: string;
  }>();

  const parsedGradeId = Number(gradeId);
  const parsedTermId = Number(termId);
  const parsedSubjectId = Number(subjectId);

  const [units, setUnits] = useState<Unit[]>([]);
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

        if (!cancelled) {
          setUnits(data);
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
  }, [parsedGradeId, parsedTermId, parsedSubjectId]);

  const subjectsPath =
    `/grades/${parsedGradeId}/terms/${parsedTermId}/subjects`;

  if (loading) {
    return <main id="units-page">Loading units...</main>;
  }

  if (error) {
    return (
      <main id="units-page">
        <h1>Units</h1>
        <p role="alert">{error}</p>

        <Link to={subjectsPath}>Back to subjects</Link>
      </main>
    );
  }

  return (
    <main id="units-page">
      <header>
        <h1>Units</h1>

        <Link to={subjectsPath}>Back to subjects</Link>
      </header>

      {units.length === 0 ? (
        <p>No units available.</p>
      ) : (
        <ol>
          {units.map((unit) => (
            <li key={unit.id}>
              <Link
                to={`/grades/${parsedGradeId}/terms/${parsedTermId}/subjects/${parsedSubjectId}/units/${unit.id}/lessons`}
              >
                <strong>
                  Unit {unit.unit_number}
                </strong>

                <span> — {unit.title}</span>

                {unit.description && (
                  <p>{unit.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

export default UnitsPage;