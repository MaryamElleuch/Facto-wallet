import { Type } from 'class-transformer';
import { ValidateNested, IsInt, ArrayNotEmpty } from 'class-validator';
import { MParametreDto } from './mparametre.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ListFacturesDto {
  @ApiProperty({
    description: 'Identifiant du produit',
    example: 40,
  })
  @IsInt()
  idProduit: number;

  @ApiProperty({
    description: 'Liste des paramètres dynamiques',
    type: [MParametreDto],
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MParametreDto)
  mparametre: MParametreDto[];
}
