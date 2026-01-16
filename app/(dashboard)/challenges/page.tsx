import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export default async function ChallengesPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">Retos</h1>
          <p className="text-muted mb-0">Crea y gestiona tus retos de apuestas.</p>
        </div>
      </div>

      {/* Crear reto */}
      <CreateChallengeForm userId={user.id} />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Mis Retos</span>
          <span className="small text-muted">Total: {challenges?.length ?? 0}</span>
        </div>

        {error ? (
          <div className="card-body">
            <div className="alert alert-danger mb-0">{error.message}</div>
          </div>
        ) : (challenges?.length ?? 0) === 0 ? (
          <div className="card-body">
            <div className="text-muted">Aún no tienes retos. Crea el primero arriba.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th className="text-end">Inicial</th>
                  <th className="text-end">Objetivo</th>
                  <th>Estado</th>
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
                    <td>
                      <span className={`badge ${c.status === 'active' ? 'text-bg-primary' : 'text-bg-secondary'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link className="btn btn-sm btn-dark" href={`/challenges/${c.id}`}>
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Lo dejamos inline por simplicidad de fase.
 * En la siguiente fase lo movemos a /components si quieres.
 */
async function createChallengeAction(formData: FormData) {
  'use server';

  const { supabaseServer } = await import('@/lib/supabase/server');
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const initial_bankroll = Number(formData.get('initial_bankroll'));
  const target_bankroll = Number(formData.get('target_bankroll'));

  if (!name) return { ok: false, message: 'El nombre es obligatorio.' };
  if (!Number.isFinite(initial_bankroll) || initial_bankroll < 0) return { ok: false, message: 'Inicial inválido.' };
  if (!Number.isFinite(target_bankroll) || target_bankroll <= 0) return { ok: false, message: 'Objetivo inválido.' };

  const { error } = await supabase.from('challenges').insert({
    user_id: user.id,
    name,
    description: description || null,
    initial_bankroll,
    target_bankroll,
    status: 'active',
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

function CreateChallengeForm({ userId }: { userId: string }) {
  // userId se pasa por si luego quieres mostrar algo, pero el action usa el user real.
  void userId;

  return (
    <div className="card mb-3">
      <div className="card-header fw-semibold">Crear nuevo reto</div>
      <div className="card-body">
        <form action={createChallengeAction} className="row g-3">
          <div className="col-12 col-md-5">
            <label className="form-label">Nombre</label>
            <input name="name" className="form-control" placeholder='Ej: "Reto Escalera $1,000 a $30,000"' required />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Capital inicial</label>
            <input name="initial_bankroll" className="form-control" inputMode="decimal" placeholder="1000" required />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Objetivo</label>
            <input name="target_bankroll" className="form-control" inputMode="decimal" placeholder="30000" required />
          </div>

          <div className="col-12">
            <label className="form-label">Descripción (opcional)</label>
            <input name="description" className="form-control" placeholder="Detalles o reglas del reto..." />
          </div>

          <div className="col-12 d-flex justify-content-end">
            <button type="submit" className="btn btn-dark">
              Crear reto
            </button>
          </div>
        </form>

        <div className="small text-muted mt-2">
          Nota: El reto queda en estado <strong>active</strong>. Lo archivaremos en Fase 6 (historial).
        </div>
      </div>
    </div>
  );
}
