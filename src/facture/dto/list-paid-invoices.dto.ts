// src/facture/dto/list-paid-invoices.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ListPaidInvoicesDto {
  @ApiProperty({ description: 'Country code' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'Biller code' })
  @IsString()
  @IsNotEmpty()
  billerCode: string;

  @ApiProperty({ description: 'Number of items per page' })
  @IsString()
  @IsNotEmpty()
  pageSize: string;

  @ApiProperty({ description: 'Page number' })
  @IsString()
  @IsNotEmpty()
  pageNumber: string;
}
