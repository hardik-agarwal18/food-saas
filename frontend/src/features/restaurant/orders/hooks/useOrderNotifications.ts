import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useOrderNotifications = (orders: any[] | undefined, isSoundEnabled: boolean) => {
  const previousOrdersRef = useRef<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      // Create a simple beep sound using a base64 encoded audio or standard HTML5 Audio
      // For demonstration, we'll use a generic beep data URI
      const audioUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqPb3BxdoCFiY+QfX+AhYyOkX1+f4OMj5J8e36CjI+Se3p9goyPknx7foKMj5J8en2CjI+SfHp9goyPknx6fYL/P/9/f/9/f/9/f/9/f/9/f/9/f/9/f/9/f/9/f/9/f/9/';
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.5;
    }
  }, []);

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    // Normalize list
    const currentOrders = Array.isArray(orders) ? orders : (orders as any).data || (orders as any).items || [];
    
    // If it's the first load, just set the ref and don't notify
    if (previousOrdersRef.current.length === 0) {
      previousOrdersRef.current = currentOrders;
      return;
    }

    // Find new orders that are in PENDING state and weren't in the previous list
    const previousOrderIds = new Set(previousOrdersRef.current.map(o => o.id));
    
    const newPendingOrders = currentOrders.filter(
      (o: any) => o.status === 'PENDING' && !previousOrderIds.has(o.id)
    );

    if (newPendingOrders.length > 0) {
      newPendingOrders.forEach((order: any) => {
        toast.success(`New order received! #${order.id.slice(-8)}`, {
          description: `Total: $${Number(order.totalAmount).toFixed(2)} - ${order.orderType}`,
          duration: 10000,
        });
      });

      if (isSoundEnabled && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play blocked by browser interaction policy:", e));
      }
    }

    // Update ref for next comparison
    previousOrdersRef.current = currentOrders;
  }, [orders, isSoundEnabled]);
};
