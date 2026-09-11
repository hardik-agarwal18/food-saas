'use client';

import { useRestaurant, useRestaurantMenu } from '../queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { MenuItem } from '@/types/api.types';

export function RestaurantDetail() {
  const { id } = useParams() as { id: string };
  const { data: restaurant, isLoading: isLoadingRest } = useRestaurant(id);
  const { data: menuCategories, isLoading: isLoadingMenu } = useRestaurantMenu(id);

  if (isLoadingRest) {
    return <div className="animate-pulse h-[300px] bg-muted rounded-xl" />;
  }

  if (!restaurant) {
    return <div className="text-center p-12">Restaurant not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-muted">
        {restaurant.coverImageUrl ? (
          <img 
            src={restaurant.coverImageUrl} 
            alt={restaurant.name} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            No Cover Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
          <p className="text-white/80">{restaurant.description}</p>
          <p className="text-white/80 mt-2 text-sm">{restaurant.streetAddress}, {restaurant.city}</p>
        </div>
      </div>

      {/* Menu Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Menu</h2>
        {isLoadingMenu ? (
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-muted animate-pulse rounded-xl" />
              <div className="h-32 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        ) : menuCategories && menuCategories.length > 0 ? (
          <div className="space-y-10">
            {menuCategories.map((category: any) => (
              <div key={category.id}>
                <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                {category.description && <p className="text-muted-foreground mb-4">{category.description}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items?.map((item: MenuItem) => (
                    <Card key={item.id} className="flex flex-col justify-between overflow-hidden">
                      <div className="flex justify-between p-4 gap-4">
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <p className="font-semibold mt-2">${Number(item.price).toFixed(2)}</p>
                        </div>
                        {item.imageUrl && (
                          <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-muted">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 pt-0">
                        <Button className="w-full" variant="secondary" onClick={() => console.log('Add to cart', item)}>
                          Add to Cart
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">This restaurant has not published a menu yet.</p>
        )}
      </div>
    </div>
  );
}
