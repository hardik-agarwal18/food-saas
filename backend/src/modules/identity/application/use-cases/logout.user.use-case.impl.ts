import { injectable, inject } from 'tsyringe';
import { LogoutUserUseCase } from './logout-user.use-case.js';
import { IdentityTokens } from '../../infrastructure/persistence/tokens/identity.tokens.js';
import type { IRefreshSessionRepository } from '../../domain/repositories/refresh-session.repository.js';
import { LogoutUserInput } from '../dto/logout-user-dto.js';
import type { ITokenHasher } from '../../domain/services/token-hasher.js';
import { RefreshSessionNotFound } from '../../domain/errors/refresh-session-not-found.error.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class LogoutUserUseCaseImpl implements LogoutUserUseCase {
  constructor(
    @inject(IdentityTokens.RefreshSessionRepository)
    private readonly refreshSessionRepo: IRefreshSessionRepository,

    @inject(IdentityTokens.TokenHasher)
    private readonly tokenHasher: ITokenHasher,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: LogoutUserInput): Promise<void> {
    this.logger.info('Executing LogoutUserUseCase');

    const tokenHash = this.tokenHasher.hash(input.refreshToken);

    const refreshSession = await this.refreshSessionRepo.findByTokenHash(tokenHash);

    if (!refreshSession) {
      this.logger.warn('Logout failed: Refresh session not found');
      throw new RefreshSessionNotFound();
    }

    const revokedAt = new Date();
    await this.refreshSessionRepo.revokeByTokenHash(tokenHash, revokedAt);

    this.logger.info('User logged out successfully', {
      refreshSessionId: refreshSession.getId(),
      revokedAt,
    });
  }
}
