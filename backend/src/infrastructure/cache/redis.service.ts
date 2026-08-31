import { logger } from '../../config/logger.js';
import redis from './redis.js';

export const connectToRedis = async () => {
  try {
    logger.info('Connecting to Redis...');

    await redis.connect();

    logger.info('Connected to Redis successfully');
  } catch (error) {
    logger.fatal({ error }, 'Failed to connect to Redis');
  }
};

export const disconnectFromRedis = async () => {
  try {
    logger.info('Disconnecting from Redis...');

    await redis.quit();

    logger.info('Disconnected from Redis successfully');
  } catch (error) {
    logger.fatal({ error }, 'Failed to disconnect from Redis');
  }
};
