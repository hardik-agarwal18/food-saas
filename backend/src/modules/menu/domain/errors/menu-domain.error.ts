import { AppError } from '../../../../shared/errors/AppError.js';

export class MenuDomainError extends AppError {
  constructor(message: string) {
    super(message, 400, 'MENU_DOMAIN_ERROR');
  }
}
