'use client';

import { logoutAction } from '@/app/(auth)/actions';

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="btn btn-outline-warning btn-sm" type="submit">
        Salir
      </button>
    </form>
  );
}
