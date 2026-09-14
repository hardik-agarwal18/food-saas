'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterMutation } from '../mutations';
import { ApiError, Role } from '@/types/api.types';
import Link from 'next/link';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([Role.CUSTOMER, Role.DRIVER, Role.RESTAURANT_OWNER]).optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const registerMutation = useRegisterMutation();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: Role.CUSTOMER,
    },
  });

  function onSubmit(data: RegisterValues) {
    registerMutation.mutate(data, {
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.details) {
            error.details.forEach((detail) => {
              setError(detail.path as any, { message: detail.message });
            });
          } else {
            setError('root', { message: error.message });
          }
        } else {
          setError('root', { message: 'An unexpected error occurred' });
        }
      },
    });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Create an account to start ordering food
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3 mb-6">
            <Label>What are you signing up as?</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" value={Role.CUSTOMER} {...register('role')} className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Customer</div>
                  <div className="text-xs text-muted-foreground">Order food and track deliveries.</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" value={Role.DRIVER} {...register('role')} className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Driver</div>
                  <div className="text-xs text-muted-foreground">Accept and deliver orders.</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" value={Role.RESTAURANT_OWNER} {...register('role')} className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Restaurant Owner</div>
                  <div className="text-xs text-muted-foreground">Manage restaurants, menus, and orders.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+1 555-0123" {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          
          {errors.root && (
            <div className="text-sm font-medium text-destructive">
              {errors.root.message}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Registering...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
