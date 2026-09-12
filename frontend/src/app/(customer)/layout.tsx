import { CartWidget } from '@/features/cart/components/CartWidget';
import Link from 'next/link';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-primary">
            FoodSaaS
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="hover:text-primary transition-colors">
              Log In
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">
        {children}
      </div>
      <CartWidget />
    </div>
  );
}
