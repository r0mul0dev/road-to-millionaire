'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { computeBetDerivedFields, BetResult } from '@/lib/bankroll';

export async function createBetAction(challengeId: string, formData: FormData) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const title = String(formData.get('title') || '').trim();
  const notes = String(formData.get('notes') || '').trim();
  const stake = Number(formData.get('stake'));
  const odds = Number(formData.get('odds'));

  if (!Number.isFinite(stake) || stake <= 0) return { ok: false, message: 'Stake inválido.' };
  if (!Number.isFinite(odds) || odds <= 1) return { ok: false, message: 'Cuota inválida (decimal > 1).' };

  const derived = computeBetDerivedFields(stake, odds, 'pending');

  const { error } = await supabase.from('bets').insert({
    challenge_id: challengeId,
    user_id: user.id,
    title: title || null,
    stake,
    odds,
    result: 'pending',
    payout: derived.payout,
    profit: derived.profit,
    notes: notes || null,
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function setBetResultAction(betId: string, newResult: BetResult) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const { data: bet, error: bErr } = await supabase
    .from('bets')
    .select('id, stake, odds')
    .eq('id', betId)
    .single();

  if (bErr || !bet) return { ok: false, message: 'Apuesta no encontrada.' };

  const stake = Number(bet.stake);
  const odds = Number(bet.odds);
  const derived = computeBetDerivedFields(stake, odds, newResult);

  const { error } = await supabase
    .from('bets')
    .update({ result: newResult, payout: derived.payout, profit: derived.profit })
    .eq('id', betId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteBetAction(betId: string) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const { error } = await supabase.from('bets').delete().eq('id', betId);
  if (error) return { ok: false, message: error.message };

  return { ok: true };
}

export async function archiveChallengeAction(challengeId: string) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const { error } = await supabase
    .from('challenges')
    .update({ status: 'archived', ended_at: new Date().toISOString() })
    .eq('id', challengeId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function reopenChallengeAction(challengeId: string) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const { error } = await supabase
    .from('challenges')
    .update({ status: 'active', ended_at: null })
    .eq('id', challengeId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
