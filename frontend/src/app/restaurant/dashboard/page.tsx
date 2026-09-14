'use client';

import { useMyRestaurants } from '@/features/restaurant/menu/queries';
import { useRestaurantOrders, useRestaurantAnalytics } from '@/features/restaurant/orders/queries';
import { useUpdateOrderStatusMutation } from '@/features/restaurant/orders/mutations';
import { useOrderNotifications } from '@/features/restaurant/orders/hooks/useOrderNotifications';
import { OrderStatus } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { OrderItem } from '@/types/api.types';
import { DollarSign, ShoppingBag, CheckCircle, Volume2, VolumeX } from 'lucide-react';

export default function RestaurantDashboard() {
  const { data: restaurants, isLoading: isLoadingRest } = useMyRestaurants();
  const restaurantId = restaurants?.[0]?.id || null;
  const { data: orders, isLoading: isLoadingOrders } = useRestaurantOrders(restaurantId || "");
  const { data: analytics, isLoading: isLoadingAnalytics } = useRestaurantAnalytics(restaurantId || "");
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  // Hook for audio and toast notifications
  useOrderNotifications(orders, isSoundEnabled);

  const handleUpdateStatus = (orderId: string, status: string) => {
    if (!restaurantId) return;
    updateStatusMutation.mutate({ restaurantId, orderId, status });
  };

  const activeOrders = useMemo(() => {
    const ordersList = Array.isArray(orders) ? orders : (orders as any)?.data || (orders as any)?.items;
    if (!ordersList) return [];
    return ordersList.filter((o: any) => !['DELIVERED', 'CANCELLED'].includes(o.status));
  }, [orders]);

  const pastOrders = useMemo(() => {
    const ordersList = Array.isArray(orders) ? orders : (orders as any)?.data || (orders as any)?.items;
    if (!ordersList) return [];
    return ordersList.filter((o: any) => ['DELIVERED', 'CANCELLED'].includes(o.status));
  }, [orders]);

  if (isLoadingRest) return <div className="p-8 flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Restaurant Portal</h2>
        <p className="text-muted-foreground mb-6">It looks like you don't have any restaurants yet. Let's set one up!</p>
        <Button onClick={() => window.location.href = '/restaurant/setup'}>Setup Restaurant</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Dashboard - {restaurants[0].name}
            <Badge variant={restaurants[0].status === 'ACTIVE' ? 'default' : 'secondary'}>
              {restaurants[0].status}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Updates automatically every 10 seconds</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border">
          {isSoundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          <Label htmlFor="sound-alerts" className="text-sm font-medium cursor-pointer">Order Alerts</Label>
          <Switch 
            id="sound-alerts" 
            checked={isSoundEnabled}
            onCheckedChange={setIsSoundEnabled}
          />
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
               <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">${Number(analytics?.totalRevenue || 0).toFixed(2)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
               <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{analytics?.activeOrdersCount || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
               <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{analytics?.completedOrdersCount || 0}</div>
            )}
          </CardContent>
        </Card>
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
            {activeOrders.map((order: any) => (
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
                    {order.items?.map((item: OrderItem) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-semibold">{item.quantity}x</span> {item.name}
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
            {pastOrders.slice(0, 6).map((order: any) => (
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
