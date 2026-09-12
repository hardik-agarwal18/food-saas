import { Restaurant } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video w-full bg-muted relative">
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
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-xl">{restaurant.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex justify-between">
          <span>{restaurant.city}, {restaurant.state}</span>
          <span className="capitalize">{restaurant.status.toLowerCase()}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
