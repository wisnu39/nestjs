import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service.js';
import { AuthRepository } from '../../domain/repositories/auth.repository.js';

@Injectable()
export class AuthPrismaRepository implements AuthRepository {
  constructor(private prisma: PrismaService) {}

  // ===== KARYAWAN =====
  findKaryawan(nip: string, tenantId: string) {
    return this.prisma.karyawan.findFirst({
      where: {
        nip,
        tenantId,
        deletedAt: null,
      },
    });
  }

  // ===== SESSION =====
  createSession(karyawanId: string) {
    return this.prisma.session.create({
      data: {
        karyawanId,
      },
    });
  }

  deactivateSession(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
      },
    });
  }

  // ===== REFRESH TOKEN =====
  createRefreshToken(data: {
    karyawanId: string;
    sessionId: string;
    tokenId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({
      data,
    });
  }

  findRefreshToken(tokenId: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenId },
    });
  }

  findKaryawanById(karyawanId: string) {
    return this.prisma.karyawan.findUnique({
      where: { id: karyawanId },
    });
  }

  findSession(sessionId: string) {
    return this.prisma.session.findUnique({
      where: { id: sessionId },
    });
  }

  deactivateAllSessions(karyawanId: string) {
    return this.prisma.session.updateMany({
      where: { karyawanId },
      data: {
        isActive: false,
      },
    });
  }

  revokeRefreshToken(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: {
        isRevoked: true,
      },
    });
  }

  revokeAllBySession(sessionId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { sessionId },
      data: {
        isRevoked: true,
      },
    });
  }

  revokeAllByUser(karyawanId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { karyawanId },
      data: {
        isRevoked: true,
      },
    });
  }
}