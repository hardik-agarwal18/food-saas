import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/api.types';
import Link from 'next/link';
import { useMyRestaurants } from '@/features/restaurants/queries';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: restaurants, isLoading, isError } = useMyRestaurants();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && restaurants && restaurants.length === 0 && pathname !== '/restaurant/setup') {
      router.replace('/restaurant/setup');
    }
  }, [isLoading, restaurants, pathname, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading restaurant profile...</div>;
  }

  // Allow rendering setup page even if no restaurant exists
  if (restaurants && restaurants.length === 0 && pathname !== '/restaurant/setup') {
    return null;
  }

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
