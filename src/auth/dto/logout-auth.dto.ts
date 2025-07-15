import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export class LogoutAuthDto {
  @IsEmail()
  email: string;
}
