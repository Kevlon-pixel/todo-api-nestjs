import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('todo')
@UseGuards(JwtGuard, RolesGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  
  @Roles('USER')  
  @Post('/create')
  async createTodo(@Req() req, @Body() dto: CreateTodoDto) {
    return this.todoService.createTodo(req.user.sub, dto);
  }
  
  @Roles('USER')  
  @Post('/update')
  async updateTodo(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTodoDto,
  ) {
    return (this, this.todoService.updateTodo(req.user.sub, id, dto));
  }
}
