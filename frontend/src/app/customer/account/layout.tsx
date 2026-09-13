import { RequireRole } from '@/components/auth/RequireRole';
import { Role } from '@/types/api.types';
import Link from 'next/link';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allowedRoles={[Role.CUSTOMER]}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Account</h2>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/account/profile"
                className="block px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/account/addresses"
                className="block px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors"
              >
                Addresses
              </Link>
              <Link
                href="/account/preferences"
                className="block px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors"
              >
                Preferences
              </Link>
            </nav>
          </aside>
          <main className="md:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
