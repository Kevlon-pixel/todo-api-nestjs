import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { todo } from 'node:test';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTodo(userId: number, dto) {
    console.log('GHbdt');
    try {
      return await this.prismaService.toDo.create({
        data: {
          data: dto.data,
          user: { connect: { id: userId } },
        },
        select: {
          id: true,
          data: true,
          check: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Не удалось создать запись');
    }
  }

  async updateTodo(userId: number, todoId: number, dto: UpdateTodoDto) {
    try {
      const check = await this.prismaService.toDo.findFirst({
        where: { id: todoId, userId },
      });
      if (!check) throw new NotFoundException('Задача не найдена');

      return await this.prismaService.toDo.update({
        where: { id: todoId },
        data: {
          data: dto.data,
          check: dto.check,
        },
        select: {
          id: true,
          data: true,
          check: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Не удалось обновить запись');
    }
  }

  async deleteTodo(todoId: number): Promise<void> {
    const check = await this.prismaService.toDo.findFirst({
      where: { id: todoId },
    });
    if (!check) throw new NotFoundException('Задача не найдена');
    try {
      await this.prismaService.toDo.delete({
        where: {
          id: todoId,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException('Ошибка сервера');
    }
  }
}
