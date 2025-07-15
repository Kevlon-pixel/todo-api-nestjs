import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from 'generated/prisma';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  name?: string;

  @IsEnum(UserRole, { message: 'Роль должна ADMIN, MODERATOR или USER' })
  role: UserRole;
}
