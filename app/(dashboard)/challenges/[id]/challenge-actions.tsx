'use client';

import { useState } from 'react';
import { archiveChallengeAction, reopenChallengeAction } from './actions';

export default function ChallengeActions({
  challengeId,
  status,
}: {
  challengeId: string;
  status: 'active' | 'archived';
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setError(null);
    setLoading(true);
    const r = await archiveChallengeAction(challengeId);
    setLoading(false);

    if (!r.ok) {
      setError(r.message);
      return;
    }
    window.location.reload();
  }

  async function reopen() {
    setError(null);
    setLoading(true);
    const r = await reopenChallengeAction(challengeId);
    setLoading(false);

    if (!r.ok) {
      setError(r.message);
      return;
    }
    window.location.reload();
  }

  return (
    <div>
      {error ? <div className="alert alert-danger py-2 mb-2">{error}</div> : null}

      {status === 'active' ? (
        <button className="btn btn-outline-danger btn-sm" onClick={archive} disabled={loading}>
          {loading ? 'Archivando...' : 'Archivar reto'}
        </button>
      ) : (
        <button className="btn btn-outline-success btn-sm" onClick={reopen} disabled={loading}>
          {loading ? 'Reabriendo...' : 'Reabrir reto'}
        </button>
      )}
    </div>
  );
}
