import { IsString } from 'class-validator';

export class HashDto {
  @IsString()
  data: string;
}
