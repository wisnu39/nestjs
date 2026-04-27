import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository.js';
import { AuditService } from 'src/core/audit/audit.service.js';

@Injectable()
export class LogoutUseCase {
  constructor(
    private repo: AuthRepository,
    private audit: AuditService,
  ) {}

  async execute(sessionId: string, karyawanId: string) {
    // 1. nonaktifkan session
    await this.repo.deactivateSession(sessionId);

    // 2. revoke semua refresh token dalam session
    await this.repo.revokeAllBySession(sessionId);

    // 3. audit log
    await this.audit.log({
      karyawanId,
      action: 'LOGOUT',
      entity: 'AUTH',
      metadata: {
        sessionId,
      },
    });

    return {
      message: 'Logout success',
    };
  }
}