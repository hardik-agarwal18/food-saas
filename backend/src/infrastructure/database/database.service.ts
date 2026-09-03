import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';
import { registerQueryLogger } from './query-logger.js';
import type { PrismaClient } from '../../generated/prisma/client.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';
import { LoggerFactory } from '../observability/logger/logger.factory.js';

@injectable()
export class DatabaseService {
  constructor(
    @inject(InfrastructureTokens.PrismaClient) private readonly prisma: PrismaClient,

    @inject(InfrastructureTokens.Logger) private readonly logger: ILogger,

    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create({ component: 'Database', module: 'Infrastructure' });
  }

  async connectToDatabase(): Promise<void> {
    try {
      this.logger.info('Connecting to the database...', {
        event: 'CONNECTING_DATABASE',
        component: 'Database',
        module: 'Infrastructure',
      });

      // Connects the Prisma's Query event system to app logger
      registerQueryLogger();

      // Establishes the database connection
      await this.prisma.$connect();

      this.logger.info('Successfully connected to the database.');
    } catch (error) {
      this.logger.fatal('Failed to connect to the database.', error);
      throw error;
    }
  }

  async disconnectFromDatabase(): Promise<void> {
    try {
      this.logger.info('Disconnecting from the database...', {
        event: 'DISCONNECTING_DATABASE',
        component: 'Database',
        module: 'Infrastructure',
      });

      await this.prisma.$disconnect();

      this.logger.info('Successfully disconnected from the database.');
    } catch (error) {
      this.logger.fatal('Failed to disconnect from the database.', error);
    }
  }

  async checkDatabaseHealth() {
    try {
      const startedAt = process.hrtime.bigint();

      await this.prisma.$queryRaw`SELECT 1`;

      const latency = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return { status: 'unhealthy' };
    }
  }

  public getClient = (): PrismaClient => {
    return this.prisma;
  };
}
