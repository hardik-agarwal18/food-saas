import { container } from 'tsyringe';
import { Job, Worker } from 'bullmq';
import { InfrastructureTokens } from '../../container/tokens/infrastructure.tokens.js';
import { EmailJobProcessor } from '../jobs/email/email.job.processor.js';
import { redisConnection } from '../../../config/redis.js';
import type { ILogger } from '../../../shared/logger/logger.interface.js';

const emailJobProcessor = container.resolve<EmailJobProcessor>(
  InfrastructureTokens.EmailJobProcessor,
);

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'EmailWorker' });

export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    await emailJobProcessor.process(job);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job completed successfully`, { jobId: job.id, jobName: job.name });
});

emailWorker.on('failed', (job, error) => {
  logger.error(`Email job failed after all attempts`, error, {
    jobId: job?.id,
    jobName: job?.name,
  });
});

emailWorker.on('error', (error) => {
  logger.error('Email worker encountered an internal error', error);
});
