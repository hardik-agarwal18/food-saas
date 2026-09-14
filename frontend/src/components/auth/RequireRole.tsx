'use client';

import { useCurrentUser } from '@/features/auth/queries';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Role } from '@/types/api.types';

export function RequireRole({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isError && user) {
      const hasRole = user.roles.some((role) => allowedRoles.includes(role as Role));
      if (!hasRole) {
        router.replace('/unauthorized');
      }
    }
  }, [isLoading, isError, user, allowedRoles, router]);

  if (isLoading || isError || !user) {
    // Relying on RequireAuth to handle the unauthenticated state
    // We just show nothing or a loader here while checking
    return null; 
  }

  const hasRole = user.roles.some((role) => allowedRoles.includes(role as Role));
  if (!hasRole) {
    return null;
  }

  return <>{children}</>;
}
