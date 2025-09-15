import { IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  clientId?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  clientSecret?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
