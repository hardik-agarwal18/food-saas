import { container } from 'tsyringe';
import { Job, Worker } from 'bullmq';
import { InfrastructureTokens } from '../../container/tokens/infrastructure.tokens.js';
import { AvatarJobProcessor } from '../jobs/avatar/avatar.job.processor.js';
import { redisConnection } from '../../../config/redis.js';
import type { ILogger } from '../../../shared/logger/logger.interface.js';
import { requestContextStore } from '../../../shared/request-context/request.context.js';
import type { UploadAvatarJobData } from '../types/avatar.job.types.js';

const avatarJobProcessor = container.resolve<AvatarJobProcessor>(
  InfrastructureTokens.AvatarJobProcessor,
);

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'AvatarWorker' });

export const avatarWorker = new Worker(
  'avatar',
  async (job: Job) => {
    // BullMQ jobs might not have correlationId by default unless we add it, but request context still needs one
    const data = job.data as UploadAvatarJobData;
    const correlationId = (data as any).correlationId ?? crypto.randomUUID();
    const requestId = crypto.randomUUID();

    return requestContextStore.run({ correlationId, requestId }, async () => {
      await avatarJobProcessor.process(job);
    });
  },
  {
    connection: redisConnection,
    concurrency: 2, // Avatar processing might be I/O heavy
    prefix: process.env.NODE_ENV === 'test' ? 'test-bull' : 'bull',
  },
);

avatarWorker.on('completed', (job) => {
  logger.info(`Avatar job completed successfully`, {
    jobId: job.id,
    jobName: job.name,
  });
});

avatarWorker.on('failed', (job, error) => {
  logger.error(`Avatar job failed after all attempts`, error, {
    jobId: job?.id,
    jobName: job?.name,
  });
});

avatarWorker.on('error', (error) => {
  logger.error('Avatar worker encountered an internal error', error);
});
