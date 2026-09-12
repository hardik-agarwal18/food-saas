import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/api.types';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-slate-900 text-white py-4 px-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-sm font-medium hover:text-red-400">
              Restaurants
            </Link>
          </nav>
        </header>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
