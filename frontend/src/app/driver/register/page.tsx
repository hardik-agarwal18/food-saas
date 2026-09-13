'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleType, DriverStatus } from '@/types/api.types';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const registerDriverSchema = z.object({
  vehicleType: z.enum([VehicleType.BICYCLE, VehicleType.MOTORCYCLE, VehicleType.CAR, VehicleType.VAN]),
  vehiclePlateNumber: z.string().optional(),
});

type RegisterDriverValues = z.infer<typeof registerDriverSchema>;

export default function DriverRegistrationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDriverValues>({
    resolver: zodResolver(registerDriverSchema),
    defaultValues: {
      vehicleType: VehicleType.CAR,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterDriverValues) => apiClient.post('/drivers/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverProfile'] });
      router.push('/driver/dashboard');
    },
  });

  const onSubmit = (data: RegisterDriverValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Driver Profile</CardTitle>
          <CardDescription>
            You're almost there! We just need a few more details to get you on the road.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <select {...register('vehicleType')} className="w-full border p-2 rounded-md bg-transparent">
                <option value={VehicleType.BICYCLE}>Bicycle</option>
                <option value={VehicleType.MOTORCYCLE}>Motorcycle</option>
                <option value={VehicleType.CAR}>Car</option>
                <option value={VehicleType.VAN}>Van</option>
              </select>
              {errors.vehicleType && (
                <p className="text-sm text-destructive">{errors.vehicleType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiclePlateNumber">License Plate (Optional)</Label>
              <Input
                id="vehiclePlateNumber"
                placeholder="ABC-1234"
                {...register('vehiclePlateNumber')}
              />
              {errors.vehiclePlateNumber && (
                <p className="text-sm text-destructive">{errors.vehiclePlateNumber.message}</p>
              )}
            </div>

            {mutation.isError && (
              <div className="text-sm text-destructive">
                An error occurred during registration.
              </div>
            )}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
