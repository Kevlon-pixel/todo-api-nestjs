import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'mail@mail.com', description: 'Почта пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strongpassword',
    description: 'Пароль опльзователя, не меньше 6 символов',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
