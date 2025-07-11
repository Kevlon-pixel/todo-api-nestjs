import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'generated/prisma';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('/getById/:id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getById(id);
  }

  @Get('/getByRole/:role')
  async getByRole(
    @Param(
      'role',
      new ParseEnumPipe(UserRole, {
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      }),
    )
    role: UserRole,
  ) {
    return this.usersService.getByRole(role);
  }
}
