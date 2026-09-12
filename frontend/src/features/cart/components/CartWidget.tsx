'use client';

import { useCartStore } from '../store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CartWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  // Prevent hydration mismatch for persisted store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 rounded-full shadow-lg flex items-center gap-2 px-6"
        size="lg"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="bg-primary-foreground text-primary text-xs font-bold px-2 py-0.5 rounded-full">
            {totalItems}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Your Cart
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <ShoppingCart className="h-12 w-12 opacity-20" />
                  <p>Your cart is empty</p>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Browse Restaurants
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.menuItem.name}</h4>
                      <div className="text-sm text-muted-foreground mt-1">
                        ${Number(item.menuItem.price).toFixed(2)}
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-semibold">
                        ${((Number(item.menuItem.price) + item.modifiers.reduce((sum, mod) => sum + Number(mod.price), 0)) * item.quantity).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2 bg-background border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-4 text-center text-sm">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {items.length > 0 && (
              <div className="p-4 border-t bg-muted/10 space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => setIsOpen(false)}>
                  <Link href="/checkout" className="w-full h-full flex items-center justify-center">
                    Proceed to Checkout
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
