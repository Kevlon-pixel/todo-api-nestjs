import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({
    example: 'Купить молоко',
    description: 'Задача для выполнения',
  })
  @IsString()
  @IsNotEmpty()
  data: string;
}
