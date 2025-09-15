import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WalletToBankParamDto {
  @IsString()
  parameterCode: string;

  @IsString()
  value: string;
}

export class WalletToBankDto {
  @IsString()
  codePv: string;

  @IsString()
  serviceType: string; // WALLET_TO_BANK

  @IsObject()
  product: { id: number };

  @IsObject()
  biller: { id: number };

  @IsObject()
  sender: {
    holder: {
      countryCode: string;
      phoneNumber: string;
    };
  };

  @IsString()
  channel: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WalletToBankParamDto)
  parameters: WalletToBankParamDto[];
}
