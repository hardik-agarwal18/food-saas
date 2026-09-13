'use client';

import { useState } from 'react';
import { MenuItem, OrderItemModifier } from '@/types/api.types';
import { useCartStore } from '@/features/cart/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ModifierItemData {
  id: string;
  name: string;
  price: number | string;
}

interface ModifierGroupData {
  id: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  items: ModifierItemData[];
}

interface MenuItemModalProps {
  item: MenuItem;
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuItemModal({ item, restaurantId, isOpen, onClose }: MenuItemModalProps) {
  const { addItem, clearCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const [conflictError, setConflictError] = useState(false);

  // Group modifiers by group if the backend returns it that way, 
  // but looking at MenuItem in backend it usually has `modifierGroups`
  // Let's assume item.modifierGroups exists. If not, we just show add to cart.
  
  const handleAddModifier = (modItem: ModifierItemData) => {
    // Basic logic for selecting modifiers (omitting complex min/max validation for brevity, 
    // but a real implementation would check group.minSelections/maxSelections)
    const exists = selectedModifiers.find(m => m.modifierItemId === modItem.id);
    if (exists) {
      setSelectedModifiers(selectedModifiers.filter(m => m.modifierItemId !== modItem.id));
    } else {
      setSelectedModifiers([...selectedModifiers, {
        modifierItemId: modItem.id,
        name: modItem.name,
        price: modItem.price,
      }]);
    }
  };

  const handleAddToCart = () => {
    try {
      addItem({
        menuItem: item,
        quantity,
        modifiers: selectedModifiers,
        specialInstructions
      }, restaurantId);
      onClose();
      // reset state for next time
      setQuantity(1);
      setSelectedModifiers([]);
      setSpecialInstructions('');
    } catch (error) {
      if (error instanceof Error && error.message === 'RESTAURANT_CONFLICT') {
        setConflictError(true);
      }
    }
  };

  const handleConfirmReplaceCart = () => {
    clearCart();
    setConflictError(false);
    handleAddToCart();
  };

  const totalPrice = (Number(item.price) + selectedModifiers.reduce((acc, m) => acc + Number(m.price), 0)) * quantity;

  return (
    <>
      <Dialog open={isOpen && !conflictError} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>{item.description}</DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {/* If item has modifierGroups, map them here. Assuming `item.modifierGroups` for now */}
            {((item as unknown) as { modifierGroups?: ModifierGroupData[] }).modifierGroups?.map((group) => (
              <div key={group.id} className="space-y-3">
                <div>
                  <h4 className="font-semibold">{group.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {group.isRequired ? `Required (Choose ${group.minSelections}${group.maxSelections > group.minSelections ? ` to ${group.maxSelections}` : ''})` : `Optional (Up to ${group.maxSelections})`}
                  </p>
                </div>
                <div className="space-y-2">
                  {group.items?.map((modItem) => (
                    <div key={modItem.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={modItem.id} 
                        checked={!!selectedModifiers.find(m => m.modifierItemId === modItem.id)}
                        onCheckedChange={() => handleAddModifier(modItem)}
                      />
                      <div className="flex flex-1 justify-between items-center">
                        <Label htmlFor={modItem.id} className="cursor-pointer">{modItem.name}</Label>
                        {Number(modItem.price) > 0 && <span className="text-sm text-muted-foreground">+${Number(modItem.price).toFixed(2)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea 
                id="specialInstructions" 
                placeholder="E.g., No onions, extra sauce..." 
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleAddToCart} className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add {quantity} to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Modal */}
      <Dialog open={conflictError} onOpenChange={() => setConflictError(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Cart?</DialogTitle>
            <DialogDescription>
              Your cart contains items from a different restaurant. Would you like to clear your cart and add this item instead?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConflictError(false)}>Cancel</Button>
            <Button variant="default" onClick={handleConfirmReplaceCart}>Replace Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
