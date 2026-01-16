import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export default async function HistoryPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'archived')
    .order('ended_at', { ascending: false });

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-1">Historial</h1>
          <p className="text-muted mb-0">Retos archivados (solo lectura).</p>
        </div>
        <Link className="btn btn-dark" href="/challenges">
          Volver a retos
        </Link>
      </div>

      {error ? (
        <div className="alert alert-danger">{error.message}</div>
      ) : (challenges?.length ?? 0) === 0 ? (
        <div className="card">
          <div className="card-body text-muted">No tienes retos archivados todavía.</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Reto</th>
                  <th className="text-end">Inicial</th>
                  <th className="text-end">Objetivo</th>
                  <th>Finalizado</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {challenges!.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div className="fw-semibold">{c.name}</div>
                      {c.description ? <div className="small text-muted">{c.description}</div> : null}
                    </td>
                    <td className="text-end">${Number(c.initial_bankroll).toFixed(2)}</td>
                    <td className="text-end">${Number(c.target_bankroll).toFixed(2)}</td>
                    <td className="small text-muted">
                      {c.ended_at ? new Date(c.ended_at).toLocaleString() : '—'}
                    </td>
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-dark" href={`/challenges/${c.id}`}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
