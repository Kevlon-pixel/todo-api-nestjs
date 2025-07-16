import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({
    example: 'Купить 2 молока',
    description: 'Редактирование задачи',
  })
  @IsString()
  @IsOptional()
  data: string;

  @ApiProperty({
    example: true,
    description: 'Отметка выполнения задачи',
  })
  @IsOptional()
  @IsBoolean()
  check: boolean;
}
