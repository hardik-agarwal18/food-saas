import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, OrderItemModifier } from '@/types/api.types';

export interface CartItem {
  id: string; // Unique ID for the cart item (since same menu item can have different modifiers)
  menuItem: MenuItem;
  quantity: number;
  modifiers: OrderItemModifier[];
  specialInstructions?: string;
}

interface CartState {
  restaurantId: string | null;
  items: CartItem[];
  
  addItem: (item: Omit<CartItem, 'id'>, restaurantId: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      items: [],
      
      addItem: (item, newRestaurantId) => set((state) => {
        // Prevent adding items from multiple restaurants
        if (state.restaurantId && state.restaurantId !== newRestaurantId && state.items.length > 0) {
          // In a real app, you might want to prompt the user before clearing
          return {
            restaurantId: newRestaurantId,
            items: [{ ...item, id: crypto.randomUUID() }]
          };
        }
        
        // Check if identical item already exists (same menu item, same modifiers)
        const existingItemIndex = state.items.findIndex(
          (i) => i.menuItem.id === item.menuItem.id && 
                 JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
                 i.specialInstructions === item.specialInstructions
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += item.quantity;
          return { items: newItems, restaurantId: newRestaurantId };
        }
        
        return {
          restaurantId: newRestaurantId,
          items: [...state.items, { ...item, id: crypto.randomUUID() }]
        };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        restaurantId: state.items.length === 1 ? null : state.restaurantId
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          const newItems = state.items.filter((item) => item.id !== id);
          return { items: newItems, restaurantId: newItems.length === 0 ? null : state.restaurantId };
        }
        
        return {
          items: state.items.map((item) => 
            item.id === id ? { ...item, quantity } : item
          )
        };
      }),
      
      clearCart: () => set({ items: [], restaurantId: null }),
      
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const itemPrice = Number(item.menuItem.price);
          const modifiersPrice = item.modifiers.reduce((sum, mod) => sum + Number(mod.price), 0);
          return total + (itemPrice + modifiersPrice) * item.quantity;
        }, 0);
      }
    }),
    {
      name: 'food-saas-cart',
    }
  )
);
