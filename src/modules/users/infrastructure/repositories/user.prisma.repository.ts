import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.karyawan.create({ data });
  }

  findById(id: string) {
    return this.prisma.karyawan.findUnique({
      where: { id },
      include: {
        role: true,
        tenant: true,
      },
    });
  }

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return this.prisma.karyawan.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        role: true,
      },
    });
  }

  countAll(tenantId: string) {
    return this.prisma.karyawan.count({
      where: {
        tenantId,
        deletedAt: null,
      },
    });
  }

  delete(id: string) {
    return this.prisma.karyawan.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  block(id: string, status: boolean) {
    return this.prisma.karyawan.update({
      where: { id },
      data: {
        isBlocked: status,
      },
    });
  }

  findByNip(nip: string, tenantId: string) {
    return this.prisma.karyawan.findFirst({
      where: {
        nip,
        tenantId,
        deletedAt: null,
      },
    });
  }
}