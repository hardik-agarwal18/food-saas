export interface EmailService {
  sendVerificationEmail(email: string, verificationUrl: string): Promise<void>;
  sendResetPasswordEmail(email: string, resetPasswordUrl: string): Promise<void>;
  sendOrderReadyEmail(email: string, orderId: string, restaurantName: string): Promise<void>;
  sendOrderPickedUpEmail(email: string, orderId: string, driverName: string): Promise<void>;
  sendOrderDeliveredEmail(email: string, orderId: string): Promise<void>;
}
