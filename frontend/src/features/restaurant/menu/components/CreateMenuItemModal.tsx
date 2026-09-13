'use client';

import { useState } from 'react';
import { useCreateMenuItemMutation } from '../mutations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateMenuItemModalProps {
  restaurantId: string;
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMenuItemModal({ restaurantId, categoryId, isOpen, onClose }: CreateMenuItemModalProps) {
  const mutation = useCreateMenuItemMutation(restaurantId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    
    mutation.mutate({ 
      name, 
      description, 
      price: parseFloat(price), 
      categoryId 
    }, {
      onSuccess: () => {
        setName('');
        setDescription('');
        setPrice('');
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-price">Price ($)</Label>
            <Input id="item-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-desc">Description (optional)</Label>
            <Textarea id="item-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
