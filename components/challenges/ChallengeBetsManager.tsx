'use client';

import React, { useMemo, useState } from 'react';
import { BetResult, computeCurrentBankroll } from '@/lib/bankroll';
import { createBetAction, deleteBetAction, setBetResultAction } from '@/app/(dashboard)/challenges/[id]/actions';

type ChallengeDTO = {
  id: string;
  name: string;
  description: string | null;
  initial_bankroll: number;
  target_bankroll: number;
  status: 'active' | 'archived';
};

type BetDTO = {
  id: string;
  placed_at: string;
  title: string | null;
  stake: number;
  odds: number;
  result: BetResult;
  payout: number | null;
  profit: number | null;
  notes: string | null;
};

export default function ChallengeBetsManager({
  challenge,
  initialBets,
  readOnly,
}: {
  challenge: ChallengeDTO;
  initialBets: BetDTO[];
  readOnly: boolean;
}) {
  const [bets] = useState<BetDTO[]>(initialBets);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentBankroll = useMemo(() => {
    return computeCurrentBankroll(
      challenge.initial_bankroll,
      bets.map((b) => ({ stake: b.stake, odds: b.odds, result: b.result }))
    );
  }, [bets, challenge.initial_bankroll]);

  const progressPct = useMemo(() => {
    if (challenge.target_bankroll <= 0) return 0;
    const pct = (currentBankroll / challenge.target_bankroll) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [currentBankroll, challenge.target_bankroll]);

  async function onCreateBet(formData: FormData) {
    if (readOnly) return;

    setError(null);
    setSaving(true);

    const r = await createBetAction(challenge.id, formData);

    setSaving(false);

    if (!r.ok) {
      setError(r.message);
      return;
    }

    window.location.reload();
  }

  async function onSetResult(betId: string, newResult: BetResult) {
    if (readOnly) return;

    setError(null);
    const r = await setBetResultAction(betId, newResult);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    window.location.reload();
  }

  async function onDelete(betId: string) {
    if (readOnly) return;

    setError(null);
    const r = await deleteBetAction(betId);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h2 className="h3 mb-1">{challenge.name}</h2>
          {challenge.description ? <p className="text-muted mb-0">{challenge.description}</p> : null}
          <div className="mt-2 small text-muted">
            Estado:{' '}
            <span className={`badge ${challenge.status === 'active' ? 'text-bg-primary' : 'text-bg-secondary'}`}>
              {challenge.status}
            </span>
          </div>
        </div>

        <div className="card w-100" style={{ maxWidth: 420 }}>
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div className="small text-muted">Bankroll actual</div>
              <div className="fw-semibold">${currentBankroll.toFixed(2)}</div>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <div className="small text-muted">Inicial</div>
              <div>${challenge.initial_bankroll.toFixed(2)}</div>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <div className="small text-muted">Objetivo</div>
              <div>${challenge.target_bankroll.toFixed(2)}</div>
            </div>

            <div className="mt-2">
              <div className="progress" role="progressbar" aria-label="Progreso">
                <div className="progress-bar" style={{ width: `${progressPct}%` }}>
                  {progressPct}%
                </div>
              </div>
            </div>

            <div className="small text-muted mt-2">
              Regla: stake se descuenta al registrar; si gana, se suma stake * cuota.
            </div>
          </div>
        </div>
      </div>

      {readOnly ? (
        <div className="alert alert-warning">
          Este reto está <strong>archivado</strong>. Está en modo solo lectura.
        </div>
      ) : null}

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card mb-4">
        <div className="card-header fw-semibold">Registrar apuesta</div>
        <div className="card-body">
          <form action={readOnly ? undefined : onCreateBet} className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label">Título (opcional)</label>
              <input name="title" className="form-control" disabled={readOnly} />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Stake</label>
              <input
                name="stake"
                className="form-control"
                inputMode="decimal"
                placeholder="100"
                required
                disabled={readOnly}
              />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Cuota</label>
              <input
                name="odds"
                className="form-control"
                inputMode="decimal"
                placeholder="1.85"
                required
                disabled={readOnly}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Notas (opcional)</label>
              <input name="notes" className="form-control" disabled={readOnly} />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-dark" disabled={saving || readOnly} type="submit">
                {saving ? 'Guardando...' : 'Guardar apuesta'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="fw-semibold">Apuestas</div>
          <div className="small text-muted">Total: {bets.length}</div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th className="text-end">Stake</th>
                <th className="text-end">Cuota</th>
                <th>Resultado</th>
                <th className="text-end">Payout</th>
                <th className="text-end">Profit</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    Aún no hay apuestas registradas.
                  </td>
                </tr>
              ) : (
                bets.map((b) => {
                  const badge =
                    b.result === 'won'
                      ? 'text-bg-success'
                      : b.result === 'lost'
                      ? 'text-bg-danger'
                      : 'text-bg-secondary';

                  const profit = b.profit ?? 0;

                  return (
                    <tr key={b.id}>
                      <td className="small text-muted">{new Date(b.placed_at).toLocaleString()}</td>
                      <td>{b.title || <span className="text-muted">—</span>}</td>
                      <td className="text-end">${b.stake.toFixed(2)}</td>
                      <td className="text-end">{b.odds.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${badge}`}>{b.result}</span>
                      </td>
                      <td className="text-end">${(b.payout ?? 0).toFixed(2)}</td>
                      <td className={`text-end ${profit > 0 ? 'text-success' : profit < 0 ? 'text-danger' : ''}`}>
                        ${profit.toFixed(2)}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => onSetResult(b.id, 'pending')}
                            disabled={b.result === 'pending' || readOnly}
                          >
                            Pendiente
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => onSetResult(b.id, 'won')}
                            disabled={b.result === 'won' || readOnly}
                          >
                            Ganada
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => onSetResult(b.id, 'lost')}
                            disabled={b.result === 'lost' || readOnly}
                          >
                            Perdida
                          </button>
                          <button className="btn btn-outline-dark" onClick={() => onDelete(b.id)} disabled={readOnly}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
