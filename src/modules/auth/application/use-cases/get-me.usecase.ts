import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service.js';

@Injectable()
export class GetMeUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(userPayload: any) {
    if (!userPayload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 1. ambil karyawan lengkap dari DB
    const karyawan = await this.prisma.karyawan.findUnique({
      where: {
        id: userPayload.sub,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        tenant: true,
      },
    });

    // 2. validasi user
    if (
      !karyawan ||
      karyawan.deletedAt ||
      !karyawan.isActive ||
      karyawan.isBlocked
    ) {
      throw new UnauthorizedException('User not allowed');
    }

    // 3. transform permissions (flat array)
    const permissions =
      karyawan.role?.permissions?.map(
        (p) => p.permission.name,
      ) || [];

    // 4. response clean untuk frontend
    return {
      id: karyawan.id,
      nip: karyawan.nip,

      tenant: {
        id: karyawan.tenant.id,
        name: karyawan.tenant.name,
      },

      role: {
        id: karyawan.role.id,
        name: karyawan.role.name,
      },

      permissions,

      status: {
        isActive: karyawan.isActive,
        isBlocked: karyawan.isBlocked,
      },
    };
  }
}