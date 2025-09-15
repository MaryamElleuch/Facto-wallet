import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class MParametreDto {
  @ApiProperty()
  @IsString()
  parameterCode: string;

  @ApiProperty()
  value: string | number;

  @ApiProperty()
  display: number;
}
