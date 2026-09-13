import { User, Role } from '@/types/api.types';

/**
 * Determines the default route for a user based on their primary role.
 * Role-specific onboarding state checks (e.g. does the driver have a profile)
 * should ideally be handled within the role's application boundary or guarded routes,
 * but this provides the initial redirect post-login.
 */
export function getDefaultRouteForUser(user: User | null | undefined): string {
  if (!user) {
    return '/login';
  }

  // If user has multiple roles, we pick the most privileged/specific one
  // or default to CUSTOMER if they have it.
  const { roles } = user;

  if (roles.includes(Role.ADMIN)) {
    return '/admin/dashboard';
  }

  if (roles.includes(Role.RESTAURANT_OWNER)) {
    return '/restaurant/dashboard';
  }

  if (roles.includes(Role.DRIVER)) {
    return '/driver/dashboard';
  }

  if (roles.includes(Role.CUSTOMER)) {
    return '/customer/restaurants'; // default customer landing
  }

  // Fallback
  return '/unauthorized';
}
