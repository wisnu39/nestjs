import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  nip: string;

  @IsString()
  password: string;

  @IsString()
  tenantId: string;
}