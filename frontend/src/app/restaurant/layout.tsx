import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/api.types';
import Link from 'next/link';

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.RESTAURANT_OWNER, Role.ADMIN]}>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight">Restaurant Portal</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link 
              href="/restaurant/dashboard" 
              className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              Orders
            </Link>
            <Link 
              href="/restaurant/menu-management" 
              className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              Menu
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-slate-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
