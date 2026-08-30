import { logger } from '../../config/logger.js';
import { prisma } from './prisma.js';

export const checkDatabaseHealth = async () => {
  try {
    const startedAt = process.hrtime.bigint();

    await prisma.$queryRaw`SELECT 1`;

    const latency = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return { status: 'unhealthy' };
  }
};
