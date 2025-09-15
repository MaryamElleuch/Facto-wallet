// src/accounts/account.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Wallet } from 'src/wallet/wallet.entity';
import { User } from 'src/users/user.entity';
import { Operation } from 'src/operation/operation.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  accountNumber: string;

  @Column({ type: 'varchar', nullable: true })
  bankCode?: string | null;

  @Column({ type: 'varchar', nullable: true })
  branchCode?: string | null;

  @Column({ type: 'varchar', nullable: true })
  accountType?: string | null;

  @Column({ type: 'varchar', nullable: true })
  countryCode?: string | null;

  @Column({ type: 'varchar', nullable: true })
  fseCode?: string | null;

  @Column({ type: 'varchar', nullable: true })
  alias?: string | null;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  user: User;

  @OneToOne(() => Wallet, (wallet) => wallet.account, { nullable: true })
  wallet?: Wallet | null;

  @OneToMany(() => Operation, (operation) => operation.account)
  operations: Operation[];
}
