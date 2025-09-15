// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { FactureModule } from './facture/facture.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantModule } from './merchant/merchant.module';
import { UtilsModule } from './common/util.module';
import { AccountModule } from './accounts/account.module';
import { ProductModule } from './product/product.module';
import { OperationModule } from './operation/operation.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'postgres'),
        port: parseInt(config.get<string>('DATABASE_PORT', '5432'), 10),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'walletdb'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // ⚠️ false en prod
      }),
    }),
    WalletModule,
    FactureModule,
    AuthModule,
    MerchantModule,
    UtilsModule,
    AccountModule,
    ProductModule,
    OperationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
