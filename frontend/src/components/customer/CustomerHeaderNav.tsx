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
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <UserCircle className="h-6 w-6" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/addresses">Addresses</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/preferences">Preferences</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="sm:hidden">
            <Link href="/orders">Orders</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
