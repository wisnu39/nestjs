import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.js';

@Injectable()
export class ListUsersUseCase {
  constructor(private repo: UserRepository) {}

  async execute(
    requester,
    page = 1,
    limit = 10,
  ) {
    const data = await this.repo.findAll(
      requester.tenantId,
      page,
      limit,
    );

    const total = await this.repo.countAll(
      requester.tenantId,
    );

    // sanitize
    const clean = data.map((user) => ({
      id: user.id,
      nip: user.nip,

      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
          }
        : null,

      status: {
        isActive: user.isActive,
        isBlocked: user.isBlocked,
      },

      createdAt: user.createdAt,
    }));

    return {
      data: clean,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}