import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParamDto {
  @IsString()
  parameterCode: string;

  @IsString()
  value: string;

  @IsNumber()
  display: number;
}

export class AccountInfoDto {
  @IsString()
  bankCode: string;

  @IsString()
  agencyCode: string;

  @IsString()
  accountNumber: string;

  @IsString()
  customerFirstName: string;

  @IsString()
  customerLastName: string;

  @IsString()
  idType: string;

  @IsString()
  idNumber: string;

  @IsString()
  countryCode: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  serviceProviderCode: string;

  @IsString()
  alias: string;

  @IsString()
  accountType: string;
}

export class BankToWalletDto {
  @IsString()
  countryCode: string;

  @IsString()
  msisdn: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  codePv: string;

  @IsString()
  amount: string;

  @IsString()
  billerCode: string;

  @IsString()
  productId: string;

  @IsString()
  channel: string;

  @IsString()
  serviceProviderCode: string;

  @IsString()
  serviceType: string;

  @IsString()
  fees: string;

  @IsString()
  billReference: string;

  @IsObject()
  accountInfo: AccountInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParamDto)
  parameters: ParamDto[];
}
