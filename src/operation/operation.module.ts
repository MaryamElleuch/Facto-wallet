// src/operation/operation.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operation } from './operation.entity';
import { OperationService } from './operation.service';
import { OperationController } from './operation.controller';
import { Wallet } from 'src/wallet/wallet.entity';
import { Account } from 'src/accounts/account.entity';
import { Facture } from 'src/facture/facture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Operation, Wallet, Account, Facture])],
  providers: [OperationService],
  controllers: [OperationController],
  exports: [OperationService], // utile si tu veux l’utiliser ailleurs
})
export class OperationModule {}
