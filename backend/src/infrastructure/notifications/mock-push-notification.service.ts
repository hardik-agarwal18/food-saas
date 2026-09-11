import { injectable, inject } from 'tsyringe';
import { PushNotificationService } from './push-notification.service.js';
import { InfrastructureTokens } from '../container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';

@injectable()
export class MockPushNotificationService implements PushNotificationService {
  private readonly logger: ILogger;

  constructor(
    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'MockPushNotificationService' });
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    // In a real application, this would call Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs).
    this.logger.info(`[SIMULATED PUSH] Sent to User ${userId}`, {
      title,
      body,
      data,
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
