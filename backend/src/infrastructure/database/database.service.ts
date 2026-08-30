import { logger } from '../../config/logger.js';
import { prisma } from './prisma.js';

export const connectToDatabase = async (): Promise<void> => {
  try {
    logger.info('Connecting to the database...');

    await prisma.$connect();

    logger.info('Successfully connected to the database.');
  } catch (error) {
    logger.fatal({ error }, 'Failed to connect to the database.');
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    logger.info('Disconnecting from the database...');

    await prisma.$disconnect();

    logger.info('Successfully disconnected from the database.');
  } catch (error) {
    logger.fatal({ error }, 'Failed to disconnect from the database.');
  }
};
