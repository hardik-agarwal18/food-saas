'use client';

import { useEffect, useState, useRef } from 'react';
import { useVerifyEmailMutation } from '@/features/auth/mutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const mutation = useVerifyEmailMutation(params.token);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Use a ref to prevent double-firing in React strict mode
  const firedRef = useRef(false);

  useEffect(() => {
    if (!firedRef.current) {
      firedRef.current = true;
      mutation.mutate(undefined, {
        onSuccess: () => {
          setStatus('success');
        },
        onError: (error: any) => {
          setStatus('error');
          setErrorMessage(error?.message || 'Failed to verify email');
        }
      });
    }
  }, [mutation]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Email verified successfully'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm">
                Your email has been verified. You can now use all features of your account.
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Continue to Login</Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-destructive">
                {errorMessage}
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
