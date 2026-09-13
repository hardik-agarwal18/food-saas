'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useResetPasswordMutation } from '../mutations';
import { ApiError } from '@/types/api.types';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const mutation = useResetPasswordMutation(token);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(data: ResetPasswordValues) {
    mutation.mutate({ password: data.password }, {
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
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          
          {errors.root && (
            <div className="text-sm font-medium text-destructive">
              {errors.root.message}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">
              Cancel and return to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
