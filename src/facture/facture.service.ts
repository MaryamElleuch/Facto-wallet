import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture } from './facture.entity';
import { Product } from 'src/product/product.entity';
import { Merchant } from 'src/merchant/merchant.entity';
import { GetFeesDto } from './dto/get-fees.dto';
import * as crypto from 'crypto';
import { Account } from 'src/accounts/account.entity';
import { User } from 'src/users/user.entity';
import { Wallet, WalletStatus } from 'src/wallet/wallet.entity';
import { PaymentInvoiceDto } from './dto/payment-invoice.dto';
import { PaymentAirtimeDto } from './dto/payment-airtime.dto';
import { ListPaidInvoicesDto } from './dto/list-paid-invoices.dto';

export interface ParametreDto {
  parameterCode: string;
  value: string | number;
  display: number;
}

@Injectable()
export class FactureService {
  constructor(
    @InjectRepository(Facture)
    private factureRepo: Repository<Facture>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  async getFacturiersByCodeUo(
    codeUO: string,
    sector: string,
    clientId?: string,
    hashParam?: string,
  ) {
    // Optionnel : log pour debug ou audit
    console.log('Fetching facturiers by codeUO');
    console.log('codeUO:', codeUO, 'sector:', sector);
    if (clientId) console.log('clientId:', clientId);
    if (hashParam) console.log('hashParam:', hashParam);

    // Récupération des marchands et de leurs produits
    const merchants = await this.merchantRepo.find({ relations: ['products'] });

    // Transformation en structure attendue par le frontend ou l'API
    return merchants.map((m) => ({
      id: m.id.toString(),
      facturerName: m.name,
      facturerCode: m.code || 'N/A',
      codeUO,
      sector,
      products: m.products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        ordreNumber: p.ordreNumber,
        fixedAmount: p.fixedAmount,
        active: true,
      })),
    }));
  }

  async getListFactures(
    productId: number,
    parameters: ParametreDto[],
    clientId?: string, // si tu veux filtrer par merchant
  ): Promise<Facture[]> {
    let query = this.factureRepo
      .createQueryBuilder('f')
      .innerJoinAndSelect('f.product', 'p')
      .innerJoinAndSelect('p.merchant', 'm');

    if (productId) {
      query = query.where('f.productId = :id', { id: productId });
    } else if (clientId) {
      query = query.where('m.name = :merchantName', { merchantName: clientId });
    }

    if (parameters && parameters.length > 0) {
      parameters.forEach((p) => {
        if (p.parameterCode === 'Name') {
          query.andWhere('f.name = :ref', { name: p.value });
        }
      });
    }

    return query.getMany();
  }

  async infoFactureExternal(
    productId: number,
    parameters: ParametreDto[],
  ): Promise<{ parameterCode: string; value: string; display: number }[]> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new BadRequestException('Product not found');

    const refParam = parameters.find((p) => p.parameterCode === 'REFERENCE');
    let facture: Facture | null = null;

    if (refParam && refParam.value) {
      facture = await this.factureRepo
        .createQueryBuilder('f')
        .innerJoinAndSelect('f.product', 'p')
        .where('f.reference = :ref', { ref: String(refParam.value).trim() })
        .andWhere('p.id = :pid', { pid: productId })
        .getOne();
    }

    return [
      { parameterCode: 'NBRE', value: facture ? '1' : '0', display: 0 },
      {
        parameterCode: 'REFERENCE',
        value: facture ? facture.reference : '',
        display: 0,
      },
      {
        parameterCode: 'AMOUNT',
        value: facture
          ? facture.amount.toFixed(2)
          : (product.fixedAmount || 0).toFixed(2),
        display: 0,
      },
      {
        parameterCode: 'STATUS',
        value: facture ? facture.status : '',
        display: 0,
      },
    ];
  }

  async saveFacture(
    reference: string,
    amount: number,
    productId: number,
  ): Promise<Facture> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const facture = this.factureRepo.create({
      reference,
      amount,
      status: 'PENDING',
      product,
    });

    return this.factureRepo.save(facture);
  }

  async findAll(): Promise<Facture[]> {
    return this.factureRepo.find({
      relations: ['product', 'operations'],
    });
  }

  async getFees(body: GetFeesDto, clientId: string, clientSecret: string) {
    // Log the incoming request body
    console.log('Request body:', JSON.stringify(body));
    console.log('Raw billerCode:', JSON.stringify(body.billerCode));
    console.log('Trimmed billerCode:', body.billerCode.trim());

    // Verify all factures in the database
    const allFactures = await this.factureRepo.find();
    console.log('All factures in database:', allFactures);

    // Query for facture (case-insensitive, but no exception if not found)
    const facture = await this.factureRepo
      .createQueryBuilder('facture')
      .where('LOWER(facture.reference) = LOWER(:ref)', {
        ref: body.billerCode.trim(),
      })
      .leftJoinAndSelect('facture.product', 'product')
      .getOne();

    console.log('Facture found:', facture || 'No facture found');

    // Continue with user validation
    const user = await this.userRepo.findOne({
      where: { username: body.accountInfo.customerUsername.trim() },
    });
    if (!user) {
      throw new BadRequestException(
        `User not found for username '${body.accountInfo.customerUsername}'`,
      );
    }

    const wallet = await this.walletRepo.findOne({
      where: {
        msisdn: body.accountInfo.phoneNumber.trim(),
        status: WalletStatus.ACTIVE,
      },
      relations: ['account'],
    });
    if (!wallet) {
      throw new BadRequestException(
        `Active wallet not found for MSISDN '${body.accountInfo.phoneNumber}'`,
      );
    }

    let account = await this.accountRepo.findOne({
      where: { accountNumber: body.accountInfo.accountNumber.trim() },
    });

    if (!account) {
      account = this.accountRepo.create({
        accountNumber: body.accountInfo.accountNumber,
        bankCode: body.accountInfo.bankCode,
        branchCode: body.accountInfo.agencyCode,
        accountType: body.accountInfo.accountType,
        countryCode: body.accountInfo.countryCode,
        fseCode: body.accountInfo.serviceProviderCode,
        alias: body.accountInfo.alias?.trim() || 'Default Alias',
        user,
        wallet,
      });
    } else {
      account.bankCode = body.accountInfo.bankCode;
      account.branchCode = body.accountInfo.agencyCode;
      account.accountType = body.accountInfo.accountType;
      account.countryCode = body.accountInfo.countryCode;
      account.fseCode = body.accountInfo.serviceProviderCode;
      account.alias = body.accountInfo.alias?.trim() || 'Default Alias';
      account.user = user;
      account.wallet = wallet;
    }
    account = await this.accountRepo.save(account);

    // Use facture amount if available, otherwise use request body amount
    const amount = facture ? facture.amount : body.amount;

    const originalString =
      body.channel +
      body.billerCode +
      body.operatorCode +
      amount +
      clientSecret;

    const hashParam = crypto
      .createHash('sha256')
      .update(originalString)
      .digest('hex');

    const fees = {
      operationFee: amount * 0.05,
      taxFee: amount * 0.1,
      responsible: 'CLIENT',
    };

    return {
      request: body,
      facture: facture
        ? {
            reference: facture.reference,
            amount: facture.amount,
            product: facture.product?.name,
          }
        : null,
      account: {
        accountNumber: account.accountNumber,
        bankCode: account.bankCode,
        branchCode: account.branchCode,
        accountType: account.accountType,
        alias: account.alias,
      },
      wallet: { msisdn: wallet.msisdn, status: wallet.status },
      clientId,
      hashParam,
      fees,
    };
  }
  async doPaymentInvoice(
    body: PaymentInvoiceDto,
    clientId: string,
    clientSecret: string,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: Number(body.productId) },
    });
    if (!product) throw new BadRequestException('Product not found');

    const referenceParam = body.mparametre.find(
      (p) => p.parameterCode === 'REFERENCE',
    );
    const amountParam = body.mparametre.find(
      (p) => p.parameterCode === 'AMOUNT',
    );
    if (!referenceParam || !amountParam)
      throw new BadRequestException('REFERENCE or AMOUNT missing');

    const invoice = await this.factureRepo.findOne({
      where: { reference: String(referenceParam.value) },
      relations: ['product'],
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found, cannot pay');
    }

    // Vérifier le wallet
    const wallet = await this.walletRepo.findOne({
      where: {
        msisdn: body.accountInfo.phoneNumber,
        status: WalletStatus.ACTIVE,
      },
      relations: ['account'],
    });
    if (!wallet) throw new BadRequestException('Active wallet not found');

    // Vérifier ou créer le compte
    let account = await this.accountRepo.findOne({
      where: { accountNumber: body.accountInfo.accountNumber.trim() },
    });

    const user = wallet.user
      ? wallet.user
      : await this.userRepo.findOne({
          where: { username: body.accountInfo.customerUsername.trim() },
        });

    if (!user) {
      throw new BadRequestException(
        `User not found for username '${body.accountInfo.customerUsername}'`,
      );
    }

    if (!account) {
      account = this.accountRepo.create({
        accountNumber: body.accountInfo.accountNumber.trim(),
        bankCode: body.accountInfo.bankCode.trim(),
        branchCode: body.accountInfo.agencyCode.trim(),
        accountType: body.accountInfo.accountType.trim(),
        countryCode: body.accountInfo.countryCode.trim(),
        fseCode: body.accountInfo.serviceProviderCode.trim(),
        alias: body.accountInfo.alias?.trim() || 'Default Alias',
        user,
        wallet,
      });
    } else {
      // Mettre à jour tous les champs
      account.bankCode = body.accountInfo.bankCode.trim();
      account.branchCode = body.accountInfo.agencyCode.trim();
      account.accountType = body.accountInfo.accountType.trim();
      account.countryCode = body.accountInfo.countryCode.trim();
      account.fseCode = body.accountInfo.serviceProviderCode.trim();
      account.alias = body.accountInfo.alias?.trim() || 'Default Alias';
      account.wallet = wallet;
      account.user = user;
    }

    // Sauvegarder le compte
    account = await this.accountRepo.save(account);

    const fees = {
      operationFee: Number(amountParam.value) * 0.05,
      taxFee: Number(amountParam.value) * 0.1,
      responsible: 'CLIENT',
    };

    const originalString =
      String(body.countryCode) +
      String(body.phoneNumber) +
      String(body.pvCode) +
      String(amountParam.value) +
      String(body.billerCode) +
      String(body.productId) +
      String(body.channel) +
      String(body.serviceType) +
      String(fees.operationFee) +
      String(referenceParam.value) +
      String(clientSecret);

    const hashParam = crypto
      .createHash('sha256')
      .update(originalString)
      .digest('hex');

    invoice.status = 'PAID';
    await this.factureRepo.save(invoice);

    return {
      status: 'SUCCESS',
      transactionId: 'TX-' + new Date().getTime(),
      invoice: { reference: invoice.reference, amount: invoice.amount },
      wallet: { msisdn: wallet.msisdn, status: wallet.status },
      account: {
        accountNumber: account.accountNumber,
        bankCode: account.bankCode,
        branchCode: account.branchCode,
        accountType: account.accountType,
        alias: account.alias,
      },
      fees,
      hashParam,
    };
  }

  async doPaymentAirtime(
    body: PaymentAirtimeDto,
    clientId: string,
    clientSecret: string,
  ) {
    // Extraire les paramètres
    const amountParam = body.mparametre.find(
      (p) => p.parameterCode === 'AMOUNT',
    );
    const phoneNumberParam = body.mparametre.find(
      (p) => p.parameterCode === 'PHONE_NUMBER',
    );
    const countryCodeParam = body.mparametre.find(
      (p) => p.parameterCode === 'COUNTRY_CODE',
    );
    const quantityParam = body.mparametre.find(
      (p) => p.parameterCode === 'QUANTITY',
    );

    if (
      !amountParam ||
      !phoneNumberParam ||
      !countryCodeParam ||
      !quantityParam
    ) {
      throw new BadRequestException(
        'Missing required parameters for AIRTIME payment',
      );
    }

    // Calcul des frais
    const fees = {
      operationFee: Number(amountParam.value) * 0.05,
      taxFee: Number(amountParam.value) * 0.1,
      responsible: 'CLIENT',
    };

    // Construire la chaîne originale pour hash
    const originalString =
      String(countryCodeParam.value) +
      String(phoneNumberParam.value) +
      String(body.pvCode || '') +
      String(amountParam.value) +
      String(body.billerCode || '') +
      String(body.productId || '') +
      String(body.channel || '') +
      String(body.serviceProviderCode || '') +
      String(body.serviceType || '') +
      String(fees.operationFee) +
      String(clientSecret);

    const hashParam = crypto
      .createHash('sha256')
      .update(originalString)
      .digest('hex');

    // Retourner résultat
    return {
      code: 'SUCCESS',
      message: 'Airtime payment completed successfully',
      transactionId: 'TX-' + new Date().getTime(),
      hashParam,
      fees,
    };
  }

  async listPaidInvoices(
    params: ListPaidInvoicesDto,
    clientId: string,
    clientSecret: string,
  ) {
    const { countryCode, phoneNumber, billerCode, pageSize, pageNumber } =
      params;

    if (
      !countryCode ||
      !phoneNumber ||
      !billerCode ||
      !pageSize ||
      !pageNumber
    ) {
      throw new BadRequestException('Missing required parameters');
    }

    const originalString =
      countryCode +
      phoneNumber +
      billerCode +
      pageSize +
      pageNumber +
      clientSecret;

    const hashParam = crypto
      .createHash('sha256')
      .update(originalString)
      .digest('hex');

    const skip = (Number(pageNumber) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const paidInvoices = await this.factureRepo.find({
      where: { status: 'PAID' },
      order: { createdAt: 'DESC' },
      skip,
      take,
      relations: ['product'],
    });

    const data = paidInvoices.map((f) => ({
      referenceFacture: f.reference,
      montantFacture: f.amount.toString(),
      datePaiement: f.createdAt.toISOString(),
      referencePaiement: null,
      donneExterne: '',
      refExterne: '',
      nomProduit: f.product?.name || '',
    }));

    return { hashParam, data };
  }
}
