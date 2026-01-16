'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Si tienes confirmación por email habilitada,
    // aquí le mandarías a una pantalla "revisa tu correo".
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="card">
      <div className="card-body">
        <h1 className="h4 mb-3">Crear cuenta</h1>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form onSubmit={onSubmit} className="d-grid gap-3">
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="form-label">Contraseña</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
            <div className="form-text">Mínimo 6 caracteres.</div>
          </div>

          <button className="btn btn-dark" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>

          <a className="btn btn-outline-secondary" href="/login">
            Ya tengo cuenta
          </a>
        </form>
      </div>
    </div>
  );
}
