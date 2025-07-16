import { UserRole } from 'generated/prisma';

export class UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
}
