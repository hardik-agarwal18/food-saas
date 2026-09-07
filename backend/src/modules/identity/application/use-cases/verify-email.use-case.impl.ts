import { injectable, inject } from 'tsyringe';
import { VerifyEmailUseCase } from './verify-email.use-case.js';
import { VerifyEmailInput } from '../dto/verify-email.dto.js';
import { IdentityTokens } from '../../infrastructure/persistence/tokens/identity.tokens.js';
import type { IVerifyEmailRepository } from '../../domain/repositories/verify-email.repository.js';
import type { ITokenHasher } from '../../domain/services/token-hasher.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class VerifyEmailUseCaseImpl implements VerifyEmailUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,

    @inject(IdentityTokens.VerifyEmailRepository)
    private readonly verifyEmailRepo: IVerifyEmailRepository,

    @inject(IdentityTokens.TokenHasher)
    private readonly tokenHasher: ITokenHasher,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: VerifyEmailInput): Promise<void> {
    this.logger.info('Executing VerifyEmailUseCase');

    const token = input.token;
    const tokenHash = this.tokenHasher.hash(token);
    const verifyEmail = await this.verifyEmailRepo.findByToken(tokenHash);

    if (!verifyEmail) {
      this.logger.warn('Email verification failed: Token not found');
      throw new AuthenticationError('Invalid verification token');
    }

    const user = await this.userRepo.findById(verifyEmail.getUserId());

    if (!user) {
      this.logger.warn('Email verification failed: User not found', {
        verifyEmailId: verifyEmail.getId(),
        userId: verifyEmail.getUserId(),
      });
      throw new AuthenticationError('User not found');
    }

    if (verifyEmail.getVerifiedAt()) {
      this.logger.warn('Email verification failed: Token already used', {
        verifyEmailId: verifyEmail.getId(),
      });
      throw new AuthenticationError('Verified token already used');
    }

    const now = new Date();

    if (verifyEmail.getExpiresAt() < now) {
      this.logger.warn('Email verification failed: Token expired', {
        verifyEmailId: verifyEmail.getId(),
      });
      throw new AuthenticationError('Verification token has expired.');
    }

    await this.verifyEmailRepo.updateVerifiedAt(verifyEmail.getId(), now);

    user.verifyEmail();
    await this.userRepo.update(user);

    this.logger.debug('User email verified and token marked as used', {
      userId: user.getId(),
      verifyEmailId: verifyEmail.getId(),
    });

    this.logger.info('Email verified successfully', { userId: user.getId() });
  }
}
