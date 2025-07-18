import { Body, Controller, Post } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Cron } from '@nestjs/schedule';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @ApiOperation({ summary: 'Обновление токена пользователя' })
  @ApiBody({ type: RefreshTokenDto })
  @Post('/refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.tokenService.refreshTokens(dto);
  }

  @Cron('0 0 * * *')
  handlerPrune() {
    this.tokenService.deleteTokens(7);
  }
}
