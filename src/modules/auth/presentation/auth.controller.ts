import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { LoginUseCase } from '../application/use-cases/login.usecase.js';
import { RefreshUseCase } from '../application/use-cases/refresh.usecase.js';
import { LogoutUseCase } from '../application/use-cases/logout.usecase.js';
import { GetMeUseCase } from '../application/use-cases/get-me.usecase.js';

import { JwtAuthGuard } from 'src/core/security/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private loginUC: LoginUseCase,
    private refreshUC: RefreshUseCase,
    private logoutUC: LogoutUseCase,
    private meUC: GetMeUseCase,
  ) {}

  // ================= LOGIN =================
  @Post('login')
  async login(@Body() dto: any) {
    return this.loginUC.execute(dto);
  }

  // ================= REFRESH =================
  @Post('refresh')
  async refresh(@Body('refreshToken') token: string) {
    return this.refreshUC.execute(token);
  }

  // ================= LOGOUT =================
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.logoutUC.execute(
      req.user.sessionId,
      req.user.sub,
    );
  }

  // ================= GET ME =================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    return this.meUC.execute(req.user);
  }
}