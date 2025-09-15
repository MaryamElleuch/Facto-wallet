import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountInfoDto } from './account-info.dto';

export class GetFeesDto {
  @ApiProperty({ type: () => AccountInfoDto })
  @ValidateNested()
  @Type(() => AccountInfoDto)
  accountInfo: AccountInfoDto;

  @ApiProperty() @IsString() billerCode: string; // ancien codeFacturier
  @ApiProperty() @IsString() sourceUoCode: string; // ancien codeUoSrc
  @ApiProperty() @IsString() operatorCode: string; // ancien codeOperateur
  @ApiProperty() @IsString() channel: string;
  @ApiProperty() @IsString() pvCode: string;
  @ApiProperty() @IsString() serviceType: string;
  @ApiProperty() @IsNumber() amount: number;
}
