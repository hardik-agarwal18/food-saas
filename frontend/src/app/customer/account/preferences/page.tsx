'use client';

import { useCustomerProfile } from '@/features/customer/queries';
import { useUpdatePreferencesMutation } from '@/features/customer/mutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';

interface PreferencesFormValues {
  language: string;
  push: boolean;
  sms: boolean;
  email: boolean;
  marketing: boolean;
}

export default function PreferencesPage() {
  const { data: profile, isLoading } = useCustomerProfile();
  const updateMutation = useUpdatePreferencesMutation();

  const { handleSubmit, control, reset } = useForm<PreferencesFormValues>({
    defaultValues: {
      language: 'en',
      push: false,
      sms: false,
      email: true,
      marketing: false,
    }
  });

  useEffect(() => {
    if (profile?.preferences) {
      reset({
        language: profile.preferences.language || 'en',
        push: profile.preferences.notifications?.push || false,
        sms: profile.preferences.notifications?.sms || false,
        email: profile.preferences.notifications?.email ?? true,
        marketing: profile.preferences.marketing?.enabled || false,
      });
    }
  }, [profile, reset]);

  if (isLoading) return <div>Loading preferences...</div>;

  const onSubmit = (data: PreferencesFormValues) => {
    updateMutation.mutate({
      language: data.language,
      notifications: {
        push: data.push,
        sms: data.sms,
        email: data.email,
      },
      marketing: {
        enabled: data.marketing,
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Manage your notifications and account preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notifications</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="push" className="flex flex-col space-y-1">
                <span>Push Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">Receive updates on your device.</span>
              </Label>
              <Controller
                name="push"
                control={control}
                render={({ field }) => (
                  <Switch id="push" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">Receive order receipts and updates via email.</span>
              </Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Switch id="email" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms" className="flex flex-col space-y-1">
                <span>SMS Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">Receive text messages for delivery updates.</span>
              </Label>
              <Controller
                name="sms"
                control={control}
                render={({ field }) => (
                  <Switch id="sms" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Marketing</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing" className="flex flex-col space-y-1">
                <span>Promotional Emails</span>
                <span className="font-normal text-sm text-muted-foreground">Receive offers, discounts, and recommendations.</span>
              </Label>
              <Controller
                name="marketing"
                control={control}
                render={({ field }) => (
                  <Switch id="marketing" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
          {updateMutation.isSuccess && <p className="text-sm text-green-600 mt-2">Preferences updated.</p>}
          {updateMutation.isError && <p className="text-sm text-red-600 mt-2">Failed to update preferences.</p>}
        </form>
      </CardContent>
    </Card>
  );
}
