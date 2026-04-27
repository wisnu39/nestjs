import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { AuthRepository } from 'src/modules/auth/domain/repositories/auth.repository.js';
import { AuditService } from 'src/core/audit/audit.service.js';
import { RedisService } from 'src/core/cache/redis.service.js';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private repo: UserRepository,
    private authRepo: AuthRepository,
    private audit: AuditService,
    private redis: RedisService,
  ) {}

  async execute(id: string, requester) {
    const user = await this.repo.findById(id);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // 🔐 tenant isolation
    if (user.tenantId !== requester.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    // 🗑️ soft delete
    await this.repo.delete(id);

    // 🔐 kill semua session
    await this.authRepo.deactivateAllSessions(id);
    await this.authRepo.revokeAllByUser(id);

    // ⚡ invalidate cache
    await this.redis.del(`perm:${id}`);

    // 🧾 audit
    await this.audit.log({
      karyawanId: requester.sub,
      action: 'DELETE_KARYAWAN',
      entity: 'KARYAWAN',
      entityId: id,
    });

    return {
      message: 'User deleted',
    };
  }
}