// src/operation/operation-param.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  Check,
  Unique,
} from 'typeorm';
import { Operation } from './operation.entity';
import { Wallet } from 'src/wallet/wallet.entity';
import { Product } from 'src/product/product.entity';

@Entity()
@Unique(['operation', 'codeParam']) // un code par opération
@Check(`("walletId" IS NOT NULL) OR ("productId" IS NOT NULL)`) // optionnel : au moins une cible
export class OperationParam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  codeParam: string; // ex: 'productId', 'walletId', 'channel', ...

  @Column({ type: 'text', nullable: true })
  value: string | null; // valeur libre (string). Si besoin, ajoute valueNumber, valueJson, etc.

  @Column({ default: true })
  display: boolean; // afficher dans l’UI / ticket / reçu

  // rattachement à l'opération
  @ManyToOne(() => Operation, (op) => op.params, { onDelete: 'CASCADE' })
  @Index()
  operation: Operation;

  // cibles possibles du paramètre
  @ManyToOne(() => Wallet, { nullable: true, onDelete: 'SET NULL' })
  @Index()
  wallet?: Wallet | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @Index()
  product?: Product | null;
}
