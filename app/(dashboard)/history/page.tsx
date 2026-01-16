import Link from 'next/link';
import LogoutButton from './logout-button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" href="/dashboard">
            Retos
          </Link>

          <div className="ms-auto d-flex gap-2">
            <Link className="btn btn-outline-light btn-sm" href="/dashboard">
              Dashboard
            </Link>
            <Link className="btn btn-outline-light btn-sm" href="/challenges">
              Retos
            </Link>
            <Link className="btn btn-outline-light btn-sm" href="/history">
              Historial
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="container py-4">{children}</main>
    </>
  );
}
