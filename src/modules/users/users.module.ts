import { Module } from '@nestjs/common';
import { UsersController } from './presentation/users.controller.js';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase.js';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase.js';
import { BlockUserUseCase } from './application/use-cases/block-user.usecase.js';
import { ListUsersUseCase } from './application/use-cases/list-users.usecase.js';
import { GetUserUseCase } from './application/use-cases/get-user.usecase.js';
import { UserRepository } from './domain/repositories/user.repository.js';
import { UserPrismaRepository } from './infrastructure/repositories/user.prisma.repository.js';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    DeleteUserUseCase,
    BlockUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,

    {
      provide: UserRepository,
      useClass: UserPrismaRepository,
    },
  ],
})
export class UsersModule {}