import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from './prisma.js';
import { translateDatabaseError } from './error.js';

export abstract class BaseRepository {
  protected readonly prisma = prisma;

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
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw translateDatabaseError(error);
      //throw is not required here as the error will be propagated to the caller and handled there
    }
  }
}
