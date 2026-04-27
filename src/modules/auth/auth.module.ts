import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './presentation/auth.controller.js';

import { LoginUseCase } from './application/use-cases/login.usecase.js';
import { RefreshUseCase } from './application/use-cases/refresh.usecase.js';
import { LogoutUseCase } from './application/use-cases/logout.usecase.js';
import { GetMeUseCase } from './application/use-cases/get-me.usecase.js';

import { AuthRepository } from './domain/repositories/auth.repository.js';
import { AuthPrismaRepository } from './infrastructure/repositories/auth.prisma.repository.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshUseCase,
    LogoutUseCase,
    GetMeUseCase,
    {
      provide: AuthRepository,
      useClass: AuthPrismaRepository,
    },
  ],
})
export class AuthModule {}