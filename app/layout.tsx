// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retos de Apuestas',
  description: 'Gestión personal de retos y bankroll',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
