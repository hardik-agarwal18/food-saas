'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPasswordMutation } from '../mutations';
import { ApiError } from '@/types/api.types';
import Link from 'next/link';
import { useState } from 'react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const mutation = useForgotPasswordMutation();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: ForgotPasswordValues) {
    mutation.mutate(data, {
      onSuccess: () => {
        setSuccess(true);
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          setError('root', { message: error.message });
        } else {
          setError('root', { message: 'An unexpected error occurred' });
        }
      },
    });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm">
              If an account with that email exists, we have sent a password reset link.
            </div>
            <Link href="/login" className="block text-center text-sm underline">
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            
            {errors.root && (
              <div className="text-sm font-medium text-destructive">
                {errors.root.message}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="mt-4 text-center text-sm">
              Remember your password?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
