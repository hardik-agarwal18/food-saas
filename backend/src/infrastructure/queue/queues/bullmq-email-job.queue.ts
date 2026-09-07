import { injectable } from 'tsyringe';
import { IEmailJobQueue } from '../../../modules/identity/application/services/email-job-queue.js';
import { emailQueue } from './email.queue.js';
import { EmailJobName } from '../types/email.job.types.js';
import { requestContextStore } from '../../../shared/request-context/request.context.js';

@injectable()
export class BullMQEmailJobQueue implements IEmailJobQueue {
  async enqueueVerificationEmail(data: {
    userId: string;
    email: string;
    verificationUrl: string;
  }): Promise<void> {
    const correlationId = requestContextStore.get()?.correlationId;
    await emailQueue.add(EmailJobName.SEND_VERIFICATION_EMAIL, { ...data, correlationId });
  }

  async enqueueResetPasswordEmail(data: {
    userId: string;
    email: string;
    resetPasswordUrl: string;
  }): Promise<void> {
    const correlationId = requestContextStore.get()?.correlationId;
    await emailQueue.add(EmailJobName.SEND_RESET_PASSWORD_EMAIL, { ...data, correlationId });
  }
}
