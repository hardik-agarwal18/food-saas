import { CheckoutForm } from '@/features/ordering/components/CheckoutForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/api.types';

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={[Role.CUSTOMER]}>
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutForm />
      </main>
    </ProtectedRoute>
  );
}
