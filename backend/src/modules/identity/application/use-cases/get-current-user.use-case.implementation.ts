import { injectable, inject } from 'tsyringe';
import { GetCurrentUserResult } from '../dto/get-current-user-result.dto.js';
import { GetCurrentUserUseCase } from './get-current-user.user-case.js';
import { IdentityTokens } from '../../infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class GetCurrentUserUseCaseImplementation implements GetCurrentUserUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(userId: string): Promise<GetCurrentUserResult> {
    this.logger.info('Executing GetCurrentUserUseCase', { userId });

    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logger.warn('Get current user failed: User not found', { userId });
      throw new NotFoundError('User not found.');
    }

    this.logger.info('Current user retrieved successfully', { userId: user.getId() });

    return {
      userId: user.getId(),
      email: user.getEmail().getValue(),
      roles: user.getRoles(),
      status: user.getStatus(),
      isEmailVerified: user.isEmailVerified(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
