// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container py-5" style={{ maxWidth: 520 }}>
      {children}
    </main>
  );
}
