import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './wallet.entity';
import { ApiKeyHashGuard } from '../auth/guards/api-key-hash.guard';
import { MerchantModule } from '../merchant/merchant.module';
import { Account } from 'src/accounts/account.entity';
import { Operation } from 'src/operation/operation.entity';
import { Product } from 'src/product/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Account, Operation, Product]),
    MerchantModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, ApiKeyHashGuard],
  exports: [WalletService],
})
export class WalletModule {}
