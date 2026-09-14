export const PaymentTokens = {
  PaymentProviderResolver: Symbol.for('Payment.PaymentProviderResolver'),
  PaymentAttemptRepository: Symbol.for('Payment.PaymentAttemptRepository'),
  InitializePaymentUseCase: Symbol.for('Payment.InitializePaymentUseCase'),
  ProcessWebhookUseCase: Symbol.for('Payment.ProcessWebhookUseCase'),
  PaymentTransaction: Symbol.for('Payment.PaymentTransaction'),
};
