import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactureController } from './facture.controller';
import { FactureService } from './facture.service';
import { Facture } from './facture.entity';
import { Product } from 'src/product/product.entity';
import { Operation } from 'src/operation/operation.entity';
import { Merchant } from 'src/merchant/merchant.entity';
import { Account } from 'src/accounts/account.entity';
import { Wallet } from 'src/wallet/wallet.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facture, Product, Operation, Merchant, Account, User, Wallet])],
  controllers: [FactureController],
  providers: [FactureService],
  exports: [FactureService], // permet d'utiliser le service ailleurs
})
export class FactureModule {}
