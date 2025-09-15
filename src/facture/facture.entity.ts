import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Product } from 'src/product/product.entity';
import { Operation } from 'src/operation/operation.entity';

@Entity()
export class Facture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string; // ex: "SC202411721.U329"

  @Column()
  amount: number;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, PAID, FAILED...
  @Column({ nullable: true })
  codeUO: string;

  @Column({ nullable: true })
  sector: string;

  // 🔗 Relation avec le produit
  @ManyToOne(() => Product, (product) => product.factures, { nullable: false })
  product: Product;

  // 🔗 Relation avec les opérations
  @OneToMany(() => Operation, (operation) => operation.facture, {
    cascade: true,
  })
  operations: Operation[];

  @CreateDateColumn()
  createdAt: Date;
}
