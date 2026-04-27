import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../cache/redis.service.js';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    if (required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const cacheKey = `perm:${user.sub}`;

    let permissions: string[] = [];
    const cachedPermissions = await this.redis.get(cacheKey);

    if (!cachedPermissions) {
      const role = await this.prisma.role.findUnique({
        where: { id: user.roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (role && role.permissions) {
        permissions = role.permissions.map((p) => p.permission.name);
        await this.redis.set(cacheKey, JSON.stringify(permissions), 300);
      }
    } else {
      permissions = JSON.parse(cachedPermissions);
    }

    return required.every((p) => permissions.includes(p));
  }
}