import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    karyawanId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: any;
  }) {
    await this.prisma.auditLog.create({
      data,
    });
  }
}