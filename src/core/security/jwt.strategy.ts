import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../database/prisma.service.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    /**
     * Payload expected:
     * {
     *   sub: karyawanId
     *   sessionId: string
     *   roleId: string
     *   tenantId: string
     * }
     */

    // 1. cek session
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session invalid');
    }

    // 2. pastikan session milik user
    if (session.karyawanId !== payload.sub) {
      throw new UnauthorizedException('Session mismatch');
    }

    // 3. cek karyawan masih aktif
    const user = await this.prisma.karyawan.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.deletedAt || !user.isActive || user.isBlocked) {
      throw new UnauthorizedException('User invalid');
    }

    // 4. return data untuk request
    return {
      sub: user.id,
      nip: user.nip,
      roleId: user.roleId,
      tenantId: user.tenantId,
      sessionId: session.id,
    };
  }
}