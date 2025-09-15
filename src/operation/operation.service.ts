// src/operation/operation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operation } from './operation.entity';
@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepo: Repository<Operation>,
  ) {}

  async createOperation(data: Partial<Operation>): Promise<Operation> {
    const operation = this.operationRepo.create(data);
    return this.operationRepo.save(operation);
  }

  async findAll(): Promise<Operation[]> {
    return this.operationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Operation> {
    return this.operationRepo.findOneByOrFail({ id });
  }
}
