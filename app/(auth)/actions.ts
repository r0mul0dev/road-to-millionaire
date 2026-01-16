'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const supabase = await supabaseServer(); // <-- CLAVE
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { ok: false, message: error.message };

  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const supabase = await supabaseServer(); // <-- CLAVE
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) return { ok: false, message: error.message };

  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await supabaseServer(); // <-- CLAVE
  await supabase.auth.signOut();
  redirect('/login');
}
