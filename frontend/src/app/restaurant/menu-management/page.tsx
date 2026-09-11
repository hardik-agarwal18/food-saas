'use client';

import { useMyRestaurants } from '@/features/restaurants/queries';
import { useRestaurantMenu } from '@/features/restaurants/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function MenuManagementPage() {
  const { data: restaurants, isLoading: isLoadingRest } = useMyRestaurants();
  const restaurantId = restaurants?.[0]?.id || null;
  const { data: menuCategories, isLoading: isLoadingMenu } = useRestaurantMenu(restaurantId || '');

  if (isLoadingRest) return <div className="p-8">Loading...</div>;
  if (!restaurantId) return <div className="p-8">No restaurant found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      {isLoadingMenu ? (
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-slate-200 rounded-xl" />
          <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
      ) : menuCategories && menuCategories.length > 0 ? (
        <div className="space-y-8">
          {menuCategories.map((category: any) => (
            <Card key={category.id} className="border-t-4 border-t-slate-800">
              <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b py-3">
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {category.items?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">No items in this category.</div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex-1 pr-4">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                          <div className="font-medium mt-2">${Number(item.price).toFixed(2)}</div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded object-cover" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-16 border-2 border-dashed rounded-xl text-muted-foreground bg-slate-50">
          <p className="text-lg font-medium mb-2">Your menu is empty</p>
          <p className="mb-6">Start building your menu by adding your first category.</p>
          <Button size="lg"><Plus className="w-5 h-5 mr-2" /> Add Category</Button>
        </div>
      )}
    </div>
  );
}
