'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useCartStore } from '@/features/customer/cart/store';
import { useRouter } from 'next/navigation';

interface StripePaymentFormProps {
  orderId: string;
  clientSecret: string;
  grandTotal: number;
  onBack: () => void;
}

export function StripePaymentForm({ orderId, clientSecret, grandTotal, onBack }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const clearCart = useCartStore((state: any) => state.clearCart);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // You could add a return_url here if you wanted redirect-based flow
        // But since we are handling this as a single-page flow and card payments
        // might not require redirect, we can handle it directly or let Stripe redirect.
        // For testing, Stripe usually redirects if we set return_url.
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred during payment processing.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded!
      clearCart();
      router.push(`/customer/orders/${orderId}`);
    } else {
      // Payment requires next action (e.g., 3D Secure) or failed
      // For simplified demo, just redirect or show error
      setErrorMessage(`Payment status: ${paymentIntent?.status}`);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 text-sm mb-6">
        <CreditCard className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>Use Stripe test cards (e.g. 4242 4242 4242 4242) for testing. Real payments are processed securely by Stripe.</p>
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm mb-6">
          {errorMessage}
        </div>
      )}

      <PaymentElement options={{ layout: 'tabs' }} />

      <div className="flex gap-4 mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button 
          type="submit"
          className="flex-1" 
          size="lg"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}
