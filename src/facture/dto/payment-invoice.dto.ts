// src/facture/dto/payment-invoice.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountInfoDto } from './account-info.dto';
import { MParametreDto } from './mparametre.dto';

export class PaymentInvoiceDto {
  @ApiProperty() @IsString() @IsNotEmpty() countryCode: string;
  @ApiProperty() @IsString() @IsNotEmpty() phoneNumber: string;
  @ApiProperty() @IsString() @IsNotEmpty() pvCode: string;
  @ApiProperty() @IsNumber() @IsNotEmpty() amount: number;
  @ApiProperty() @IsString() @IsNotEmpty() billerCode: string;
  @ApiProperty() @IsString() @IsNotEmpty() productId: string;
  @ApiProperty() @IsString() @IsNotEmpty() channel: string;
  @ApiProperty() @IsString() serviceProviderCode?: string;
  @ApiProperty() @IsNumber() @IsNotEmpty() fees: number;
  @ApiProperty() @IsString() @IsNotEmpty() billReference: string;
  @ApiProperty() @IsString() @IsNotEmpty() serviceType: string;

  @ApiProperty({ type: () => [MParametreDto] })
  @ValidateNested({ each: true })
  @Type(() => MParametreDto)
  mparametre: MParametreDto[];

  @ApiProperty({ type: () => AccountInfoDto })
  @ValidateNested()
  @Type(() => AccountInfoDto)
  accountInfo: AccountInfoDto;

  @ApiProperty() @IsString() operatorCode: string;
}
