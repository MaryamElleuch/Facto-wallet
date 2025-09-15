// src/modules/wallets/dto/info-wallet.dto.ts
import {
  IsNotEmpty,
  IsArray,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Represents one parameter inside "parameters" list
export class InfoParamItem {
  @IsString()
  parameterCode: string; // ex: MSISDN, ACCOUNTNUMBER, IDENTITYNO...

  @IsString()
  value: string;

  @IsNumber()
  display?: number; // 0/1 (flag if parameter is shown in recap)
}

// Represents request body for info-wallet
export class InfoWalletDto {
  @IsNotEmpty()
  productId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfoParamItem)
  parameters: InfoParamItem[];
}
