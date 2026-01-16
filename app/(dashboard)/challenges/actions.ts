'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createChallengeAction(formData: FormData): Promise<void> {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const initial_bankroll = Number(formData.get('initial_bankroll'));
  const target_bankroll = Number(formData.get('target_bankroll'));

  if (!name) throw new Error('El nombre es obligatorio.');
  if (!Number.isFinite(initial_bankroll) || initial_bankroll < 0) throw new Error('Inicial inválido.');
  if (!Number.isFinite(target_bankroll) || target_bankroll <= 0) throw new Error('Objetivo inválido.');

  const { error } = await supabase.from('challenges').insert({
    user_id: user.id,
    name,
    description: description || null,
    initial_bankroll,
    target_bankroll,
    status: 'active',
  });

  if (error) throw new Error(error.message);

  // refresco simple y compatible
  redirect('/challenges');
}
