// src/facture/dto/account-info.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccountInfoDto {
  @ApiProperty() @IsString() bankCode: string;
  @ApiProperty() @IsString() agencyCode: string;
  @ApiProperty() @IsString() accountNumber: string;
  @ApiProperty() @IsString() customerUsername: string;
  @ApiProperty() @IsString() idType: string;
  @ApiProperty() @IsString() idNumber: string;
  @ApiProperty() @IsString() countryCode: string;
  @ApiProperty() @IsString() phoneNumber: string;
  @ApiProperty() @IsString() serviceProviderCode: string;
  @ApiProperty() @IsOptional() alias?: string | null;
  @ApiProperty() @IsString() accountType: string;
}
