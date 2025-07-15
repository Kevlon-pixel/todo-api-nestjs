import {
  BadRequestException,
  ConflictException,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { NotFoundError } from 'rxjs';
import { Prisma } from '@prisma/client';
import { UserRole } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      const salt = Number(process.env.SALT) || 10;
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const allowedRoles = ['ADMIN', 'MODERATOR', 'USER'] as const;
      type UserRole = (typeof allowedRoles)[number];

      if (!allowedRoles.includes(dto.role as UserRole)) {
        throw new BadRequestException('Недопустимая роль');
      }

      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto?.name,
          role: dto.role,
        },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (err) {
      if (err instanceof HttpException) throw err;

      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Данный пользователь уже существует');
      }

      console.error(`Ошибка пользователя  -> ${err} и код ошибки ${err.code}`);

      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
  }

  async getAll() {
    return this.prismaService.user.findMany({});
  }

  async getById(id: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      return user;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        'Не удалось получить данные пользователя',
      );
    }
  }

  async getByRole(role: UserRole) {
    try {
      const users = await this.prismaService.user.findMany({
        where: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!users) {
        throw new NotFoundException('Пользователи не найдены');
      }

      return users;
    } catch (err) {
      throw new InternalServerErrorException(
        'Не удалось получить данные пользователя',
      );
    }
  }

  async getByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      return user;
    } catch (err) {
      throw new InternalServerErrorException(
        'Не удалось получить данные пользователя',
      );
    }
  }
}
