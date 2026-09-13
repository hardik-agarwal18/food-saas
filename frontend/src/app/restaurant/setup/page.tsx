'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useCreateRestaurantMutation } from '@/features/restaurant/menu/mutations';
import { useCurrentUser } from '@/features/auth/queries';
import { ApiError } from '@/types/api.types';
import { LiveMap } from '@/components/maps/LiveMap';
import { useState, useEffect } from 'react';

const setupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().max(2000).optional(),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.object({
    streetAddress: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type SetupValues = z.infer<typeof setupSchema>;

export default function RestaurantSetupPage() {
  const router = useRouter();
  const createMutation = useCreateRestaurantMutation();
  const { data: user } = useCurrentUser();

  const { register, handleSubmit, formState: { errors }, setError, setValue } = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: '',
      description: '',
      phoneNumber: '',
      email: '',
      address: {
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      }
    }
  });

  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email);
    }
  }, [user, setValue]);

  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('root', { message: 'Geolocation is not supported by your browser' });
      return;
    }
    
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapLocation({ lat, lng });
        setValue('latitude', lat);
        setValue('longitude', lng);
        setIsFetchingLocation(false);
      },
      (error) => {
        setError('root', { message: 'Failed to get current location: ' + error.message });
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMapLocation({ lat, lng });
      setValue('latitude', lat);
      setValue('longitude', lng);
    }
  };

  const onSubmit = (data: SetupValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push('/restaurant/dashboard');
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.details) {
            error.details.forEach(detail => {
              setError(detail.path as any, { message: detail.message });
            });
          } else {
            setError('root', { message: error.message });
          }
        } else {
          setError('root', { message: 'Failed to create restaurant. Please try again.' });
        }
      }
    });
  };

  return (
    <div className="flex justify-center mt-10 p-4">
      <Card className="w-full max-w-2xl border-2 border-primary/20">
        <CardHeader className="bg-primary/5 pb-6 text-center">
          <CardTitle className="text-2xl mt-2 text-primary">Set Up Your Restaurant</CardTitle>
          <CardDescription>
            Provide your restaurant's details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Basic Info</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input id="name" placeholder="Tasty Bites" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input id="email" type="email" placeholder="contact@tastybites.com" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" placeholder="+1 234-567-8900" {...register('phoneNumber')} />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Tell customers about your restaurant..." 
                  {...register('description')} 
                  rows={3} 
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-lg border-b pb-2">Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input id="streetAddress" placeholder="123 Main St" {...register('address.streetAddress')} />
                {errors.address?.streetAddress && <p className="text-sm text-destructive">{errors.address.streetAddress.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="New York" {...register('address.city')} />
                  {errors.address?.city && <p className="text-sm text-destructive">{errors.address.city.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="NY" {...register('address.state')} />
                  {errors.address?.state && <p className="text-sm text-destructive">{errors.address.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" placeholder="10001" {...register('address.zipCode')} />
                  {errors.address?.zipCode && <p className="text-sm text-destructive">{errors.address.zipCode.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="USA" {...register('address.country')} />
                  {errors.address?.country && <p className="text-sm text-destructive">{errors.address.country.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-lg border-b pb-2">Location Pin</h3>
              <div className="flex justify-between items-end">
                <p className="text-sm text-muted-foreground max-w-[70%]">
                  Click on the map or use your device's GPS to set your exact restaurant location for delivery drivers.
                </p>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                >
                  {isFetchingLocation ? 'Locating...' : 'Use My Location'}
                </Button>
              </div>
              <div className="h-64 w-full rounded-md border overflow-hidden">
                <LiveMap 
                  center={mapLocation || { lat: 12.9716, lng: 77.5946 }} 
                  markers={mapLocation ? [{ lat: mapLocation.lat, lng: mapLocation.lng, type: 'RESTAURANT', id: 'setup-pin' }] : []}
                  onClick={handleMapClick}
                />
              </div>
              {mapLocation && (
                <p className="text-xs text-muted-foreground">
                  Selected coordinates: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                </p>
              )}
            </div>

            {errors.root && (
              <div className="text-sm font-medium text-destructive">
                {errors.root.message}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/')}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Restaurant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
