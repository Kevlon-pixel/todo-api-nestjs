import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  data: string;

  @IsOptional()
  @IsBoolean()
  check?: string;
}
