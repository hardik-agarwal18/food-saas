'use client';

import { useMyRestaurants } from '@/features/restaurants/queries';
import { useRestaurantOrders } from '@/features/ordering/queries';
import { useUpdateOrderStatusMutation } from '@/features/ordering/mutations';
import { OrderStatus } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';

export default function RestaurantDashboard() {
  const { data: restaurants, isLoading: isLoadingRest } = useMyRestaurants();
  const restaurantId = restaurants?.[0]?.id || null;
  const { data: orders, isLoading: isLoadingOrders } = useRestaurantOrders(restaurantId);
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const handleUpdateStatus = (orderId: string, status: string) => {
    if (!restaurantId) return;
    updateStatusMutation.mutate({ restaurantId, orderId, status });
  };

  const activeOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
  }, [orders]);

  const pastOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));
  }, [orders]);

  if (isLoadingRest) return <div className="p-8">Loading...</div>;
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Restaurant Portal</h2>
        <p className="text-muted-foreground">It looks like you don't have any restaurants yet. Contact admin to set up.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard - {restaurants[0].name}</h1>
        <Badge variant={restaurants[0].status === 'ACTIVE' ? 'default' : 'secondary'}>
          {restaurants[0].status}
        </Badge>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Active Orders ({activeOrders.length})</h2>
        {isLoadingOrders ? (
          <div className="animate-pulse h-32 bg-slate-200 rounded-xl" />
        ) : activeOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-white border rounded-xl shadow-sm">
            No active orders at the moment.
          </div>
        ) : (
          <div className="grid gap-6">
            {activeOrders.map(order => (
              <Card key={order.id} className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50 border-b">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                    <div className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()} • {order.orderType}</div>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 uppercase">{order.status}</Badge>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-semibold">{item.quantity}x</span> {item.menuItem?.name}
                          {item.specialInstructions && <p className="text-xs text-muted-foreground ml-5 italic">"{item.specialInstructions}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="md:w-64 space-y-3 flex flex-col justify-end border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                    {order.status === 'PENDING' && (
                      <>
                        <Button className="w-full" onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}>Accept Order</Button>
                        <Button variant="outline" className="w-full" onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}>Reject</Button>
                      </>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <Button className="w-full" onClick={() => handleUpdateStatus(order.id, 'PREPARING')}>Start Preparing</Button>
                    )}
                    {order.status === 'PREPARING' && (
                      <Button className="w-full" onClick={() => handleUpdateStatus(order.id, 'READY')}>Mark Ready</Button>
                    )}
                    {(order.status === 'READY' && order.orderType === 'PICKUP') && (
                      <Button className="w-full" onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}>Complete Pickup</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold border-b pb-2">Recent Past Orders</h2>
        {pastOrders.length === 0 ? (
          <div className="text-muted-foreground text-sm">No recent past orders.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastOrders.slice(0, 6).map(order => (
              <Card key={order.id} className="bg-slate-50/50">
                <CardHeader className="py-3">
                  <div className="flex justify-between">
                    <span className="font-medium">#{order.id.slice(-8)}</span>
                    <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'} className="text-[10px]">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-3 pt-0 text-sm">
                  <div className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="font-medium">${Number(order.totalAmount).toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
