import { Role } from '../../domain/enums/index.js';

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: Role;
}
