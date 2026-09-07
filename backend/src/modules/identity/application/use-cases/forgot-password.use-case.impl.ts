import { injectable, inject } from 'tsyringe';
import { ForgotPasswordUseCase } from './forgot-password.use-case.js';
import { ForgotPasswordInput } from '../dto/forgot-password.dto.js';
import { IdentityTokens } from '../../infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { InvalidUrlError } from '../../../../shared/errors/InvalidUrlError.js';
import crypto from 'node:crypto';
import type { ITokenHasher } from '../../domain/services/token-hasher.js';
import { env } from '../../../../config/env.config.js';
import { ResetPasswordEntity } from '../../domain/entities/reset-password.entity.js';
import type { IPasswordResetRepository } from '../../domain/repositories/password-reset.repository.js';
import type { IEmailJobQueue } from '../services/email-job-queue.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,
    @inject(IdentityTokens.PasswordResetRepository)
    private readonly passwordResetRepo: IPasswordResetRepository,
    @inject(IdentityTokens.TokenHasher)
    private readonly tokenHasher: ITokenHasher,
    @inject(IdentityTokens.EmailJobQueue)
    private readonly emailJobQueue: IEmailJobQueue,
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    const rawEmail = input.email;
    this.logger.info('Executing ForgotPasswordUseCase', { email: rawEmail });

    const email = Email.create(rawEmail);
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      this.logger.warn('Forgot password requested for non-existent email', { email: rawEmail });
      throw new AuthenticationError(
        'If the email is valid, we will send the password reset link there',
      );
    }

    const rawResetPasswordToken = crypto.randomBytes(32).toString('hex');
    const hashedResetPasswordToken = this.tokenHasher.hash(rawResetPasswordToken);
    const resetPasswordTokenExpiry = new Date(
      Date.now() + env.RESET_PASSWORD_TOKEN_EXPIRY * 60 * 1000,
    );

    const resetPasswordEntity = ResetPasswordEntity.create({
      userId: user.getId(),
      tokenHash: hashedResetPasswordToken,
      expiresAt: resetPasswordTokenExpiry,
    });

    await this.passwordResetRepo.create(resetPasswordEntity);
    this.logger.debug('Reset password token created', {
      userId: user.getId(),
      resetPasswordId: resetPasswordEntity.getId(),
    });

    const frontendUrl = new URL(env.FRONTEND_URL);
    const resetPasswordUrl = new URL(
      `/reset-password/${rawResetPasswordToken}`,
      frontendUrl,
    ).toString();

    // Validate the URL format
    try {
      new URL(resetPasswordUrl);
    } catch (error) {
      this.logger.error('Failed to construct valid reset password URL', error, {
        frontendUrl: env.FRONTEND_URL,
        userId: user.getId(),
      });
      throw new InvalidUrlError('Invalid reset URL');
    }

    await this.emailJobQueue.enqueueResetPasswordEmail({
      userId: user.getId(),
      email: user.getEmail().getValue(),
      resetPasswordUrl,
    });
    this.logger.debug('Reset password email enqueued', { userId: user.getId() });

    this.logger.info('Forgot password flow completed successfully', { userId: user.getId() });
  }
}
