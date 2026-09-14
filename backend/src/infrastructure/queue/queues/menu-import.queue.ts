import { Queue } from 'bullmq';
import { redisConnection } from '../../../config/redis.js';
import { MenuImportJobName, type ProcessMenuImportJob } from '../types/menu-import.job.types.js';

export const menuImportQueue = new Queue('menu-import', {
  connection: redisConnection,
  prefix: process.env.NODE_ENV === 'test' ? 'test-bull' : 'bull',

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: 'exponential',
      delay: 5_000,
    },

    removeOnComplete: {
      age: 60 * 60,
      count: 1_000,
    },

    removeOnFail: {
      age: 24 * 60 * 60,
      count: 5_000,
    },
  },
});

export const addProcessMenuImportJob = async (data: ProcessMenuImportJob) => {
  return menuImportQueue.add(MenuImportJobName.PROCESS_MENU_IMPORT, data);
};
