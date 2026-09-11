import { Queue } from 'bullmq';
import { redisConnection } from '../../../config/redis.js';
import { AvatarJobName, type UploadAvatarJobData } from '../types/avatar.job.types.js';

export const avatarQueue = new Queue('avatar', {
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

export const addAvatarUploadJob = async (data: UploadAvatarJobData) => {
  return avatarQueue.add(AvatarJobName.UPLOAD_AVATAR, data);
};
