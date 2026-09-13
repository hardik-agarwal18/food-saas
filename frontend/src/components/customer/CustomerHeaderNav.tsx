'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/features/auth/queries';
import { useLogoutMutation } from '@/features/auth/mutations';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { UserCircle } from 'lucide-react';

export function CustomerHeaderNav() {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogoutMutation();

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <nav className="flex items-center gap-4 text-sm font-medium">
        <Link href="/login" className="hover:text-primary transition-colors">
          Log In
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4 text-sm font-medium">
      <Link href="/" className="hover:text-primary transition-colors hidden sm:block">
        Restaurants
      </Link>
      <Link href="/orders" className="hover:text-primary transition-colors hidden sm:block">
        Orders
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
          <UserCircle className="h-6 w-6" />
          <span className="sr-only">Toggle user menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/account/profile" />}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/addresses" />}>
              Addresses
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/preferences" />}>
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem className="sm:hidden" render={<Link href="/orders" />}>
              Orders
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
