import { RestaurantList } from '@/features/restaurants/components/RestaurantList';

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Crave it? Get it.
        </h1>
        <p className="text-xl text-muted-foreground">
          Discover the best local restaurants delivering to your door.
        </p>
      </div>
      
      <RestaurantList />
    </main>
  );
}
