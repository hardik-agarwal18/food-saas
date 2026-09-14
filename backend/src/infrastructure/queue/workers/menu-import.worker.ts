import { container } from 'tsyringe';
import { Job, Worker } from 'bullmq';
import { InfrastructureTokens } from '../../container/tokens/infrastructure.tokens.js';
import { MenuImportJobProcessor } from '../jobs/menu-import/menu-import.job.processor.js';
import { redisConnection } from '../../../config/redis.js';
import type { ILogger } from '../../../shared/logger/logger.interface.js';
import { requestContextStore } from '../../../shared/request-context/request.context.js';
import type { ProcessMenuImportJob } from '../types/menu-import.job.types.js';

const menuImportJobProcessor = container.resolve<MenuImportJobProcessor>(
  InfrastructureTokens.MenuImportJobProcessor,
);

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'MenuImportWorker' });

export const menuImportWorker = new Worker(
  'menu-import',
  async (job: Job) => {
    const data = job.data as ProcessMenuImportJob;
    const correlationId = (data as any).correlationId ?? crypto.randomUUID();
    const requestId = crypto.randomUUID();

    return requestContextStore.run({ correlationId, requestId }, async () => {
      await menuImportJobProcessor.process(job);
    });
  },
  {
    connection: redisConnection,
    concurrency: 5, // We can run a few concurrently, wait for OCR
    prefix: process.env.NODE_ENV === 'test' ? 'test-bull' : 'bull',
  },
);

menuImportWorker.on('completed', (job) => {
  logger.info(`Menu import job completed successfully`, {
    jobId: job.id,
    jobName: job.name,
  });
});

menuImportWorker.on('failed', (job, error) => {
  logger.error(`Menu import job failed after all attempts`, error, {
    jobId: job?.id,
    jobName: job?.name,
  });
});

menuImportWorker.on('error', (error) => {
  logger.error('Menu import worker encountered an internal error', error);
});
