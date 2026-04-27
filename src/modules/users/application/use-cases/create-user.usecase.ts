import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { PrismaService } from 'src/core/database/prisma.service.js';
import { AuditService } from 'src/core/audit/audit.service.js';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private repo: UserRepository,
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async execute(dto, requester) {
    // 🔐 tenant isolation
    if (dto.tenantId !== requester.tenantId) {
      throw new ForbiddenException('Invalid tenant');
    }

    // 1. cek nip unik
    const existing = await this.repo.findByNip(
      dto.nip,
      dto.tenantId,
    );

    if (existing) {
      throw new BadRequestException('NIP already exists');
    }

    // 2. validasi role
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new BadRequestException('Invalid role');
    } 
    if (role.tenantId !== dto.tenantId) {
      throw new ForbiddenException('Role does not belong to tenant');
    }
    
    // 3. hash password
    const hashedPassword = await argon2.hash(dto.password);

    // 4. create
    const user = await this.repo.create({
      ...dto,
      password: hashedPassword,
    });

    // 5. audit
    await this.audit.log({
      karyawanId: requester.sub,
      action: 'CREATE_KARYAWAN',
      entity: 'KARYAWAN',
      entityId: user.id,
      metadata: {
        nip: dto.nip,
        roleId: dto.roleId,
      },
    });

    // 6. sanitize
    delete user.password;

    return user;
  }
}