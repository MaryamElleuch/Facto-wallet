import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { Merchant } from './merchant.entity';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantController {
  constructor(private readonly service: MerchantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a merchant (clientId/clientSecret/active)' })
  create(@Body() dto: CreateMerchantDto): Promise<Merchant> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all merchants' })
  findAll(): Promise<Merchant[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant by numeric id' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Merchant> {
    return this.service.findOne(id);
  }

  @Get('by-client/:clientId')
  @ApiOperation({ summary: 'Get merchant by clientId' })
  findByClientId(@Param('clientId') clientId: string): Promise<Merchant> {
    return this.service.findByClientId(clientId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update merchant (clientId/clientSecret/active)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMerchantDto,
  ): Promise<Merchant> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete merchant by id' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
