import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from 'generated/prisma';

export class CreateUserDto {
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

  @ApiProperty({
    example: 'vlad',
    description: 'Имя пользователя, необязательно',
  })
  name?: string;

  @ApiProperty({ example: 'USER', description: 'Роль на сайте' })
  @IsEnum(UserRole, { message: 'Роль должна ADMIN, MODERATOR или USER' })
  role: UserRole;
}
