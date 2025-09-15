import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { sha256Hex } from './utils/hash.util';
import { HashDto } from './dto/hash.dto';

@Controller('utils')
export class HashController {
  @Post('hash')
  computeHash(@Body() dto: HashDto) {
    if (!dto.data) {
      throw new BadRequestException('Le champ "data" est obligatoire');
    }
    return { hash: sha256Hex(dto.data) };
  }
}
