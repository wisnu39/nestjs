import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.js';

@Injectable()
export class GetUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(
    userId: string,
    requester: {
      sub: string;
      tenantId: string;
      roleId: string;
    },
  ) {
    // 1. ambil user
    const user = await this.repo.findById(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // 2. tenant isolation (PENTING)
    if (user.tenantId !== requester.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    // 3. sanitize data
    const result = {
      id: user.id,
      nip: user.nip,

      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
          }
        : null,

      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
          }
        : null,

      status: {
        isActive: user.isActive,
        isBlocked: user.isBlocked,
      },

      createdAt: user.createdAt,
    };

    return result;
  }
}