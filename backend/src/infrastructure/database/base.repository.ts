import { Prisma } from '../../generated/prisma/client.js';
import type { PrismaClient } from '../../generated/prisma/client.js';
import { translateDatabaseError } from './error.js';

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaClient) {}

  protected async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw translateDatabaseError(error);
      //throw is not required here as the error will be propagated to the caller and handled there
    }
  }

  protected async executeTransaction<T>(
    tx: Prisma.TransactionClient,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await operation(tx);
    } catch (error) {
      throw translateDatabaseError(error);
      //throw is not required here as the error will be propagated to the caller and handled there
    }
  }
}
