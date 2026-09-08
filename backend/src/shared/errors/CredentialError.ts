import { AppError } from './AppError.js';

export class CredentialError extends AppError {
  constructor(message: string, code = 'INVALID_CREDENTIALS') {
    super(message, 401, code, true);
  }
}
