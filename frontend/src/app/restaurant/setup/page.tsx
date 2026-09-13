'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RestaurantSetupPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center mt-10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome, Restaurant Owner!</CardTitle>
          <CardDescription>
            You need to set up your first restaurant before you can access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our restaurant onboarding flow will be available here soon.
          </p>
          <Button 
            className="w-full"
            onClick={() => router.push('/restaurants')}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
