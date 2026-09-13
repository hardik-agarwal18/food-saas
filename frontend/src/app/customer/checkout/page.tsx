import { CheckoutForm } from '@/features/customer/orders/components/CheckoutForm';
import { RequireRole } from '@/components/auth/RequireRole';
import { Role } from '@/types/api.types';

export default function CheckoutPage() {
  return (
    <RequireRole allowedRoles={[Role.CUSTOMER]}>
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutForm />
      </main>
    </RequireRole>
  );
}
