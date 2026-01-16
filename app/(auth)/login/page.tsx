'use client';

import { useState } from 'react';
import { loginAction } from '../actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="card">
      <div className="card-body">
        <h1 className="h4 mb-3">Iniciar sesión</h1>
        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form
          action={async (fd) => {
            setError(null);
            const r = await loginAction(fd);
            if (r && !r.ok) setError(r.message);
          }}
          className="d-grid gap-3"
        >
          <div>
            <label className="form-label">Email</label>
            <input name="email" className="form-control" type="email" required />
          </div>
          <div>
            <label className="form-label">Contraseña</label>
            <input name="password" className="form-control" type="password" required />
          </div>

          <button className="btn btn-dark" type="submit">Entrar</button>
          <a className="btn btn-outline-secondary" href="/register">Crear cuenta</a>
        </form>
      </div>
    </div>
  );
}
