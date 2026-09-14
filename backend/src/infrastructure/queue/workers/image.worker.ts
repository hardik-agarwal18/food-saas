import { container } from 'tsyringe';
import { Job, Worker } from 'bullmq';
import { InfrastructureTokens } from '../../container/tokens/infrastructure.tokens.js';
import { ImageJobProcessor } from '../jobs/image/image.job.processor.js';
import { redisConnection } from '../../../config/redis.js';
import type { ILogger } from '../../../shared/logger/logger.interface.js';
import { requestContextStore } from '../../../shared/request-context/request.context.js';
import type { ImageProcessingJobData } from '../types/image.job.types.js';

const imageJobProcessor = container.resolve<ImageJobProcessor>(
  InfrastructureTokens.ImageJobProcessor,
);

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'ImageWorker' });

export const imageWorker = new Worker(
  'image',
  async (job: Job) => {
    // BullMQ jobs might not have correlationId by default unless we add it, but request context still needs one
    const data = job.data as ImageProcessingJobData;
    const correlationId = (data as any).correlationId ?? crypto.randomUUID();
    const requestId = crypto.randomUUID();

    return requestContextStore.run({ correlationId, requestId }, async () => {
      await imageJobProcessor.process(job);
    });
  },
  {
    connection: redisConnection,
    concurrency: 2, // Image processing might be I/O heavy
    prefix: process.env.NODE_ENV === 'test' ? 'test-bull' : 'bull',
  },
);

imageWorker.on('completed', (job) => {
  logger.info(`Image job completed successfully`, {
    jobId: job.id,
    jobName: job.name,
  });
});

imageWorker.on('failed', (job, error) => {
  logger.error(`Image job failed after all attempts`, error, {
    jobId: job?.id,
    jobName: job?.name,
  });
});

imageWorker.on('error', (error) => {
  logger.error('Image worker encountered an internal error', error);
});
