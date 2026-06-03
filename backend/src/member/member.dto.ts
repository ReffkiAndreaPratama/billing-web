import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  rfidTag?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class TopupDto {
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
