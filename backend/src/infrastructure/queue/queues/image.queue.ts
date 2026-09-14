import { Queue } from 'bullmq';
import { redisConnection } from '../../../config/redis.js';
import { ImageJobName, type ImageProcessingJobData } from '../types/image.job.types.js';

export const imageQueue = new Queue('image', {
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

export const addImageProcessingJob = async (data: ImageProcessingJobData) => {
  return imageQueue.add(ImageJobName.PROCESS_IMAGE, data);
};
