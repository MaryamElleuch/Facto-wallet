import { Merchant } from 'src/merchant/merchant.entity';
import { Facture } from 'src/facture/facture.entity';
import { OperationParam } from 'src/operation/operation-param.entity';
import { Wallet } from 'src/wallet/wallet.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  ordreNumber: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  fixedAmount: number | null;

  @OneToMany(() => Facture, (facture) => facture.product)
  factures: Facture[];

  @OneToMany(() => Wallet, (wallet) => wallet.product)
  wallets: Wallet[];

  @OneToMany(() => OperationParam, (param) => param.product)
  params: OperationParam[];

  // 🔗 Chaque produit appartient à un marchand
  @ManyToOne(() => Merchant, (merchant) => merchant.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;
}
