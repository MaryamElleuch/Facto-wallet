import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiHeader, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { WalletService } from './wallet.service';
import { LinkWalletDto } from './dto/link-wallet.dto';
import { InfoWalletDto } from './dto/info-wallet.dto';
import { UnlinkWalletDto } from './dto/unlink-wallet.dto';
import { BankToWalletDto } from './dto/bank-to-wallet.dto';
import { WalletToBankDto } from './dto/wallet-to-bank.dto';
import { ApiKeyHashGuard } from '../auth/guards/api-key-hash.guard';
import { Merchant } from '../merchant/merchant.entity';
import { GetFeesDto } from 'src/facture/dto/get-fees.dto';

type MerchantRequest = Request & { merchant: Merchant };

@ApiTags('Wallet Operations')
@Controller('v1/api/operations')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // 🔗 LINK WALLET
  @Post('link-wallet')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({
    name: 'clientId',
    description: 'Identifiant unique du marchand',
    required: true,
  })
  @ApiHeader({
    name: 'hashParam',
    description: 'Hachage SHA256 des paramètres de la requête',
    required: true,
  })
  @ApiOperation({ summary: 'Link a wallet' })
  async linkWallet(@Body() dto: LinkWalletDto, @Req() req: MerchantRequest) {
    return this.walletService.linkWallet(dto, req.merchant);
  }

  // 📄 INFO FACTURE
  @Post('info-facture-external')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({
    name: 'clientId',
    description: 'Unique identifier of the merchant',
    required: true,
  })
  @ApiHeader({
    name: 'hashParam',
    description: 'SHA256 hash of (productId + clientSecret)',
    required: true,
  })
  @ApiOperation({ summary: 'Get wallet info (facture)' })
  async getInfoWallet(@Body() dto: InfoWalletDto, @Req() req: MerchantRequest) {
    return this.walletService.getInfoWallet(dto, req.merchant);
  }

  // ❌ UNLINK WALLET
  @Post('unlink-wallet')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({
    name: 'clientId',
    description: 'Identifiant unique du marchand',
    required: true,
  })
  @ApiHeader({
    name: 'hashParam',
    description: 'SHA256 hash of (walletId + clientSecret)',
    required: true,
  })
  @ApiOperation({ summary: 'Unlink a wallet' })
  async unlinkWallet(
    @Body() dto: UnlinkWalletDto,
    @Req() req: MerchantRequest,
  ) {
    return this.walletService.unlinkWallet(dto, req.merchant);
  }

  // 🏦 BANK TO WALLET
  @Post('bank-to-wallet')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({
    name: 'clientId',
    description: 'Identifiant unique du marchand',
    required: true,
  })
  @ApiHeader({
    name: 'hashParam',
    description: 'Hachage SHA256 des paramètres de la requête',
    required: true,
  })
  @ApiOperation({ summary: 'Transfer from Bank to Wallet' })
  async bankToWallet(
    @Body() dto: BankToWalletDto,
    @Req() req: MerchantRequest,
  ) {
    return this.walletService.bankToWallet(dto, req.merchant);
  }

  // 💳 WALLET TO BANK
  @Post('wallet-to-bank')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({
    name: 'clientId',
    description: 'Identifiant unique du marchand',
    required: true,
  })
  @ApiHeader({
    name: 'hashParam',
    description: 'Hachage SHA256 des paramètres de la requête',
    required: true,
  })
  @ApiOperation({ summary: 'Transfer from Wallet to Bank' })
  async walletToBank(
    @Body() dto: WalletToBankDto,
    @Req() req: MerchantRequest,
  ) {
    return this.walletService.walletToBank(dto, req.merchant);
  }

  // 💰 GET FEES
  @Post('get-fees')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({
    name: 'clientId',
    description: 'Identifiant unique du marchand',
    required: true,
  })
  @ApiHeader({
    name: 'hashParam',
    description: 'Hachage SHA256 des paramètres de la requête',
    required: true,
  })
  @ApiOperation({ summary: 'Get transaction fees' })
  async getFees(@Body() dto: GetFeesDto, @Req() req: MerchantRequest) {
    return this.walletService.getFees(dto, req.merchant);
  }
}
