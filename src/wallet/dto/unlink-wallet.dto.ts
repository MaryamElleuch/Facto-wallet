import {
  IsNotEmpty,
  IsObject,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UnlinkParam {
  @IsString()
  @IsNotEmpty()
  parameterCode: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class UnlinkWalletDto {
  @IsString()
  serviceType: string; // "UNLINK"

  @IsObject()
  product: { id: number };

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
  codePv: string;

  @IsString()
  channel: string; // MOBILE, WEB, ...

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnlinkParam)
  listParam: UnlinkParam[];
}
