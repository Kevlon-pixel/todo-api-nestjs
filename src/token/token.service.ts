import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { RefreshToken } from '@prisma/client';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async saveRefreshToken(
    userId: number,
    jti: string,
    hash: string,
  ): Promise<void> {
    await this.prismaService.refreshToken.create({
      data: {
        id: jti,
        userId: userId,
        hash: hash,
      },
    });
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const payload = this.jwtService.verify(dto.refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
      ignoreExpiration: true,
    }) as { sub: number; role: string; jti: string };

    const record = await this.prismaService.refreshToken.findUnique({
      where: { id: payload.jti },
    });
    if (!record || record.revoked)
      throw new UnauthorizedException('Ошибка аутентификации');

    const same = await bcrypt.compare(dto.refreshToken, record.hash);
    if (!same) throw new UnauthorizedException('Ошибка аутентификации');

    await this.prismaService.refreshToken.update({
      where: { id: payload.jti },
      data: { revoked: false },
    });

    return this.issueTokens(payload.sub, payload.role);
  }

  private async issueTokens(userId: number, role: string) {
    const jti = randomUUID();

    const accessToken = this.jwtService.sign(
      { sub: userId, role },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sun: userId, role, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL,
      },
    );

    await this.prismaService.refreshToken.create({
      data: {
        id: jti,
        userId: userId,
        hash: await bcrypt.hash(refreshToken, Number(process.env.SALT || 10)),
      },
    });

    return { accessToken, refreshToken };
  }

  async revokeToken(userId: number, dto: RefreshTokenDto): Promise<void> {
    const { jti } = this.jwtService.verify(dto.refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
      ignoreExpiration: true,
    }) as { jti: string };

    const token = await this.prismaService.refreshToken.findUnique({
      where: { id: jti },
    });
    if (!token) throw new NotFoundException('Токен не найден');
    if (token.userId !== userId)
      throw new ForbiddenException('Отказано в доступе');

    await this.prismaService.refreshToken.update({
      where: { id: jti },
      data: { revoked: true },
    });
  }

  async deleteTokens(days = 7): Promise<number> {
    const { count } = await this.prismaService.refreshToken.deleteMany({
      where: {
        OR: [
          { revoked: true },
          { createdAt: { lt: new Date(Date.now() - days * 86_400_000) } },
        ],
      },
    });

    return count;
  }
}
