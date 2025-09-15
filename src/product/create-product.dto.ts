import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Pay Electricity Bill' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  ordreNumber: number;

  @ApiProperty({ example: 100.5, required: false })
  @IsOptional()
  @IsNumber()
  fixedAmount?: number | null;
}
