'use client';

import { useRestaurants } from '../queries';
import { RestaurantCard } from './RestaurantCard';
interface RestaurantListProps {
  searchQuery?: string;
  lat?: number;
  lng?: number;
}

export function RestaurantList({ searchQuery, lat, lng }: RestaurantListProps) {
  const { data, isLoading, isError } = useRestaurants({ 
    search: searchQuery, 
    latitude: lat, 
    longitude: lng, 
    limit: 20 
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Featured Restaurants</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted/20 animate-pulse h-[300px]" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center text-destructive p-8 border rounded-xl">
          Failed to load restaurants.
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 border rounded-xl">
          No restaurants found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.items.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
