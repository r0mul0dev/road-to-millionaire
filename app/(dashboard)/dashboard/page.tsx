import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h4 mb-1">Dashboard</h1>
            <div className="text-muted small">{user.email}</div>
          </div>

          <Link className="btn btn-dark" href="/challenges">
            Gestionar retos
          </Link>
        </div>

        <hr />

        <div className="fw-semibold mb-2">Últimos retos</div>
        {(challenges?.length ?? 0) === 0 ? (
          <div className="text-muted">No tienes retos todavía.</div>
        ) : (
          <ul className="list-group">
            {challenges!.map((c: any) => (
              <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{c.name}</span>
                <Link className="btn btn-sm btn-outline-dark" href={`/challenges/${c.id}`}>
                  Abrir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
