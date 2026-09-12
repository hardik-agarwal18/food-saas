'use client';

import { useOrder } from '@/features/ordering/queries';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const { data: order, isLoading, isError } = useOrder(id);

  const getStatusMessage = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Waiting for restaurant to confirm...';
      case 'ACCEPTED': return 'Restaurant is preparing your order.';
      case 'PREPARING': return 'Restaurant is preparing your order.';
      case 'READY_FOR_PICKUP': return 'Order is ready for pickup!';
      case 'OUT_FOR_DELIVERY': return 'Driver is on the way!';
      case 'DELIVERED': return 'Order delivered.';
      case 'COMPLETED': return 'Order completed.';
      case 'CANCELLED': return 'Order cancelled.';
      default: return 'Processing...';
    }
  };

  return (
    <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
      <main className="container mx-auto p-4 md:p-8 max-w-2xl">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
        ) : isError || !order ? (
          <div className="text-center p-8 text-destructive border rounded-xl">
            Failed to load order details.
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-primary/5 pb-6 text-center">
                <CardDescription>Order Status</CardDescription>
                <CardTitle className="text-2xl mt-2 text-primary">
                  {getStatusMessage(order.status)}
                </CardTitle>
                <div className="text-sm font-medium uppercase tracking-wider mt-2 text-muted-foreground">
                  {order.status}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Order ID</span>
                    <span className="font-medium">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date</span>
                    <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Type</span>
                    <span className="font-medium">{order.orderType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <span className="font-medium mr-2">{item.quantity}x</span>
                        <span>{item.menuItem?.name || 'Unknown Item'}</span>
                        {item.specialInstructions && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <span className="font-medium">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>${Number(order.taxAmount).toFixed(2)}</span>
                    </div>
                    {order.deliveryFee && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span>${Number(order.deliveryFee).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t text-foreground">
                      <span>Total</span>
                      <span>${Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.deliveryAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                    {order.specialInstructions && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Instructions</span>
                        <p>{order.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
