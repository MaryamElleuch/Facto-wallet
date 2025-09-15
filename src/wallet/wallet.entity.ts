import { Account } from 'src/accounts/account.entity';
import { Merchant } from 'src/merchant/merchant.entity';
import { Operation } from 'src/operation/operation.entity';
import { Product } from 'src/product/product.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}
// On déclare que cette classe représente une table dans la base de données
@Entity()
export class Wallet {
  // Clé primaire générée automatiquement (id unique)
  @PrimaryGeneratedColumn()
  id: number;

  // Colonne pour stocker le solde du portefeuille
  @Column()
  balance: number;

  @Column({ nullable: true })
  msisdn: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE, // par défaut un wallet est actif
  })
  status: WalletStatus;

  @ManyToOne(() => Merchant, (merchant) => merchant.wallet, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  merchant: Merchant;

  @OneToOne(() => Account, (account) => account.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @OneToMany(() => Operation, (operation) => operation.wallet)
  operations: Operation[];
  @ManyToOne(() => Product, (product) => product.wallets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;
}
