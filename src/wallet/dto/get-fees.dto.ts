// import {
//   IsNotEmpty,
//   IsString,
//   IsObject,
//   ValidateNested,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// export class AccountInfoDto {
//   @IsString()
//   @IsNotEmpty()
//   bankCode: string;

//   @IsString()
//   @IsNotEmpty()
//   agencyCode: string;

//   @IsString()
//   @IsNotEmpty()
//   accountNumber: string;

//   @IsString()
//   @IsNotEmpty()
//   customerFirstName: string;

//   @IsString()
//   @IsNotEmpty()
//   customerLastName: string;

//   @IsString()
//   @IsNotEmpty()
//   idType: string;

//   @IsString()
//   @IsNotEmpty()
//   idNumber: string;

//   @IsString()
//   @IsNotEmpty()
//   countryCode: string;

//   @IsString()
//   @IsNotEmpty()
//   phoneNumber: string;

//   @IsString()
//   @IsNotEmpty()
//   serviceProviderCode: string;

//   @IsString()
//   @IsNotEmpty()
//   alias: string;

//   @IsString()
//   @IsNotEmpty()
//   accountType: string;
// }

// export class GetFeesDto {
//   @IsObject()
//   @ValidateNested()
//   @Type(() => AccountInfoDto)
//   @IsNotEmpty()
//   accountInfo: AccountInfoDto;

//   @IsString()
//   @IsNotEmpty()
//   billerCode: string;

//   @IsString()
//   @IsNotEmpty()
//   operatorCode: string;

//   @IsString()
//   @IsNotEmpty()
//   channel: string;

//   @IsString()
//   @IsNotEmpty()
//   codePv: string;

//   @IsString()
//   @IsNotEmpty()
//   serviceType: string;

//   @IsString()
//   @IsNotEmpty()
//   amount: string;

//   @IsString()
//   @IsNotEmpty()
//   codeUoSrc: string;
// }
