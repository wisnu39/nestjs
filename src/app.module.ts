import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisService } from './core/cache/redis.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  providers: [PrismaModule, RedisService],
  exports: [PrismaModule, RedisService],
})
export class AppModule {}