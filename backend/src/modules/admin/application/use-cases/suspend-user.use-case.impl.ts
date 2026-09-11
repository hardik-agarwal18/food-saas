import { inject, injectable } from 'tsyringe';
import { ISuspendUserUseCase } from './suspend-user.use-case.js';
import type { IUserRepository } from '../../../../modules/identity/domain/repositories/user.repository.js';
import { IdentityTokens } from '../../../../modules/identity/infrastructure/persistence/tokens/identity.tokens.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';

@injectable()
export class SuspendUserUseCaseImpl implements ISuspendUserUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    user.suspend();
    await this.userRepository.update(user);
  }
}
