import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './merchant.entity';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly repo: Repository<Merchant>,
  ) {}

  async create(dto: CreateMerchantDto): Promise<Merchant> {
    const exists = await this.repo.findOne({
      where: { clientId: dto.clientId },
    });
    if (exists) throw new ConflictException('clientId already exists');
    const entity = this.repo.create({
      name: dto.name ?? null,
      clientId: dto.clientId,
      clientSecret: dto.clientSecret,
      active: dto.active ?? true,
    });
    return this.repo.save(entity);
  }

  findAll(): Promise<Merchant[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Merchant> {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Merchant not found');
    return m;
  }

  async findByClientId(clientId: string): Promise<Merchant> {
    const m = await this.repo.findOne({ where: { clientId } });
    if (!m) throw new NotFoundException('Merchant not found');
    return m;
  }

  async update(id: number, dto: UpdateMerchantDto): Promise<Merchant> {
    const m = await this.findOne(id);
    if (dto.clientId && dto.clientId !== m.clientId) {
      const exists = await this.repo.findOne({
        where: { clientId: dto.clientId },
      });
      if (exists) throw new ConflictException('clientId already exists');
    }
    Object.assign(m, dto);
    return this.repo.save(m);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Merchant not found');
  }
}
