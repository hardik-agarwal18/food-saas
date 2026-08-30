import { prisma } from './prisma.js';

export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'healthy',
    };
  } catch {
    return { status: 'unhealthy' };
  }
};
