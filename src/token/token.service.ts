import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(private readonly prismaService: PrismaService) {}

  
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

  async revokeRefreshToken(jti: string): Promise<void> {
    const token = await this.prismaService.refreshToken.updateMany({
      where: { id: jti },
      data: {
        revoked: true,
      },
    });
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    const token = await this.prismaService.refreshToken.deleteMany({
      where: { userId: userId },
    });
  }
}
