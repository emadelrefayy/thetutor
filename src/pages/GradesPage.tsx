import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { loadGrades } from '../lib/curriculum';
import type { Grade } from '../lib/database';

function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchGrades() {
      try {
        setLoading(true);
        setError(null);

        const data = await loadGrades();

        if (!cancelled) {
          setGrades(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load grades.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchGrades();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <main id="grades-page">Loading grades...</main>;
  }

  if (error) {
    return (
      <main id="grades-page">
        <h1>Grades</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main id="grades-page">
      <header>
        <h1>TheTutor</h1>
        <p>Select your grade</p>
      </header>

      {grades.length === 0 ? (
        <p>No grades available.</p>
      ) : (
        <ul>
          {grades.map((grade) => (
            <li key={grade.id}>
              <Link to={`/grades/${grade.id}/terms`}>
                {grade.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default GradesPage;