import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkWalletDto } from './dto/link-wallet.dto';
import { InfoWalletDto } from './dto/info-wallet.dto';
import { UnlinkWalletDto } from './dto/unlink-wallet.dto';
import { Merchant } from '../merchant/merchant.entity';
import { Wallet, WalletStatus } from '../wallet/wallet.entity';
import { Account } from '../accounts/account.entity';
import { Operation } from 'src/operation/operation.entity';
import { BankToWalletDto } from './dto/bank-to-wallet.dto';
import { WalletToBankDto } from './dto/wallet-to-bank.dto';

import axios from 'axios';
import * as crypto from 'crypto';
import { Product } from 'src/product/product.entity';
import { GetFeesDto } from 'src/facture/dto/get-fees.dto';

// =========================
// Types génériques
// =========================
export interface ExtraDataItem {
  parameterCode: string;
  value: string;
  display: number;
}

export interface GenericWalletResponse {
  code: string;
  message: string;
  tansactionId: string; // (typo respectée)
  extraData: ExtraDataItem[];
}

// =========================
// Helpers
// =========================
function getParam<T extends { parameterCode: string; value: string }>(
  list: T[] | undefined,
  code: string,
): string | undefined {
  if (!Array.isArray(list)) return undefined;
  return list.find((p) => p.parameterCode === code)?.value;
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(Operation)
    private operationRepo: Repository<Operation>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  private generateHash(originalString: string): string {
    return sha256Hex(originalString);
  }

  private async findOrCreateAccount(accountNumber: string): Promise<Account> {
    let account = await this.accountRepo.findOne({ where: { accountNumber } });
    if (!account) {
      account = this.accountRepo.create({
        accountNumber,
        accountType: 'WALLET',
      });
      account = await this.accountRepo.save(account);
    }
    return account;
  }

  // =====================================================
  // ✅ BANK TO WALLET
  // =====================================================
  async bankToWallet(dto: BankToWalletDto, merchant: Merchant): Promise<any> {
    try {
      const clientSecret = process.env.CLIENT_SECRET; // OK: process interne

      const originalString =
        String(dto.countryCode ?? '') +
        String(dto.phoneNumber ?? '') + // utilisé pour la signature (spec donnée)
        String(dto.codePv ?? '') +
        String(dto.amount ?? '') +
        String(dto.billerCode ?? '') +
        String(dto.productId ?? '') +
        String(dto.channel ?? '') +
        String(dto.serviceProviderCode ?? '') +
        String(dto.serviceType ?? '') +
        String(dto.fees ?? '') +
        String(dto.billReference ?? '') +
        String(clientSecret ?? '');

      const hashParam = this.generateHash(originalString);

      // On choisit msisdn s'il existe, sinon phoneNumber
      const msisdn = (dto.msisdn ?? dto.phoneNumber ?? '').trim();
      if (!msisdn) {
        throw new BadRequestException('MSISDN/phoneNumber is required');
      }

      // Vérifier / créer le wallet
      let wallet = await this.walletRepo.findOne({
        where: { msisdn, merchant },
      });
      if (!wallet) {
        wallet = this.walletRepo.create({
          msisdn,
          balance: 0,
          status: WalletStatus.ACTIVE,
          merchant,
        });
        wallet = await this.walletRepo.save(wallet);
      }

      // Update balance
      wallet.balance += Number(dto.amount ?? 0);
      wallet = await this.walletRepo.save(wallet);

      // Log operation
      const operation = this.operationRepo.create({
        serviceType: 'BANK_TO_WALLET',
        metadata: { ...dto, hashParam },
        wallet,
      });
      await this.operationRepo.save(operation);

      return {
        code: '0',
        message: 'Bank to Wallet operation saved successfully',
        tansactionId: String(operation.id),
        extraData: [
          { parameterCode: 'MSISDN', value: msisdn, display: 1 },
          {
            parameterCode: 'AMOUNT',
            value: String(dto.amount ?? ''),
            display: 1,
          },
          {
            parameterCode: 'BILLREFERENCE',
            value: String(dto.billReference ?? ''),
            display: 1,
          },
          {
            parameterCode: 'BALANCE',
            value: wallet.balance.toString(),
            display: 1,
          },
        ],
      };
    } catch (error) {
      console.error('❌ Error in bankToWallet:', error);
      throw new BadRequestException('Bank to Wallet request failed');
    }
  }

  // =====================================================
  // ✅ WALLET TO BANK
  // =====================================================
  async walletToBank(dto: WalletToBankDto, merchant: Merchant): Promise<any> {
    try {
      // 1) Extraire paramètres utiles
      const msisdn = getParam(dto.parameters, 'MSISDN');
      const amount = Number(getParam(dto.parameters, 'AMOUNT') ?? 0);
      const accountNumber = getParam(dto.parameters, 'ACCOUNTNUMBER');

      if (!msisdn || !amount || !accountNumber) {
        throw new BadRequestException(
          'MSISDN, AMOUNT and ACCOUNTNUMBER are required',
        );
      }

      // 2) Vérifier si le wallet existe
      const wallet = await this.walletRepo.findOne({
        where: { msisdn, merchant },
        relations: ['account', 'product'],
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found for this MSISDN');
      }

      // 3) Vérifier le solde suffisant
      if (wallet.balance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // 4) Débiter le wallet
      wallet.balance -= amount;
      await this.walletRepo.save(wallet);

      // 5) Sauvegarder une opération
      const operation = this.operationRepo.create({
        serviceType: 'WALLET_TO_BANK',
        metadata: { ...dto },
        wallet,
      });
      await this.operationRepo.save(operation);

      // 6) Réponse standardisée
      return {
        code: '0',
        message: 'Wallet to Bank operation saved successfully',
        tansactionId: String(operation.id),
        extraData: [
          { parameterCode: 'MSISDN', value: msisdn, display: 1 },
          { parameterCode: 'ACCOUNTNUMBER', value: accountNumber, display: 1 },
          { parameterCode: 'AMOUNT', value: String(amount), display: 1 },
          {
            parameterCode: 'BALANCE',
            value: wallet.balance.toString(),
            display: 1,
          },
        ],
      };
    } catch (error) {
      console.error('❌ Error in walletToBank:', error);
      throw new BadRequestException('Wallet to Bank request failed');
    }
  }

  // =====================================================
  // ✅ GET FEES
  // =====================================================
  async getFees(dto: GetFeesDto, _merchant: Merchant): Promise<any> {
    try {
      const clientSecret = process.env.CLIENT_SECRET;

      const originalString =
        String(dto.channel ?? '') +
        String(dto.billerCode ?? '') +
        String(dto.operatorCode ?? '') +
        String(dto.amount ?? '') +
        String(clientSecret ?? '');

      const hashParam = this.generateHash(originalString);

      const operation = this.operationRepo.create({
        serviceType: 'GET_FEES',
        metadata: { ...dto, hashParam },
      });
      await this.operationRepo.save(operation);

      // Exemple de réponse simulée
      return {
        code: '0',
        message: 'Get Fees operation calculated successfully',
        tansactionId: String(operation.id),
        extraData: [
          {
            parameterCode: 'BILLER_CODE',
            value: String(dto.billerCode ?? ''),
            display: 1,
          },
          {
            parameterCode: 'OPERATOR_CODE',
            value: String(dto.operatorCode ?? ''),
            display: 1,
          },
          {
            parameterCode: 'AMOUNT',
            value: String(dto.amount ?? ''),
            display: 1,
          },
          { parameterCode: 'FEES', value: '50', display: 1 },
        ],
        fees: {
          fraisOperation: 85.0,
          taxeOPeration: 115,
          responsable: 'CLIENT',
        },
      };
    } catch (error) {
      console.error('❌ Error in getFees:', error);
      throw new BadRequestException('Get Fees request failed');
    }
  }

  // =====================================================
  // 🔗 LINK WALLET (1 compte = 1 wallet max + product obligatoire)
  // =====================================================
  async linkWallet(
    dto: LinkWalletDto,
    merchant: Merchant,
  ): Promise<GenericWalletResponse> {
    try {
      // 1) Récupération des paramètres
      const msisdn = (
        getParam(dto.parameters, 'MSISDN') ??
        dto.sender?.holder?.phoneNumber ??
        ''
      ).trim();
      const accountNumber = (
        getParam(dto.parameters, 'ACCOUNTNUMBER') ?? ''
      ).trim();

      if (!msisdn || !accountNumber) {
        throw new BadRequestException('Missing MSISDN or ACCOUNTNUMBER');
      }

      // 2) Charger le produit
      const productId = dto.product?.id;
      if (!productId) {
        throw new BadRequestException('Missing product ID');
      }

      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new BadRequestException(`Product with id ${productId} not found`);
      }

      // 3) Trouver ou créer le compte
      let account = await this.accountRepo.findOne({
        where: { accountNumber },
        relations: ['wallet'],
      });
      if (!account) {
        account = this.accountRepo.create({
          accountNumber,
          accountType: 'WALLET',
        });
        account = await this.accountRepo.save(account);
      }

      // 4) Vérifier si un wallet existe déjà pour ce compte + marchand
      const walletByAccount = await this.walletRepo.findOne({
        where: { account, merchant },
      });

      if (walletByAccount) {
        if (walletByAccount.status === WalletStatus.ACTIVE) {
          throw new BadRequestException(
            'Account already linked to another wallet',
          );
        }
        // 🔄 Réactiver un wallet fermé
        walletByAccount.status = WalletStatus.ACTIVE;
        walletByAccount.msisdn = msisdn;
        walletByAccount.product = product;
        await this.walletRepo.save(walletByAccount);

        return {
          code: '0',
          message: 'Wallet re-linked successfully',
          tansactionId: String(Math.floor(Math.random() * 1_000_000)),
          extraData: [
            { parameterCode: 'MSISDN', value: msisdn, display: 1 },
            {
              parameterCode: 'ACCOUNTNUMBER',
              value: accountNumber,
              display: 1,
            },
            {
              parameterCode: 'PRODUCT_ID',
              value: String(product.id),
              display: 1,
            },
            { parameterCode: 'STATUS', value: 'ACTIVE', display: 1 },
          ],
        };
      }

      // 5) Vérifier s’il existe déjà un wallet actif avec ce MSISDN
      const walletByMsisdn = await this.walletRepo.findOne({
        where: { msisdn, merchant },
      });
      if (walletByMsisdn && walletByMsisdn.status === WalletStatus.ACTIVE) {
        throw new BadRequestException(
          'This MSISDN is already linked to another wallet',
        );
      }

      // 6) Créer un nouveau wallet
      const wallet = this.walletRepo.create({
        msisdn,
        balance: 0,
        status: WalletStatus.ACTIVE,
        account,
        merchant,
        product, // ✅ lié au produit
      });
      await this.walletRepo.save(wallet);

      return {
        code: '0',
        message: 'Wallet linked and saved successfully',
        tansactionId: String(Math.floor(Math.random() * 1_000_000)),
        extraData: [
          { parameterCode: 'MSISDN', value: msisdn, display: 1 },
          { parameterCode: 'ACCOUNTNUMBER', value: accountNumber, display: 1 },
          {
            parameterCode: 'PRODUCT_ID',
            value: String(product.id),
            display: 1,
          },
        ],
      };
    } catch (error: any) {
      console.error('❌ Error in linkWallet:', error.message, error?.detail);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Link Wallet request failed');
    }
  }

  // =====================================================
  // 📄 GET INFO WALLET
  // =====================================================
  async getInfoWallet(dto: InfoWalletDto, merchant: Merchant) {
    if (!dto.productId) {
      throw new BadRequestException('productId is missing');
    }

    // TELEPHONE ou fallback MSISDN
    const msisdn = (
      getParam(dto.parameters, 'TELEPHONE') ??
      getParam(dto.parameters, 'MSISDN') ??
      ''
    ).trim();

    if (!msisdn) {
      throw new BadRequestException('TELEPHONE/MSISDN is required');
    }

    const wallet = await this.walletRepo.findOne({
      where: { msisdn, merchant },
      relations: ['account'],
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return [
      { parameterCode: 'MSISDN', value: wallet.msisdn, display: 1 },
      { parameterCode: 'STATUS', value: wallet.status, display: 1 },
      {
        parameterCode: 'BALANCE',
        value: wallet.balance.toString(),
        display: 1,
      },
      {
        parameterCode: 'ACCOUNTNUMBER',
        value: wallet.account?.accountNumber ?? '',
        display: 1,
      },
    ];
  }

  // =====================================================
  // ❌ UNLINK WALLET
  // =====================================================
  async unlinkWallet(
    dto: UnlinkWalletDto,
    merchant: Merchant,
  ): Promise<GenericWalletResponse> {
    const msisdn = (getParam(dto.listParam, 'MSISDN') ?? '').trim();

    if (!msisdn) {
      throw new BadRequestException('MSISDN is required');
    }

    const wallet = await this.walletRepo.findOne({
      where: { msisdn, merchant },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.status === WalletStatus.CLOSED) {
      // Idempotent: déjà fermé
      return {
        code: '0',
        message: 'Wallet already unlinked',
        tansactionId: String(Math.floor(Math.random() * 1_000_000)),
        extraData: [
          { parameterCode: 'MSISDN', value: wallet.msisdn, display: 1 },
          { parameterCode: 'STATUS', value: wallet.status, display: 1 },
        ],
      };
    }

    wallet.status = WalletStatus.CLOSED;
    await this.walletRepo.save(wallet);

    return {
      code: '0',
      message: 'Wallet unlinked successfully',
      tansactionId: String(Math.floor(Math.random() * 1_000_000)),
      extraData: [
        { parameterCode: 'MSISDN', value: wallet.msisdn, display: 1 },
        { parameterCode: 'STATUS', value: wallet.status, display: 1 },
      ],
    };
  }
}
