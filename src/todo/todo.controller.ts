import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateTodoDto } from './dto/update-todo.dto';

@ApiBearerAuth('bearerAuth')
@ApiTags('Todo')
@Controller('todo')
@UseGuards(JwtGuard, RolesGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @ApiOperation({ summary: 'Создание задачи' })
  @Roles('USER')
  @Roles('USER')
  @Post('/create')
  async createTodo(@Req() req, @Body() dto: CreateTodoDto) {
    return this.todoService.createTodo(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Обновление задачи' })
  @Roles('USER')
  @Post('/update')
  async updateTodo(
    @Req() req,
    @Query('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todoService.updateTodo(req.user.sub, id, dto);
  }

  @ApiOperation({ summary: 'Удаление задачи' })
  @Roles('USER')
  @Post('/delete')
  async deleteTodo(@Param('id', ParseIntPipe) id: number) {
    return this.todoService.deleteTodo(id);
  }
}
