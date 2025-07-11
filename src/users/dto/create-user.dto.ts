import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from 'generated/prisma';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  name?: string;

  //@IsEnum(UserRole, { message: 'role must be ADMIN, MODERATOR or USER' })
  role: UserRole;
}
