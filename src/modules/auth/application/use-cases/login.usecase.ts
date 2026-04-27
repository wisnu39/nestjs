import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../domain/repositories/auth.repository.js';
import { AuditService } from 'src/core/audit/audit.service.js';

@Injectable()
export class LoginUseCase {
  constructor(
    private repo: AuthRepository,
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  async execute(dto: {
    nip: string;
    password: string;
    tenantId: string;
  }) {
    // 1. cari karyawan
    const user = await this.repo.findKaryawan(
      dto.nip,
      dto.tenantId,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. cek status user
    if (!user.isActive || user.isBlocked || user.deletedAt) {
      throw new UnauthorizedException('User not allowed');
    }

    // 3. verifikasi password
    const isValid = await argon2.verify(
      user.password,
      dto.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. buat session
    const session = await this.repo.createSession(user.id);

    // 5. generate tokenId unik
    const tokenId = crypto.randomUUID();

    // 6. payload (PENTING)
    const payload = {
      sub: user.id,
      sessionId: session.id,
      roleId: user.roleId,
      tenantId: user.tenantId,
      tokenId,
    };

    // 7. generate token
    const accessToken = this.jwt.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '7d',
    });

    // 8. simpan refresh token (hashed)
    await this.repo.createRefreshToken({
      karyawanId: user.id,
      sessionId: session.id,
      tokenId,
      tokenHash: await argon2.hash(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 9. audit log
    await this.audit.log({
      karyawanId: user.id,
      action: 'LOGIN',
      entity: 'AUTH',
      metadata: {
        nip: user.nip,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}