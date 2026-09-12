'use client';

import { useAvailableDeliveries, useMyActiveDeliveries } from '@/features/delivery/queries';
import { useClaimDeliveryMutation, useUpdateDeliveryStatusMutation, useToggleAvailabilityMutation } from '@/features/delivery/mutations';
import { useCurrentUser } from '@/features/auth/queries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { LiveMap } from '@/components/maps/LiveMap';
import { useDriverLocation } from '@/hooks/useDriverLocation';

export default function DriverDashboard() {
  const { data: user } = useCurrentUser();
  const { data: available, isLoading: isLoadingAvailable } = useAvailableDeliveries();
  const { data: active, isLoading: isLoadingActive } = useMyActiveDeliveries();
  
  const claimMutation = useClaimDeliveryMutation();
  const updateStatusMutation = useUpdateDeliveryStatusMutation();
  const toggleAvailabilityMutation = useToggleAvailabilityMutation();

  // In a real app, this would be tied to driver's actual status from DB
  const [isAvailable, setIsAvailable] = useState(true);

  const { currentLocation } = useDriverLocation(isAvailable);

  const handleToggle = (checked: boolean) => {
    setIsAvailable(checked);
    toggleAvailabilityMutation.mutate(checked);
  };

  const handleClaim = (assignmentId: string) => {
    claimMutation.mutate(assignmentId);
  };

  const handleUpdateStatus = (assignmentId: string, status: string) => {
    updateStatusMutation.mutate({ assignmentId, status });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h2 className="text-lg font-semibold">Welcome, {user?.email}</h2>
          <p className="text-sm text-muted-foreground">
            {isAvailable ? 'You are receiving new requests.' : 'You are currently offline.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{isAvailable ? 'Online' : 'Offline'}</span>
          <Switch checked={isAvailable} onCheckedChange={handleToggle} />
        </div>
      </div>

      {active && active.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active Delivery
          </h3>
          {active.map(delivery => (
            <Card key={delivery.id} className="border-2 border-primary/20 shadow-md">
              <CardHeader className="pb-3 bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Delivery #{delivery.id.slice(-6)}</CardTitle>
                  <Badge variant="default" className="uppercase">{delivery.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="h-48 md:h-64 w-full mb-4">
                  <LiveMap 
                    center={currentLocation || undefined}
                    markers={[
                      ...(currentLocation ? [{ lat: currentLocation.lat, lng: currentLocation.lng, type: 'DRIVER' as const, id: 'driver' }] : []),
                      ...(delivery.order?.restaurant?.latitude && delivery.order?.restaurant?.longitude ? [{ lat: delivery.order.restaurant.latitude, lng: delivery.order.restaurant.longitude, type: 'RESTAURANT' as const, id: 'restaurant' }] : []),
                      ...(delivery.order?.deliveryAddress?.latitude && delivery.order?.deliveryAddress?.longitude ? [{ lat: delivery.order.deliveryAddress.latitude, lng: delivery.order.deliveryAddress.longitude, type: 'CUSTOMER' as const, id: 'customer' }] : [])
                    ]}
                  />
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium min-w-[80px] text-muted-foreground">Pickup:</span>
                    <span>{delivery.order?.restaurant?.name || 'Restaurant'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium min-w-[80px] text-muted-foreground">Dropoff:</span>
                    <span>
                      {delivery.order?.deliveryAddress?.street}, {delivery.order?.deliveryAddress?.city}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t p-4 flex flex-col gap-2">
                {delivery.status === 'PENDING' && (
                  <Button className="w-full" onClick={() => handleUpdateStatus(delivery.id, 'ACCEPTED')}>Accept Delivery</Button>
                )}
                {delivery.status === 'ACCEPTED' && (
                  <Button className="w-full" onClick={() => handleUpdateStatus(delivery.id, 'PICKED_UP')}>Mark Picked Up</Button>
                )}
                {delivery.status === 'PICKED_UP' && (
                  <Button className="w-full" onClick={() => handleUpdateStatus(delivery.id, 'DRIVER_ARRIVING')}>Start Transit</Button>
                )}
                {delivery.status === 'DRIVER_ARRIVING' && (
                  <Button className="w-full" onClick={() => handleUpdateStatus(delivery.id, 'DELIVERED')}>Mark Delivered</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {isAvailable && (!active || active.length === 0) && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Available Requests</h3>
          
          {isLoadingAvailable ? (
            <div className="space-y-4">
              <div className="h-32 bg-slate-200 animate-pulse rounded-xl" />
            </div>
          ) : available?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-white border rounded-xl">
              No delivery requests nearby right now.
            </div>
          ) : (
            <div className="grid gap-4">
              {available?.map(delivery => (
                <Card key={delivery.id}>
                  <CardHeader className="py-3 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm text-muted-foreground">Request #{delivery.id.slice(-6)}</span>
                      <span className="font-semibold text-primary">Est. $5.00</span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <div>
                        <div className="font-medium">{delivery.order?.restaurant?.name || 'Restaurant'}</div>
                        <div className="text-muted-foreground text-xs">{delivery.order?.restaurant?.streetAddress}</div>
                      </div>
                    </div>
                    <div className="w-0.5 h-4 bg-slate-200 ml-1" />
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <div>
                        <div className="font-medium">Customer Dropoff</div>
                        <div className="text-muted-foreground text-xs">{delivery.order?.deliveryAddress?.street}</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" onClick={() => handleClaim(delivery.id)} disabled={claimMutation.isPending}>
                      Claim Delivery
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
