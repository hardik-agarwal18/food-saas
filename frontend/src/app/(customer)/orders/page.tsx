'use client';

import { useMyOrders } from '@/features/ordering/queries';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useMyOrders();

  return (
    <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-muted animate-pulse rounded-xl" />
            <div className="h-24 bg-muted animate-pulse rounded-xl" />
          </div>
        ) : isError ? (
          <div className="text-center p-8 text-destructive border rounded-xl">
            Failed to load orders.
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground border rounded-xl">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer mb-4">
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                      <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="font-medium text-foreground">${Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
