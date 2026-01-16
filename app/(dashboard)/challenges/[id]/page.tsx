import { supabaseServer } from '@/lib/supabase/server';
import ChallengeBetsManager from '../../../../components/challenges/ChallengeBetsManager';
import ChallengeActions from './challenge-actions';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: challenge, error: cErr } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (cErr || !challenge) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-0">No se pudo cargar el reto.</div>
      </div>
    );
  }

  const { data: bets, error: bErr } = await supabase
    .from('bets')
    .select('*')
    .eq('challenge_id', id)
    .order('placed_at', { ascending: false });

  if (bErr) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-0">No se pudieron cargar las apuestas.</div>
      </div>
    );
  }

  const challengeDTO = {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    initial_bankroll: Number(challenge.initial_bankroll),
    target_bankroll: Number(challenge.target_bankroll),
    status: challenge.status as 'active' | 'archived',
  };

  const betsDTO = (bets ?? []).map((x: any) => ({
    id: x.id,
    placed_at: x.placed_at,
    title: x.title,
    stake: Number(x.stake),
    odds: Number(x.odds),
    result: x.result,
    payout: x.payout === null ? null : Number(x.payout),
    profit: x.profit === null ? null : Number(x.profit),
    notes: x.notes,
  }));

  return (
    <div>
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h1 className="h4 mb-0">{challengeDTO.name}</h1>
            <div className="small text-muted">{challengeDTO.status}</div>
          </div>

          <ChallengeActions challengeId={challengeDTO.id} status={challengeDTO.status} />
        </div>
      </div>

      <ChallengeBetsManager
        challenge={challengeDTO}
        initialBets={betsDTO}
        readOnly={challengeDTO.status === 'archived'}
      />
    </div>
  );
}
