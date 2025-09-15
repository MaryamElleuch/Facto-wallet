// src/operation/operation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Wallet } from 'src/wallet/wallet.entity';
import { Account } from 'src/accounts/account.entity';
import { Facture } from 'src/facture/facture.entity';
import { OperationParam } from './operation-param.entity';

@Entity()
export class Operation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serviceType: string; // LINK, UNLINK, BANK_TO_WALLET, WALLET_TO_BANK, BILLER_PAY, ...

  @Column({ nullable: true })
  accountNumber: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.operations, { nullable: true })
  wallet: Wallet;

  @ManyToOne(() => Account, (account) => account.operations, { nullable: true })
  account: Account;

  @ManyToOne(() => Facture, (facture) => facture.operations, { nullable: true })
  facture: Facture;

  @Column('json', { nullable: true })
  metadata: any;

  @OneToMany(() => OperationParam, (p) => p.operation, {
    cascade: true,
    eager: true, // pratique si tu veux les récupérer à chaque fois
  })
  params: OperationParam[];

  @CreateDateColumn()
  createdAt: Date;
}
