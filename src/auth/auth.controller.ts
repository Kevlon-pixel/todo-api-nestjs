import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpCode,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { TokenService } from 'src/token/token.service';
import { RefreshTokenDto } from 'src/token/dto/refresh-token.dto';
import { JwtGuard } from './jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: CreateUserDto })
  @Post('/register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiBody({ type: LoginAuthDto })
  @Post('/login')
  async login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth('bearerAuth')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Разлогирование пользователя' })
  @ApiBody({ type: RefreshTokenDto })
  @Delete('/logout')
  async loguot(@Req() req, @Body() dto: RefreshTokenDto) {
    if (!req.user) throw new UnauthorizedException('Ошибка');
    await this.tokenService.revokeToken(req.user.sub, dto);
    return { success: true };
  }
}
