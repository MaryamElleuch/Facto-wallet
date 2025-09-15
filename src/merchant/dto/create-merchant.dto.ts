import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateMerchantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsString()
  @MinLength(3)
  clientId: string;

  @IsString()
  @MinLength(6)
  clientSecret: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean; // par défaut true (géré par l'entité)
}
