import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TokenService } from 'src/token/token.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: CreateUserDto) {
    try {
      const user = await this.userService.create(dto);

      const jti = randomUUID();

      const accessToken = this.jwtService.sign(
        { sub: user.id, role: user.role },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_TTL,
        },
      );

      const refreshToken = this.jwtService.sign(
        { sub: user.id, role: user.role, jti },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_TTL,
        },
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
}
