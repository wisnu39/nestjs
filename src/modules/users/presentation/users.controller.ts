import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/core/security/jwt-auth.guard.js';
import { RbacGuard } from 'src/core/security/rbac.guard.js';
import { Permissions } from 'src/core/security/permissions.decorator.js';

import { CreateUserUseCase } from '../application/use-cases/create-user.usecase.js';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.usecase.js';
import { BlockUserUseCase } from '../application/use-cases/block-user.usecase.js';
import { ListUsersUseCase } from '../application/use-cases/list-users.usecase.js';
import { GetUserUseCase } from '../application/use-cases/get-user.usecase.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RbacGuard)
export class UsersController {
  constructor(
    private createUC: CreateUserUseCase,
    private deleteUC: DeleteUserUseCase,
    private blockUC: BlockUserUseCase,
    private listUC: ListUsersUseCase,
    private getUC: GetUserUseCase,
  ) {}

  // ================= CREATE USER =================
  @Post()
  @Permissions('USER_MANAGE')
  async create(@Body() dto: any, @Req() req) {
    return this.createUC.execute(dto, req.user);
  }

  // ================= LIST USERS =================
  @Get()
  @Permissions('USER_VIEW')
  async list(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.listUC.execute(req.user, page, limit);
  }

  // ================= GET USER =================
  @Get(':id')
  @Permissions('USER_VIEW')
  async get(@Param('id') id: string, @Req() req) {
    return this.getUC.execute(id, req.user);
  }

  // ================= DELETE USER =================
  @Delete(':id')
  @Permissions('USER_MANAGE')
  async delete(@Param('id') id: string, @Req() req) {
    return this.deleteUC.execute(id, req.user);
  }

  // ================= BLOCK / UNBLOCK =================
  @Patch(':id/block')
  @Permissions('USER_MANAGE')
  async block(
    @Param('id') id: string,
    @Body('status') status: boolean,
    @Req() req,
  ) {
    return this.blockUC.execute(id, status, req.user);
  }
}