// src/modules/merchants/merchant.entity.ts
import { Product } from 'src/product/product.entity';
import { Wallet } from 'src/wallet/wallet.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string | null;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Product, (product) => product.merchant)
  products: Product[];

  @OneToMany(() => Wallet, (wallet) => wallet.merchant)
  wallet: Wallet;

  @Column({ nullable: true })
  code?: string;
}
