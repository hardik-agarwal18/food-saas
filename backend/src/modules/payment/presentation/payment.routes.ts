import { container } from 'tsyringe';
import { PaymentController } from './controllers/payment.controller.js';
import { AuthenticationMiddleware } from '../../../app/middleware/authentication.middleware.js';
import express from 'express';

const paymentRouter = express.Router();

const auth = container.resolve(AuthenticationMiddleware);
const paymentController = container.resolve(PaymentController);

// Initialize payment (protected route)
paymentRouter.post('/initialize', auth.authenticate, paymentController.initializePayment);

// IMPORTANT: Webhook requires raw body. The global body parser handles capturing it to req.rawBody.
paymentRouter.post('/webhooks/stripe', paymentController.handleStripeWebhook);

export { paymentRouter };
