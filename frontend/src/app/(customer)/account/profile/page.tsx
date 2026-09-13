'use client';

import { useCustomerProfile } from '@/features/customer/queries';
import { useUpdateProfileMutation } from '@/features/customer/mutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface ProfileValues {
  firstName: string;
  lastName: string;
  phone: string;
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useCustomerProfile();
  const updateMutation = useUpdateProfileMutation();
  
  const { register, handleSubmit, reset } = useForm<ProfileValues>();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
    }
  }, [profile, reset]);

  if (isLoading) return <div>Loading profile...</div>;
  if (!profile) return <div>Error loading profile.</div>;

  const onSubmit = (data: ProfileValues) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            {updateMutation.isSuccess && <p className="text-sm text-green-600 mt-2">Profile updated successfully.</p>}
            {updateMutation.isError && <p className="text-sm text-red-600 mt-2">Failed to update profile.</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Update your profile picture (Coming soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-muted-foreground">{profile.firstName[0]}</span>
              )}
            </div>
            <Button variant="outline" disabled>Upload New</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
