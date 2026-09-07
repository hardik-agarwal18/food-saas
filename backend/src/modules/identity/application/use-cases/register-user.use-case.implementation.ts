import { injectable, inject } from 'tsyringe';
import { RegisterUserUseCase } from './register-user.use-case.js';
import { RegisterUserInput } from '../dto/register-user.dto.js';
import { RegisterUserResult } from '../dto/register-user-result.dto.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { EmailAlreadyRegisteredError } from '../../domain/errors/email-already-register.error.js';
import { InvalidUrlError } from '../../../../shared/errors/InvalidUrlError.js';
import { IdentityTokens } from '../../infrastructure/persistence/tokens/identity.tokens.js';
import { User } from '../../domain/entities/user.entity.js';
import type { IPasswordHasher } from '../../domain/services/password-hasher.js';
import type { IJwtService } from '../../domain/services/jwt.service.js';
import { TokenType } from '../../domain/enums/token-type.enum.js';
import { env } from '../../../../config/env.config.js';
import type { ITokenHasher } from '../../domain/services/token-hasher.js';
import { RefreshSession } from '../../domain/entities/refresh-session.entity.js';
import type { IIdentityTransaction } from '../transaction/identity.transaction.js';
import crypto from 'node:crypto';
import { VerifyEmail } from '../../domain/entities/verify-email.entity.js';
import type { IVerifyEmailRepository } from '../../domain/repositories/verify-email.repository.js';
import type { IEmailJobQueue } from '../services/email-job-queue.js';
import { CustomerTokens } from '../../../customer/infrastructure/persistence/tokens/customer.tokens.js';
import type { CustomerProfileCreationUseCase } from '../../../customer/application/use-cases/customer-profile-creation.use-case.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class RegisterUserUseCaseImplementation implements RegisterUserUseCase {
  constructor(
    @inject(IdentityTokens.VerifyEmailRepository)
    private readonly verifyEmailRepo: IVerifyEmailRepository,

    @inject(IdentityTokens.PasswordHasher)
    private readonly passwordHasher: IPasswordHasher,

    @inject(IdentityTokens.JwtService)
    private readonly jwtService: IJwtService,

    @inject(IdentityTokens.TokenHasher)
    private readonly tokenHasher: ITokenHasher,

    @inject(IdentityTokens.Transaction)
    private readonly transaction: IIdentityTransaction,

    @inject(IdentityTokens.EmailJobQueue)
    private readonly emailJobQueue: IEmailJobQueue,

    @inject(CustomerTokens.CustomerProfileCreationUseCase)
    private readonly customerProfileCreationUseCase: CustomerProfileCreationUseCase,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
    const rawEmail = input.email;

    this.logger.info('Executing RegisterUserUseCase', { email: rawEmail });

    const email = Email.create(rawEmail);

    const passwordHash = await this.passwordHasher.hashPassword(input.password);

    const user = User.create({
      email,
      passwordHash,
    });

    const accessTokenIssuedAt = Math.floor(Date.now() / 1000);
    const accessTokenExpirationTime = accessTokenIssuedAt + env.JWT_ACCESS_EXPIRES_IN;

    const accessToken = await this.jwtService.signAccessToken({
      sub: user.getId(),
      roles: user.getRoles(),
      type: TokenType.ACCESS,
      iat: accessTokenIssuedAt,
      exp: accessTokenExpirationTime,
      iss: env.JWT_ISSUER,
      aud: env.JWT_AUDIENCE,
    });

    const refreshTokenIssuedAt = Math.floor(Date.now() / 1000);
    const refreshTokenExpirationTime = refreshTokenIssuedAt + env.JWT_REFRESH_EXPIRES_IN;

    const refreshToken = await this.jwtService.signRefreshToken({
      sub: user.getId(),
      roles: user.getRoles(),
      type: TokenType.REFRESH,
      iat: refreshTokenIssuedAt,
      exp: refreshTokenExpirationTime,
      iss: env.JWT_ISSUER,
      aud: env.JWT_AUDIENCE,
    });

    const hashedRrefreshToken = this.tokenHasher.hash(refreshToken);

    const refreshSessionExpiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN * 1000);

    let newUser;

    try {
      newUser = await this.transaction.execute(
        async ({ userRepository, refreshSessionRepository, customerRepository }) => {
          const existingUser = await userRepository.existsByEmail(email);

          if (existingUser) {
            this.logger.warn('User registration failed: Email already registered', {
              email: rawEmail,
            });
            throw new EmailAlreadyRegisteredError();
          }

          const createdUser = await userRepository.create(user);

          const refreshSession = RefreshSession.create(
            {
              userId: createdUser.getId(),
              familyId: crypto.randomUUID(),
              tokenHash: hashedRrefreshToken,
              expiresAt: refreshSessionExpiresAt,
              ipAddress: null,
              userAgent: null,
            },
            crypto.randomUUID(),
          );

          await refreshSessionRepository.create(refreshSession);

          const customerEntity = await this.customerProfileCreationUseCase.execute({
            userId: createdUser.getId(),
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
          });

          await customerRepository.create(customerEntity);

          return createdUser;
        },
      );
    } catch (error) {
      this.logger.error('User registration transaction failed', error, { email: rawEmail });
      throw error;
    }

    this.logger.info('User and customer profile registered successfully', {
      userId: newUser.getId(),
    });

    const rawEmailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenHash = this.tokenHasher.hash(rawEmailVerificationToken);
    const verifyEmailTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const verifyEmail = VerifyEmail.create({
      userId: newUser.getId(),
      tokenHash: emailVerificationTokenHash,
      expiresAt: verifyEmailTokenExpiresAt,
    });

    await this.verifyEmailRepo.create(verifyEmail);

    const baseUrl = env.EMAIL_VERIFICATION_URL.endsWith('/')
      ? env.EMAIL_VERIFICATION_URL
      : `${env.EMAIL_VERIFICATION_URL}/`;
    const verificationUrl = new URL(rawEmailVerificationToken, baseUrl).toString();

    // Validate the URL format
    try {
      new URL(verificationUrl);
    } catch (error) {
      this.logger.error('Failed to construct valid verification URL', error, {
        emailVerificationUrl: env.EMAIL_VERIFICATION_URL,
        userId: newUser.getId(),
      });
      throw new InvalidUrlError('Invalid verification URL');
    }

    await this.emailJobQueue.enqueueVerificationEmail({
      userId: newUser.getId(),
      email: newUser.getEmail().getValue(),
      verificationUrl,
    });

    this.logger.debug('Verification email enqueued', { userId: newUser.getId() });

    return {
      user: {
        id: newUser.getId(),
        email: newUser.getEmail().getValue(),
        roles: newUser.getRoles(),
        status: newUser.getStatus(),
        emailVerified: newUser.isEmailVerified(),
      },
      accessToken,
      refreshToken,
    };
  }
}
