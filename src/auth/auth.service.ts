import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TokenService } from 'src/token/token.service';
import { LogoutAuthDto } from './dto/logout-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: CreateAuthDto) {
    try {
      const user = await this.userService.create(dto);

      const jti = randomUUID();

      const accessToken = this.jwtService.sign(
        { sub: user.id, role: user.role },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
      );

      const refreshToken = this.jwtService.sign(
        { sub: user.id, role: user.role, jti },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      const salt = Number(process.env.SALT);
      await this.tokenService.saveRefreshToken(
        user.id,
        jti,
        await bcrypt.hash(refreshToken, salt),
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        token: {
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new InternalServerErrorException(
        'Не удалось получить данные пользователя',
      );
    }
  }

  async login(dto: LoginAuthDto) {
    try {
      const user = await this.userService.getByEmail(dto.email);
      if (!user) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      const check = await bcrypt.compare(dto.password, user.password);
      if (!check) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      const jti = randomUUID();

      const accessToken = this.jwtService.sign(
        { sub: user.id, role: user.role },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
      );

      const refreshToken = this.jwtService.sign(
        { sub: user.id, role: user.role, jti },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      const salt = Number(process.env.SALT);
      await this.tokenService.saveRefreshToken(
        user.id,
        jti,
        await bcrypt.hash(refreshToken, salt),
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        token: {
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new InternalServerErrorException(
        'Не удалось получить данные пользователя',
      );
    }
  }

  async logout(userId: number, token: string): Promise<void> {
    try {
      const paylaod = (await this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
        ignoreExpiration: true,
      })) as { jti: string };

      if (!paylaod) {
        throw new UnauthorizedException('Некорректный refresh токен');
      }

      const record = await this.prismaService.refreshToken.findUnique({
        where: {
          id: paylaod.jti,
        },
      });
      if (!record || record.userId !== userId) {
        throw new NotFoundException('Токен не найден');
      }

      const same = await bcrypt.compare(token, record.hash);
      if (!same) {
        throw new UnauthorizedException('Некорректный refresh токен');
      }

      await this.tokenService.revokeRefreshToken(paylaod.jti);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new UnauthorizedException('Не удалось разлогиниться');
    }
  }
}
