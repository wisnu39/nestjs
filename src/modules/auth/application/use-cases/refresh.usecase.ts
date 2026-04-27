import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../domain/repositories/auth.repository.js';
import { AuditService } from 'src/core/audit/audit.service.js';

@Injectable()
export class RefreshUseCase {
  constructor(
    private repo: AuthRepository,
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  async execute(refreshToken: string) {
    let payload: any;

    // 1. verify JWT
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    // 2. ambil token dari DB
    const stored = await this.repo.findRefreshToken(payload.tokenId);

    // 🚨 DETEKSI TOKEN REUSE / INVALID
    if (!stored || stored.isRevoked) {
      await this.repo.deactivateSession(payload.sessionId);

      await this.audit.log({
        karyawanId: payload.sub,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        entity: 'AUTH',
        metadata: {
          sessionId: payload.sessionId,
        },
      });

      throw new UnauthorizedException('Token reuse detected');
    }

    // 3. cek expired (extra safety)
    if (stored.expiresAt < new Date()) {
      await this.repo.deactivateSession(payload.sessionId);

      throw new UnauthorizedException('Token expired');
    }

    // 4. verifikasi hash token
    const isValid = await argon2.verify(
      stored.tokenHash,
      refreshToken,
    );

    if (!isValid) {
      await this.repo.deactivateSession(payload.sessionId);

      throw new UnauthorizedException('Token tampered');
    }

    // 5. revoke token lama (rotation)
    await this.repo.revokeRefreshToken(stored.id);

    // 6. buat token baru
    const newTokenId = crypto.randomUUID();

    const newPayload = {
      sub: payload.sub,
      sessionId: payload.sessionId,
      roleId: payload.roleId,
      tenantId: payload.tenantId,
      tokenId: newTokenId,
    };

    const newAccessToken = this.jwt.sign(newPayload, {
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwt.sign(newPayload, {
      expiresIn: '7d',
    });

    // 7. simpan token baru
    await this.repo.createRefreshToken({
      karyawanId: payload.sub,
      sessionId: payload.sessionId,
      tokenId: newTokenId,
      tokenHash: await argon2.hash(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 8. audit log
    await this.audit.log({
      karyawanId: payload.sub,
      action: 'REFRESH_TOKEN',
      entity: 'AUTH',
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}