// src/common/guards/api-key-hash.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from '../../merchant/merchant.entity';
import { sha256Hex, timingSafeEqualHex } from 'src/common/utils/hash.util';
import { Request } from 'express';

@Injectable()
export class ApiKeyHashGuard implements CanActivate {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { merchant?: Merchant } = context
      .switchToHttp()
      .getRequest();

    // 1) Récup headers
    const clientId =
      (req.headers['clientid'] as string) ||
      (req.headers['client-id'] as string) ||
      (req.headers['x-client-id'] as string);

    const hashParam =
      (req.headers['hashparam'] as string) ||
      (req.headers['hash-param'] as string) ||
      (req.headers['x-hash-param'] as string);

    if (!clientId || !hashParam) {
      throw new UnauthorizedException('Missing clientId or hashParam headers');
    }

    // 2) Vérif marchand actif
    const merchant = await this.merchantRepo.findOne({ where: { clientId } });
    if (!merchant || !merchant.active) {
      throw new UnauthorizedException('Invalid clientId');
    }

    // ✅ Fix : body et query toujours objets
    const body: Record<string, any> =
      req.body && typeof req.body === 'object' ? req.body : {};
    const query: Record<string, any> =
      req.query && typeof req.query === 'object' ? req.query : {};
    let originalString = '';

    // 3) Construction du hash selon le service
    if (typeof body.serviceType === 'string') {
      switch (body.serviceType.toUpperCase()) {
        case 'LINK':
        case 'UNLINK':
          originalString = `${body.codePv}${body.biller?.id}${body.serviceType}${body.channel}${body.product?.id}${merchant.clientSecret}`;
          break;

        case 'BANK_TO_WALLET':
          originalString = `${body.countryCode}${body.phoneNumber}${body.codePv}${body.amount}${body.billerCode}${body.productId}${body.channel}${body.serviceProviderCode}${body.serviceType}${body.fees}${body.billReference}${merchant.clientSecret}`;
          break;

        case 'WALLET_TO_BANK':
          originalString = `${body.codePv}${body.biller?.id}${body.serviceType}${body.channel}${body.product?.id}${merchant.clientSecret}`;
          break;

        case 'GET_FEES':
          originalString = `${body.channel}${body.billerCode}${body.operatorCode}${body.amount}${merchant.clientSecret}`;
          break;
        case 'INVOICE': {
          const amountParam = body.mparametre?.find(
            (p) => p.parameterCode === 'AMOUNT',
          );
          const referenceParam = body.mparametre?.find(
            (p) => p.parameterCode === 'REFERENCE',
          );

          if (!amountParam || !referenceParam) {
            throw new BadRequestException('REFERENCE or AMOUNT missing');
          }

          const amountValue = amountParam.value;
          const referenceValue = referenceParam.value;

          // 🔹 FEES retiré du hash
          originalString =
            String(body.countryCode) + // codePays
            String(body.phoneNumber) + // telephone
            String(body.pvCode) + // codePv
            String(amountValue) + // montant
            String(body.billerCode) + // codeFacturier
            String(body.productId) + // produitId
            String(body.channel) + // canal
            String(body.accountInfo?.serviceProviderCode || '') + // codeFseSrc
            String(body.serviceType) + // typeService
            String(referenceValue) + // referenceFacture
            merchant.clientSecret; // clientSecret

          break;
        }
        case 'AIRTIME': {
          const amountParam = body.mparametre?.find(
            (p) => p.parameterCode === 'AMOUNT',
          );
          const phoneParam = body.mparametre?.find(
            (p) => p.parameterCode === 'PHONE_NUMBER',
          );
          const countryParam = body.mparametre?.find(
            (p) => p.parameterCode === 'COUNTRY_CODE',
          );
          const quantityParam = body.mparametre?.find(
            (p) => p.parameterCode === 'QUANTITY',
          );

          if (!amountParam || !phoneParam || !countryParam || !quantityParam) {
            throw new BadRequestException(
              'Missing parameters for AIRTIME hash',
            );
          }

          originalString =
            String(countryParam.value) +
            String(phoneParam.value) +
            String(body.pvCode || '') +
            String(amountParam.value) +
            String(body.billerCode || '') +
            String(body.productId || '') +
            String(body.channel || '') +
            String(body.serviceProviderCode || '') +
            String(body.serviceType || '') +
            merchant.clientSecret;

          break;
        }

        default:
          throw new BadRequestException(
            `Unsupported serviceType for hash validation: ${body.serviceType}`,
          );
      }
    }
    // Cas FACTURIER (GET facturiers_by_code_uo)
    else if ('codeUO' in query && 'sector' in query) {
      originalString = `${query.codeUO}${query.sector}${merchant.clientSecret}`;
    } else if (
      'countryCode' in body &&
      'phoneNumber' in body &&
      'billerCode' in body &&
      'pageSize' in body &&
      'pageNumber' in body
    ) {
      originalString =
        String(body.countryCode) +
        String(body.phoneNumber) +
        String(body.billerCode) +
        String(body.pageSize) +
        String(body.pageNumber) +
        merchant.clientSecret;
    }
    // Cas INFO-FACTURE (idProduit + clientSecret) et cas listFactures
    else if ('idProduit' in body) {
      originalString = `${body.idProduit}${merchant.clientSecret}`;
    } else {
      throw new BadRequestException(
        'Missing required fields for hash validation',
      );
    }

    // 4) Vérif du hash
    const computed = sha256Hex(originalString);
    if (!timingSafeEqualHex(computed, String(hashParam))) {
      throw new UnauthorizedException('Invalid hashParam');
    }

    // 5) Attache le marchand à la requête
    req.merchant = merchant;
    return true;
  }
}
