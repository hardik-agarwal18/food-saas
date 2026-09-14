import { Router } from 'express';
import { container } from 'tsyringe';
import { PaymentController } from './controllers/payment.controller.js';
import { AuthenticationMiddleware } from '../../../app/middleware/authentication.middleware.js';
import express from 'express';

const paymentRouter = Router();

const auth = container.resolve(AuthenticationMiddleware);
const paymentController = container.resolve(PaymentController);

// Initialize payment (protected route)
paymentRouter.post('/initialize', auth.authenticate, paymentController.initializePayment);

// IMPORTANT: Webhook requires raw body. We must ensure it's not parsed as JSON by global middleware.
paymentRouter.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook,
);

export { paymentRouter };
