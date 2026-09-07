import { AppError } from './AppError.js';

export class InvalidUrlError extends AppError {
  constructor(message: string) {
    super(message, 500, 'INVALID_URL', true);
  }
}
