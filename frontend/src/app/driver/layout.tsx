'use client';

import { RequireRole } from '@/components/auth/RequireRole';
import { Role } from '@/types/api.types';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { useDriverProfile } from '@/features/driver/deliveries/queries';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: profile, isLoading, isError } = useDriverProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && isError && pathname !== '/driver/register') {
      router.replace('/driver/register');
    }
  }, [isLoading, isError, pathname, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading driver profile...</div>;
  }

  // Allow rendering the register page even if profile is missing
  if (isError && pathname !== '/driver/register') {
    return null;
  }

  return (
    <RequireRole allowedRoles={[Role.DRIVER, Role.ADMIN]}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Driver App</h1>
          </div>
          <nav>
            <Link href="/driver/dashboard" className="text-sm font-medium hover:underline">
              Deliveries
            </Link>
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
          {children}
        </main>
      </div>
    </RequireRole>
  );
}
