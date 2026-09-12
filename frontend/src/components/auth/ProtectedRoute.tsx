'use client';

import { useCurrentUser } from '@/features/auth/queries';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Role } from '@/types/api.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (isError || !user) {
        // Not authenticated
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && allowedRoles.length > 0) {
        // Authenticated but check roles
        const hasRole = user.roles.some((role) => allowedRoles.includes(role as Role));
        if (!hasRole) {
          // You don't have permission to access this
          router.replace('/unauthorized'); // or redirect to their specific dashboard
        }
      }
    }
  }, [isLoading, isError, user, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isError || !user) {
    return null; // Will redirect
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user.roles.some((role) => allowedRoles.includes(role as Role));
    if (!hasRole) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
}
