// src/modules/wallets/dto/link-wallet.dto.ts
import {
  IsNotEmpty,
  IsArray,
  IsString,
  IsNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// Represents one parameter inside "parameters" list
export class ParamItem {
  @IsString()
  parameterCode: string; // ex: MSISDN, ACCOUNTNUMBER, ...

  @IsString()
  value: string;

  @IsNumber()
  display: number; // 0/1 (display flag)
}

// Represents request body for link-wallet
export class LinkWalletDto {
  @IsNotEmpty()
  @IsObject()
  product: { id: number };

  @IsNotEmpty()
  @IsObject()
  biller: { id: number };

  @IsObject()
  sender?: {
    holder: {
      countryCode: string;
      phoneNumber: string;
    };
  };

  @IsString()
  channel: string; // ex: MOBILE, WEB, POS

  @IsString()
  codePv: string;

  @IsString()
  serviceType: string; // ex: LINK

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParamItem)
  parameters: ParamItem[];
}
