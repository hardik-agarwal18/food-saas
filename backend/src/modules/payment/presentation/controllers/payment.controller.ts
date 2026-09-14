import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { InitializePaymentUseCase } from '../../application/use-cases/initialize-payment.use-case.js';
import { PaymentTokens } from '../../infrastructure/tokens/payment.tokens.js';
import { ProcessWebhookUseCase } from '../../application/use-cases/process-webhook.use-case.js';
import { PlaceOrderDto } from '../../../ordering/application/dto/order.dto.js';
import { AppError } from '../../../../shared/errors/AppError.js';

@injectable()
export class PaymentController {
  constructor(
    @inject(PaymentTokens.InitializePaymentUseCase)
    private readonly initializePaymentUseCase: InitializePaymentUseCase,
    @inject(PaymentTokens.ProcessWebhookUseCase)
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  public initializePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED', true);
      }

      const dto = req.body as PlaceOrderDto;
      const result = await this.initializePaymentUseCase.execute(userId, dto);

      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  };

  public handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        res.status(400).send('Missing stripe-signature header');
        return;
      }

      // Note: express must be configured to pass raw body for this route
      const rawBody = (req as any).rawBody || req.body;
      await this.processWebhookUseCase.execute(rawBody, signature as string);

      res.status(200).send('Webhook processed');
    } catch (error: any) {
      console.error('Webhook processing error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  };
}
