import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { loadTerms } from '../lib/curriculum';
import type { Term } from '../lib/database';

function TermsPage() {
  const { gradeId } = useParams();
  const parsedGradeId = Number(gradeId);

  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTerms() {
      if (!Number.isInteger(parsedGradeId)) {
        setError('Invalid grade.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await loadTerms(parsedGradeId);

        if (!cancelled) {
          setTerms(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load terms.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchTerms();

    return () => {
      cancelled = true;
    };
  }, [parsedGradeId]);

  if (loading) {
    return <main id="terms-page">Loading terms...</main>;
  }

  if (error) {
    return (
      <main id="terms-page">
        <h1>Terms</h1>
        <p role="alert">{error}</p>
        <Link to="/grades">Back to grades</Link>
      </main>
    );
  }

  return (
    <main id="terms-page">
      <header>
        <h1>Terms</h1>
        <Link to="/grades">Back to grades</Link>
      </header>

      {terms.length === 0 ? (
        <p>No terms available.</p>
      ) : (
        <ul>
          {terms.map((term) => (
            <li key={term.id}>
              <Link
                to={`/grades/${parsedGradeId}/terms/${term.id}/subjects`}
              >
                {term.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default TermsPage;