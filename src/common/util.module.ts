import { Module } from '@nestjs/common';
import { HashController } from './hash.controller';

@Module({
  controllers: [HashController],
})
export class UtilsModule {}
