import { container } from 'tsyringe';
import { Job, Worker } from 'bullmq';
import { InfrastructureTokens } from '../../container/tokens/infrastructure.tokens.js';
import { EmailJobProcessor } from '../jobs/email/email.job.processor.js';
import { redisConnection } from '../../../config/redis.js';
import type { ILogger } from '../../../shared/logger/logger.interface.js';
import { requestContextStore } from '../../../shared/request-context/request.context.js';
import type { BaseEmailJob } from '../types/email.job.types.js';

const emailJobProcessor = container.resolve<EmailJobProcessor>(
  InfrastructureTokens.EmailJobProcessor,
);

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'EmailWorker' });

export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    const data = job.data as BaseEmailJob;
    const correlationId = data.correlationId ?? crypto.randomUUID();
    const requestId = crypto.randomUUID();

    return requestContextStore.run({ correlationId, requestId }, async () => {
      await emailJobProcessor.process(job);
    });
  },
  {
    connection: redisConnection,
    concurrency: 5,
    prefix: process.env.NODE_ENV === 'test' ? 'test-bull' : 'bull',
  },
);

emailWorker.on('completed', (job) => {
  const data = job.data as BaseEmailJob;
  logger.info(`Email job completed successfully`, {
    jobId: job.id,
    jobName: job.name,
    correlationId: data.correlationId,
  });
});

emailWorker.on('failed', (job, error) => {
  const data = job?.data as BaseEmailJob | undefined;
  logger.error(`Email job failed after all attempts`, error, {
    jobId: job?.id,
    jobName: job?.name,
    correlationId: data?.correlationId,
  });
});

emailWorker.on('error', (error) => {
  logger.error('Email worker encountered an internal error', error);
});
