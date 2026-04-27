import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GlobalExceptionFilter } from './core/common/filters/global-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 Security basic
  app.use(helmet());

  // 🚫 Anti brute force login
  app.use(
    '/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
    }),
  );

  // ✅ Validation global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ⚠️ Global error handler
  app.useGlobalFilters(new GlobalExceptionFilter());

  console.log('database url', process.env.DATABASE_URL);

  await app.listen(3000);
}
bootstrap();