// src/facture/facture.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FactureService, ParametreDto } from './facture.service';
import { Facture } from './facture.entity';
import { ListFacturesDto } from './dto/list-factures.dto';
import { GetFeesDto } from './dto/get-fees.dto';
import { ApiKeyHashGuard } from 'src/auth/guards/api-key-hash.guard';
import { PaymentInvoiceDto } from './dto/payment-invoice.dto';
import { PaymentAirtimeDto } from './dto/payment-airtime.dto';
import { ListPaidInvoicesDto } from './dto/list-paid-invoices.dto';

@ApiTags('Facture Operations')
@Controller('factures')
export class FactureController {
  constructor(private readonly factureService: FactureService) {}

  @Post('facturiers-by-code-uo')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({ name: 'clientId', description: 'Merchant ID', required: true })
  @ApiHeader({ name: 'hashParam', description: 'SHA256 hash', required: true })
  @Post('facturiers-by-code-uo')
  @UseGuards(ApiKeyHashGuard)
  getFacturiersByCodeUo(
    @Query('codeUO') codeUO: string,
    @Query('sector') sector: string,
    @Headers('clientId') clientId: string,
    @Headers('hashParam') hashParam: string,
  ) {
    return this.factureService.getFacturiersByCodeUo(
      codeUO,
      sector,
      clientId,
      hashParam,
    );
  }

  @Post('list')
  @UseGuards(ApiKeyHashGuard)
  getListFactures(
    @Body() body: ListFacturesDto,
    @Headers('clientId') clientId: string,
    @Headers('hashParam') hashParam: string,
  ): Promise<Facture[]> {
    const parameters = body.mparametre.map((p) => ({
      parameterCode: p.parameterCode,
      value: p.value,
      display: p.display,
    }));
    return this.factureService.getListFactures(body.idProduit, parameters);
  }

  @Post('info-facture-external')
  @UseGuards(ApiKeyHashGuard)
  infoFactureExternal(
    @Body() body: ListFacturesDto,
    @Headers('clientId') clientId: string,
    @Headers('hashParam') hashParam: string,
  ) {
    const parameters: ParametreDto[] = body.mparametre.map((p) => ({
      parameterCode: p.parameterCode,
      value: p.value,
      display: p.display,
    }));

    return this.factureService.infoFactureExternal(body.idProduit, parameters);
  }

  @Post('save')
  saveFacture(
    @Body()
    body: {
      reference: string;
      amount: number;
      productId: number;
    },
  ): Promise<Facture> {
    return this.factureService.saveFacture(
      body.reference,
      body.amount,
      body.productId,
    );
  }

  @Get()
  findAll(): Promise<Facture[]> {
    return this.factureService.findAll();
  }

  @Post('get-fees')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({ name: 'clientId', description: 'Merchant ID', required: true })
  @ApiHeader({ name: 'hashParam', description: 'SHA256 hash', required: true })
  getFees(@Body() body: GetFeesDto, @Headers('clientId') clientId: string) {
    return this.factureService.getFees(
      body,
      clientId,
      (body as any).merchant?.clientSecret || '',
    );
  }

  // FactureController
  @Post('payment-invoice')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({ name: 'clientId', description: 'Merchant ID', required: true })
  @ApiHeader({ name: 'hashParam', description: 'SHA256 hash', required: true })
  @ApiBody({
    type: PaymentInvoiceDto,
    description: 'Invoice payment request body',
  })
  doPaymentInvoice(
    @Body() body: PaymentInvoiceDto & { merchant?: { clientSecret: string } },
    @Headers('clientId') clientId: string, // <== un seul clientId ici
  ) {
    const clientSecret = body.merchant?.clientSecret || '';
    return this.factureService.doPaymentInvoice(body, clientId, clientSecret);
  }

  @Post('payment-airtime')
  @UseGuards(ApiKeyHashGuard)
  @ApiHeader({ name: 'clientId', description: 'Merchant ID', required: true })
  @ApiHeader({ name: 'hashParam', description: 'SHA256 hash', required: true })
  @ApiBody({ type: PaymentAirtimeDto, required: false })
  async doPaymentAirtime(
    @Headers('clientId') clientId: string, // obligatoire
    @Body() body?: PaymentAirtimeDto & { merchant?: { clientSecret: string } }, // optionnel
  ) {
    const clientSecret = body?.merchant?.clientSecret || '';

    // Gestion si body absent
    if (!body) {
      return {
        code: 'EMPTY_BODY',
        message: 'Aucun body fourni pour paiement airtime',
        clientId,
      };
    }

    // Appel au service avec les données présentes
    return this.factureService.doPaymentAirtime(body, clientId, clientSecret);
  }

  @Post('get-list-paid-invoices')
  @UseGuards(ApiKeyHashGuard)
  @ApiOperation({ summary: 'Retrieve list of paid invoices' })
  @ApiHeader({ name: 'clientid', description: 'Merchant ID', required: true })
  @ApiHeader({ name: 'hashparam', description: 'SHA256 hash', required: true })
  @ApiBody({
    type: ListPaidInvoicesDto,
    description: 'Paid invoices request body',
  })
  listPaidInvoices(
    @Body() body: ListPaidInvoicesDto,
    @Headers('clientid') clientId: string,
    @Headers('hashparam') hashParam: string,
  ) {
    const clientSecret = ''; // selon ton business logic
    return this.factureService.listPaidInvoices(body, clientId, clientSecret);
  }
}
