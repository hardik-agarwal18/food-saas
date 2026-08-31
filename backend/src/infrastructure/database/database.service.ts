import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';
import { registerQueryLogger } from './query-logger.js';
import type { PrismaClient } from '../../generated/prisma/client.js';
import type { Logger } from 'pino';

@injectable()
export class DatabaseService {
  constructor(
    @inject(InfrastructureTokens.PrismaClient) private readonly prisma: PrismaClient,

    @inject(InfrastructureTokens.Logger) private readonly logger: Logger,
  ) {}

  async connectToDatabase(): Promise<void> {
    try {
      this.logger.info('Connecting to the database...');

      registerQueryLogger();

      await this.prisma.$connect();

      this.logger.info('Successfully connected to the database.');
    } catch (error) {
      this.logger.fatal({ error }, 'Failed to connect to the database.');
    }
  }

  async disconnectFromDatabase(): Promise<void> {
    try {
      this.logger.info('Disconnecting from the database...');

      await this.prisma.$disconnect();

      this.logger.info('Successfully disconnected from the database.');
    } catch (error) {
      this.logger.fatal({ error }, 'Failed to disconnect from the database.');
    }
  }
}
