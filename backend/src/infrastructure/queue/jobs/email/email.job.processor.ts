import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../container/tokens/index.js';
import type { EmailService } from '../../../email/email.service.js';
import { Job } from 'bullmq';
import {
  EmailJobName,
  SendResetPasswordEmailJob,
  SendVerificationEmailJob,
} from '../../types/email.job.types.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class EmailJobProcessor {
  private readonly logger: ILogger;

  constructor(
    @inject(InfrastructureTokens.EmailService)
    private readonly emailService: EmailService,
    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'EmailJobProcessor' });
  }

  async process(job: Job): Promise<void> {
    this.logger.info(`Starting to process email job`, {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade,
    });

    try {
      switch (job.name) {
        case EmailJobName.SEND_VERIFICATION_EMAIL: {
          const data = job.data as SendVerificationEmailJob;
          this.logger.debug(`Sending verification email`, { email: data.email });
          await this.emailService.sendVerificationEmail(data.email, data.verificationUrl);
          this.logger.info(`Successfully sent verification email`, { email: data.email });
          return;
        }

        case EmailJobName.SEND_RESET_PASSWORD_EMAIL: {
          const data = job.data as SendResetPasswordEmailJob;
          this.logger.debug(`Sending reset password email`, { email: data.email });
          await this.emailService.sendResetPasswordEmail(data.email, data.resetPasswordUrl);
          this.logger.info(`Successfully sent reset password email`, { email: data.email });
          return;
        }

        default:
          this.logger.error(`Unsupported email job type received`, undefined, {
            jobName: job.name,
          });
          throw new Error(`Unsupported email job: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process email job`, error, {
        jobId: job.id,
        jobName: job.name,
      });
      throw error;
    }
  }
}
