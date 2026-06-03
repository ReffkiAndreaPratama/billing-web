import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class StartBillingDto {
  @IsString()
  unitId: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsString()
  packageId?: string;

  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsBoolean()
  isVip?: boolean;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
