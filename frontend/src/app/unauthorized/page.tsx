'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Unauthorized</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please ensure you are logged in with the correct account type to view this content.
          </p>
          <Link href="/login" className="flex w-full">
            <Button className="w-full">Switch Account</Button>
          </Link>
          <Link href="/" className="flex w-full">
            <Button variant="outline" className="w-full">Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
