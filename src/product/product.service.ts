import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async create(dto: {
    name: string;
    ordreNumber: number;
    fixedAmount?: number | null;
  }): Promise<Product> {
    // vérifier unicité par ordreNumber
    const exists = await this.repo.findOne({
      where: { ordreNumber: dto.ordreNumber },
    });
    if (exists) throw new ConflictException('ordreNumber already exists');

    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find({ relations: ['wallets'] });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['wallets'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Product not found');
  }
}
