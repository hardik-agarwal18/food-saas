'use client';

import { useCartStore } from '@/features/cart/store';
import { usePlaceOrderMutation } from '../mutations';
import { OrderType } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

export function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  
  const placeOrderMutation = usePlaceOrderMutation();
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DELIVERY);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      specialInstructions: '',
    }
  });

  const onSubmit = (data: any) => {
    if (!restaurantId || items.length === 0) return;

    placeOrderMutation.mutate({
      restaurantId,
      orderType,
      specialInstructions: data.specialInstructions,
      deliveryAddress: orderType === OrderType.DELIVERY ? {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      } : undefined,
      items: items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        modifierItemIds: item.modifiers.map(m => m.id),
        specialInstructions: item.specialInstructions,
      }))
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground">Add items to your cart before checking out.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
            <CardDescription>Where should we send your food?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button 
                type="button"
                variant={orderType === OrderType.DELIVERY ? 'default' : 'outline'}
                onClick={() => setOrderType(OrderType.DELIVERY)}
                className="flex-1"
              >
                Delivery
              </Button>
              <Button 
                type="button"
                variant={orderType === OrderType.PICKUP ? 'default' : 'outline'}
                onClick={() => setOrderType(OrderType.PICKUP)}
                className="flex-1"
              >
                Pickup
              </Button>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {orderType === OrderType.DELIVERY && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" {...register('street', { required: 'Street is required' })} />
                    {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register('city', { required: 'City is required' })} />
                      {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...register('state', { required: 'State is required' })} />
                      {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input id="zipCode" {...register('zipCode', { required: 'Zip code is required' })} />
                      {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" {...register('country', { required: 'Country is required' })} />
                      {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Delivery Instructions (optional)</Label>
                <Input id="specialInstructions" {...register('specialInstructions')} placeholder="Leave at door..." />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.menuItem.name}
                  </div>
                  <div>
                    ${((Number(item.menuItem.price) + item.modifiers.reduce((sum, mod) => sum + Number(mod.price), 0)) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              form="checkout-form"
              className="w-full mt-6" 
              size="lg"
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
