'use client';

import { useRestaurants } from '@/features/restaurants/queries';
import { useApproveRestaurantMutation, useSuspendRestaurantMutation } from '@/features/restaurants/mutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const { data: pendingData, isLoading: isLoadingPending } = useRestaurants({ status: 'PENDING' });
  const { data: activeData, isLoading: isLoadingActive } = useRestaurants({ status: 'ACTIVE' });

  const approveMutation = useApproveRestaurantMutation();
  const suspendMutation = useSuspendRestaurantMutation();

  const handleApprove = (id: string) => approveMutation.mutate(id);
  const handleSuspend = (id: string) => suspendMutation.mutate(id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Restaurant Management</h2>
        <p className="text-muted-foreground mt-2">Approve new restaurants and manage active ones.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending Approvals 
            {pendingData?.items?.length ? <Badge variant="destructive" className="ml-2">{pendingData.items.length}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="active">Active Restaurants</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {isLoadingPending ? (
            <div className="h-32 bg-slate-200 animate-pulse rounded-xl" />
          ) : pendingData?.items?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-white border rounded-xl">
              No pending restaurant applications.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingData?.items?.map((restaurant: any) => (
                <Card key={restaurant.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{restaurant.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{restaurant.streetAddress}, {restaurant.city}</p>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">PENDING</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Phone:</span> {restaurant.phoneNumber || 'N/A'}<br/>
                        <span className="text-muted-foreground">Cuisine:</span> {restaurant.cuisineType || 'N/A'}<br/>
                        <span className="text-muted-foreground">Created:</span> {new Date(restaurant.createdAt).toLocaleDateString()}
                      </div>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleApprove(restaurant.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve Restaurant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {isLoadingActive ? (
            <div className="h-32 bg-slate-200 animate-pulse rounded-xl" />
          ) : activeData?.items?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-white border rounded-xl">
              No active restaurants.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeData?.items?.map((restaurant: any) => (
                <Card key={restaurant.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{restaurant.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{restaurant.city}</p>
                      </div>
                      <Badge variant="default">ACTIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Rating:</span> {restaurant.rating} ({restaurant.reviewCount} reviews)<br/>
                        <span className="text-muted-foreground">Cuisine:</span> {restaurant.cuisineType || 'N/A'}
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleSuspend(restaurant.id)}
                        disabled={suspendMutation.isPending}
                      >
                        Suspend
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
