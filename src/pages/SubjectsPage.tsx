import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { loadSubjects } from '../lib/curriculum';
import type { Subject } from '../lib/database';

function SubjectsPage() {
  const { gradeId, termId } = useParams<{
    gradeId: string;
    termId: string;
  }>();

  const parsedGradeId = Number(gradeId);
  const parsedTermId = Number(termId);

  const [subjects, setSubjects] = useState<Subject[]>([]);
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

        if (!cancelled) {
          setSubjects(data);
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

  if (loading) {
    return <main id="subjects-page">Loading subjects...</main>;
  }

  if (error) {
    return (
      <main id="subjects-page">
        <h1>Subjects</h1>
        <p role="alert">{error}</p>

        <Link to={`/grades/${parsedGradeId}/terms`}>
          Back to terms
        </Link>
      </main>
    );
  }

  return (
    <main id="subjects-page">
      <header>
        <h1>Subjects</h1>

        <Link to={`/grades/${parsedGradeId}/terms`}>
          Back to terms
        </Link>
      </header>

      {subjects.length === 0 ? (
        <p>No subjects available.</p>
      ) : (
        <ul>
          {subjects.map((subject) => (
            <li key={subject.id}>
              <Link
                to={`/grades/${parsedGradeId}/terms/${parsedTermId}/subjects/${subject.id}/units`}
              >
                {subject.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default SubjectsPage;